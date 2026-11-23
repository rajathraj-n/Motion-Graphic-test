/*
 * core.js — the watercolor engine.
 *
 * Everything is drawn in a fixed logical space of 1920×1080 and scaled to the
 * output resolution (1080p preview, 4K master). All randomness is seeded so a
 * given time `t` always produces exactly the same frame — the renderer relies
 * on that to export frame-accurate video.
 */
(function () {
  const W = 1920, H = 1080;
  const FC = (window.FC = window.FC || {});
  FC.W = W; FC.H = H;

  // ---------------------------------------------------------------- math ----
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const smooth = (t) => t * t * (3 - 2 * t);
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeIn = (t) => t * t * t;
  const mix = (c1, c2, t) => c1.map((v, i) => Math.round(lerp(v, c2[i], t)));
  const rgba = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function rng(seed) {
    const r = mulberry32(seed * 9973 + 17);
    return {
      next: r,
      range: (a, b) => a + (b - a) * r(),
      gauss() { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); },
      pick: (arr) => arr[Math.floor(r() * arr.length)],
    };
  }
  function hash(i, j) {
    let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function noise2(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y, oct = 4) {
    let s = 0, amp = 0.5, f = 1, n = 0;
    for (let i = 0; i < oct; i++) { s += amp * noise2(x * f, y * f); n += amp; amp *= 0.5; f *= 2.03; }
    return s / n;
  }

  // ------------------------------------------------------------ geometry ----
  function ellipsePts(cx, cy, rx, ry, n = 48, rot = 0, a0 = 0, a1 = Math.PI * 2) {
    const out = [], c = Math.cos(rot), s = Math.sin(rot);
    const closed = Math.abs(a1 - a0 - Math.PI * 2) < 1e-6;
    const steps = closed ? n : n - 1;
    for (let i = 0; i < n; i++) {
      const a = a0 + ((a1 - a0) * i) / steps;
      const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
      out.push([cx + x * c - y * s, cy + x * s + y * c]);
    }
    return out;
  }
  const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

  /** Catmull-Rom spline through control points → dense polyline. */
  function spline(pts, res = 8, closed = false) {
    const out = [], n = pts.length;
    if (n < 3) return pts.slice();
    const get = (i) => closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      for (let k = 0; k < res; k++) {
        const t = k / res, t2 = t * t, t3 = t2 * t;
        out.push([
          0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
          0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
        ]);
      }
    }
    if (!closed) out.push(pts[n - 1]);
    return out;
  }
  const xf = (pts, dx, dy, s = 1, sy = s) => pts.map((p) => [dx + p[0] * s, dy + p[1] * sy]);
  const mirrorX = (pts, cx) => pts.map((p) => [2 * cx - p[0], p[1]]).reverse();

  function tracePath(ctx, pts, closed = true) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    if (closed) ctx.closePath();
  }

  // ---------------------------------------------------------- canvases ------
  let SCALE = 1;
  function setScale(s) { SCALE = s; }
  function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
    return c;
  }
  /** Full-frame layer in logical coordinates, with a margin for parallax. */
  const MARGIN = 160;
  function layer(draw, margin = MARGIN) {
    const c = canvas((W + 2 * margin) * SCALE, (H + 2 * margin) * SCALE);
    const ctx = c.getContext('2d');
    ctx.scale(SCALE, SCALE);
    ctx.translate(margin, margin);
    draw(ctx);
    c.margin = margin;
    return c;
  }
  /** Draws a layer with parallax offset and depth-dependent zoom. */
  function drawLayer(ctx, lyr, dx = 0, dy = 0, alpha = 1) {
    if (alpha <= 0) return;
    const m = lyr.margin || 0;
    ctx.globalAlpha = alpha;
    ctx.drawImage(lyr, -m + dx, -m + dy, W + 2 * m, H + 2 * m);
    ctx.globalAlpha = 1;
  }

  // Scratch canvases (device pixels; contexts pre-scaled to logical space).
  const scratch = [];
  function getScratch(i) {
    if (!scratch[i] || scratch[i].width !== Math.round(W * SCALE)) {
      const c = canvas(W * SCALE, H * SCALE);
      c.ctx = c.getContext('2d');
      scratch[i] = c;
    }
    const c = scratch[i];
    c.ctx.setTransform(1, 0, 0, 1, 0, 0);
    c.ctx.globalCompositeOperation = 'source-over';
    c.ctx.globalAlpha = 1;
    c.ctx.clearRect(0, 0, c.width, c.height);
    c.ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    return c;
  }
  const blit = (ctx, c, alpha = 1, op = 'source-over') => { if (alpha <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = op; ctx.drawImage(c, 0, 0); ctx.restore(); };

  // -------------------------------------------------------- watercolor ------
  /** Recursive midpoint displacement — the classic watercolor polygon. */
  function deform(pts, depth, r, variance) {
    let p = pts;
    for (let d = 0; d < depth; d++) {
      const out = [];
      for (let i = 0; i < p.length; i++) {
        const a = p[i], b = p[(i + 1) % p.length];
        out.push(a);
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const v = variance * (a[2] === undefined ? 1 : (a[2] + b[2]) / 2);
        out.push([(a[0] + b[0]) / 2 + r.gauss() * len * v, (a[1] + b[1]) / 2 + r.gauss() * len * v, a[2] === undefined ? 1 : (a[2] + b[2]) / 2 * 0.9]);
      }
      p = out;
    }
    return p;
  }

  /**
   * Layered transparent wash. `color` is [r,g,b].
   * opts: seed, layers, alpha, variance, edge (edge darkening), crisp (solid underlay alpha)
   */
  function wash(ctx, poly, color, o = {}) {
    const r = rng(o.seed || 1);
    const layers = o.layers ?? 18, alpha = o.alpha ?? 0.05, v = o.variance ?? 0.12;
    const base = deform(poly.map((p) => [p[0], p[1], 1]), o.baseDepth ?? 2, r, v * 0.8);
    ctx.save();
    if (o.crisp) { ctx.fillStyle = rgba(color, o.crisp); tracePath(ctx, poly); ctx.fill(); }
    ctx.fillStyle = rgba(color, alpha);
    for (let i = 0; i < layers; i++) {
      tracePath(ctx, deform(base, o.depth ?? 3, r, v * 0.6));
      ctx.fill();
    }
    if (o.edge !== false) {
      const dark = color.map((c) => Math.round(c * 0.6));
      ctx.strokeStyle = rgba(dark, o.edgeAlpha ?? 0.18);
      ctx.lineWidth = o.edgeWidth ?? 1.4;
      ctx.lineJoin = 'round';
      tracePath(ctx, deform(base, 1, r, v * 0.2));
      ctx.stroke();
    }
    ctx.restore();
  }

  /** Soft cloud of washes in a region — sky, ground, backgrounds. */
  function washField(ctx, x, y, w, h, color, o = {}) {
    const r = rng(o.seed || 7);
    const n = o.count ?? 10;
    for (let i = 0; i < n; i++) {
      const cx = x + r.next() * w, cy = y + r.next() * h;
      const rx = (o.size ?? 0.35) * w * r.range(0.5, 1.2), ry = rx * r.range(0.35, 0.8) * (o.squash ?? 1);
      wash(ctx, ellipsePts(cx, cy, rx, ry, 10, r.range(-0.3, 0.3)), color, {
        seed: (o.seed || 7) * 31 + i, layers: o.layers ?? 10, alpha: o.alpha ?? 0.04,
        variance: o.variance ?? 0.18, edgeAlpha: o.edgeAlpha ?? 0.06,
      });
    }
  }

  /** A broad loaded-brush stroke along a path (list of control points). */
  function brushStroke(ctx, ctrl, width, color, o = {}) {
    const pts = spline(ctrl, 12);
    const left = [], right = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2;
      const s = i / (pts.length - 1);
      const w = width * (o.taper === false ? 1 : Math.pow(Math.sin(Math.PI * clamp(s * 0.92 + 0.04)), 0.45)) * (0.9 + 0.2 * fbm(s * 6, o.seed || 1));
      left.push([pts[i][0] + Math.cos(ang) * w / 2, pts[i][1] + Math.sin(ang) * w / 2]);
      right.push([pts[i][0] - Math.cos(ang) * w / 2, pts[i][1] - Math.sin(ang) * w / 2]);
    }
    const poly = left.concat(right.reverse());
    wash(ctx, poly, color, { seed: o.seed || 3, layers: o.layers ?? 16, alpha: o.alpha ?? 0.07, variance: o.variance ?? 0.05, crisp: o.crisp ?? 0.25, edgeAlpha: 0.22 });
    // dry-brush bristle streaks along the stroke
    const r = rng((o.seed || 3) + 99);
    ctx.save();
    ctx.lineCap = 'round';
    for (let k = 0; k < (o.bristles ?? 26); k++) {
      const off = r.range(-0.48, 0.48) * width;
      ctx.strokeStyle = rgba(color.map((c) => c * (r.next() < 0.5 ? 0.75 : 1.08)), r.range(0.05, 0.16));
      ctx.lineWidth = r.range(1, 4);
      ctx.beginPath();
      const s0 = r.range(0, 0.2), s1 = r.range(0.75, 1);
      for (let i = Math.floor(s0 * pts.length); i < s1 * pts.length; i++) {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
        const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2;
        const x = pts[i][0] + Math.cos(ang) * off, y = pts[i][1] + Math.sin(ang) * off;
        i === Math.floor(s0 * pts.length) ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
    return poly;
  }

  // ---------------------------------------------------------------- ink -----
  function cumLen(pts) {
    const L = [0];
    for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return L;
  }
  /**
   * Pressure-sensitive ink line with optional trim (progress 0..1).
   * o: width, color, alpha, progress, seed, charcoal (adds grainy doubled passes)
   */
  function ink(ctx, pts, o = {}) {
    if (!pts || pts.length < 2) return;
    const prog = o.progress ?? 1;
    if (prog <= 0) return;
    const L = pts._L || (pts._L = cumLen(pts));
    const total = L[L.length - 1], lim = total * prog;
    const w0 = o.width ?? 2.5, col = o.color ?? [30, 24, 20], a = o.alpha ?? 0.9, seed = o.seed ?? 1;
    const passes = o.charcoal ? 3 : 1;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let p = 0; p < passes; p++) {
      const jitter = o.charcoal ? 1.4 * p : 0;
      ctx.strokeStyle = rgba(col, o.charcoal ? a * (p === 0 ? 0.7 : 0.3) : a);
      for (let i = 1; i < pts.length; i++) {
        if (L[i - 1] > lim) break;
        const s = L[i] / total;
        const press = (o.taper === false ? 1 : 0.35 + 0.65 * Math.pow(Math.sin(Math.PI * clamp(s)), 0.6)) * (0.75 + 0.5 * noise2(L[i] * 0.02 + seed * 13.1, p * 7.3));
        ctx.lineWidth = Math.max(0.3, w0 * press * (o.charcoal ? (p === 0 ? 1 : 0.5) : 1));
        let bx = pts[i][0], by = pts[i][1];
        if (L[i] > lim) { const f = (lim - L[i - 1]) / (L[i] - L[i - 1] || 1); bx = lerp(pts[i - 1][0], bx, f); by = lerp(pts[i - 1][1], by, f); }
        const jx = jitter ? (noise2(i * 0.3, seed + p) - 0.5) * jitter * 2 : 0;
        const jy = jitter ? (noise2(seed + p, i * 0.3) - 0.5) * jitter * 2 : 0;
        ctx.beginPath();
        ctx.moveTo(pts[i - 1][0] + jx, pts[i - 1][1] + jy);
        ctx.lineTo(bx + jx, by + jy);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // -------------------------------------------------------------- masks -----
  /** Noisy organic blob polygon, used for bleeding reveals. */
  function blobPts(cx, cy, r, seed = 1, rough = 0.35, n = 120, t = 0) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const k = fbm(Math.cos(a) * 1.6 + seed * 3.1 + t, Math.sin(a) * 1.6 + seed * 1.7, 4);
      const k2 = noise2(Math.cos(a) * 9 + seed, Math.sin(a) * 9 - seed);
      const rr = r * (1 + rough * (k - 0.5) * 2 + rough * 0.25 * (k2 - 0.5));
      out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    return out;
  }
  /** Soft-edged blob mask (blurred edge reads like pigment soaking into paper). */
  function fillBlobMask(ctx, cx, cy, r, seed, rough = 0.35, feather = 0.12) {
    if (r <= 0) return;
    const b = clamp(r * feather * 0.06, 1.5, 9);
    ctx.save();
    ctx.filter = `blur(${(b * SCALE).toFixed(1)}px)`;
    ctx.fillStyle = '#000';
    tracePath(ctx, blobPts(cx, cy, r, seed, rough));
    ctx.fill();
    ctx.restore();
  }
  /** Mask: everything behind a noisy front line moving along direction `ang`. */
  function fillWipeMask(ctx, prog, ang, seed = 1, rough = 90, feather = 60) {
    const dx = Math.cos(ang), dy = Math.sin(ang);
    const span = Math.abs(W * dx) + Math.abs(H * dy);
    const cx = W / 2, cy = H / 2;
    const d = -span / 2 - rough - feather + prog * (span + 2 * (rough + feather));
    const nx = -dy, ny = dx, len = W + H;
    const pts = [];
    const steps = 90;
    for (let i = 0; i <= steps; i++) {
      const s = -len + (2 * len * i) / steps;
      const nz = (fbm(s * 0.004 + seed, seed * 2.3, 4) - 0.5) * 2 * rough + (noise2(s * 0.05, seed) - 0.5) * rough * 0.25;
      const along = d + nz;
      pts.push([cx + dx * along + nx * s, cy + dy * along + ny * s]);
    }
    pts.push([cx - dx * len * 2 + nx * len, cy - dy * len * 2 + ny * len]);
    pts.push([cx - dx * len * 2 - nx * len, cy - dy * len * 2 - ny * len]);
    ctx.save();
    ctx.filter = `blur(${(Math.min(9, feather * 0.12) * SCALE).toFixed(1)}px)`;
    ctx.fillStyle = '#000';
    tracePath(ctx, pts);
    ctx.fill();
    ctx.restore();
    return d;
  }
  /** Draw `drawFn` into a scratch canvas, then keep only what `maskFn` covers. */
  function masked(ctx, idx, drawFn, maskFn, alpha = 1, op = 'source-over') {
    if (alpha <= 0) return;
    const s = getScratch(idx);
    s.ctx.save();
    drawFn(s.ctx);
    s.ctx.restore();
    applyMask(s, maskFn);
    blit(ctx, s, alpha, op);
  }
  /** Accumulate mask shapes on their own canvas, then keep only covered pixels. */
  function applyMask(s, maskFn) {
    const m = getScratch(5);
    m.ctx.save();
    m.ctx.fillStyle = '#000';
    maskFn(m.ctx);
    m.ctx.restore();
    s.ctx.save();
    s.ctx.setTransform(1, 0, 0, 1, 0, 0);
    s.ctx.globalCompositeOperation = 'destination-in';
    s.ctx.drawImage(m, 0, 0);
    s.ctx.restore();
  }

  // -------------------------------------------------------------- paper -----
  let PAPER = null, GRAIN = null, BLOTCH = null;
  function buildPaper() {
    // large-scale tonal blotches from upscaled low-res noise
    const lw = 192, lh = 108;
    const low = canvas(lw, lh), lctx = low.getContext('2d');
    const id = lctx.createImageData(lw, lh);
    for (let y = 0; y < lh; y++) for (let x = 0; x < lw; x++) {
      const n = fbm(x * 0.045, y * 0.045, 5), m = fbm(x * 0.15 + 40, y * 0.15, 3);
      const k = (y * lw + x) * 4;
      const base = [239, 229, 205], dark = [214, 196, 160];
      const t = clamp((n - 0.35) * 1.6 + (m - 0.5) * 0.3);
      id.data[k] = lerp(base[0], dark[0], t); id.data[k + 1] = lerp(base[1], dark[1], t); id.data[k + 2] = lerp(base[2], dark[2], t); id.data[k + 3] = 255;
    }
    lctx.putImageData(id, 0, 0);
    PAPER = layer((ctx) => {
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(low, -MARGIN, -MARGIN, W + 2 * MARGIN, H + 2 * MARGIN);
      // paper fibres
      const r = rng(42);
      ctx.lineCap = 'round';
      for (let i = 0; i < 2600; i++) {
        const x = r.range(-MARGIN, W + MARGIN), y = r.range(-MARGIN, H + MARGIN), a = r.range(0, Math.PI), l = r.range(4, 22);
        ctx.strokeStyle = r.next() < 0.5 ? 'rgba(120,95,60,0.07)' : 'rgba(255,250,235,0.18)';
        ctx.lineWidth = r.range(0.4, 1.1);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + r.gauss() * 2, y + Math.sin(a) * l * 0.5 + r.gauss() * 2, x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke();
      }
      // foxing spots, age stains
      for (let i = 0; i < 18; i++) {
        const x = r.range(0, W), y = r.range(0, H);
        wash(ctx, ellipsePts(x, y, r.range(30, 140), r.range(20, 90), 10), [196, 168, 120], { seed: 300 + i, layers: 6, alpha: 0.025, edgeAlpha: 0.05 });
      }
    });

    // fine grain overlay (tileable, multiplied every frame)
    const gs = 512;
    GRAIN = canvas(gs, gs);
    const g = GRAIN.getContext('2d'), gd = g.createImageData(gs, gs);
    const r2 = rng(5);
    for (let i = 0; i < gs * gs; i++) {
      const x = i % gs, y = (i / gs) | 0;
      const v = 255 - (r2.next() * 26 + 18 * noise2(x * 0.5, y * 0.08) + 10 * noise2(x * 0.08, y * 0.5));
      gd.data[i * 4] = v; gd.data[i * 4 + 1] = v * 0.985; gd.data[i * 4 + 2] = v * 0.95; gd.data[i * 4 + 3] = 255;
    }
    g.putImageData(gd, 0, 0);

    // pigment-granulation texture (applied source-atop to painted figures)
    const bw = 480, bh = 270;
    BLOTCH = canvas(bw, bh);
    const b = BLOTCH.getContext('2d'), bd = b.createImageData(bw, bh);
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      const n = fbm(x * 0.03, y * 0.03, 5), f = noise2(x * 0.6, y * 0.6);
      const k = (y * bw + x) * 4;
      const v = n * 0.8 + f * 0.2;
      if (v > 0.5) { bd.data[k] = 255; bd.data[k + 1] = 248; bd.data[k + 2] = 230; bd.data[k + 3] = (v - 0.5) * 2 * 120; }
      else { bd.data[k] = 40; bd.data[k + 1] = 25; bd.data[k + 2] = 15; bd.data[k + 3] = (0.5 - v) * 2 * 110; }
    }
    b.putImageData(bd, 0, 0);
  }
  function drawPaper(ctx, dx = 0, dy = 0) { drawLayer(ctx, PAPER, dx, dy); }
  /** Pigment texture over whatever is already on ctx (only where paint exists). */
  function granulate(ctx, strength = 1, ox = 0, oy = 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.globalAlpha = strength;
    ctx.drawImage(BLOTCH, -40 + ox, -40 + oy, W + 80, H + 80);
    ctx.restore();
  }
  function finishFrame(ctx) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const cw = ctx.canvas.width, ch = ctx.canvas.height;
    ctx.globalCompositeOperation = 'multiply';
    if (!finishFrame.pat || finishFrame.patScale !== SCALE) {
      finishFrame.pat = ctx.createPattern(GRAIN, 'repeat');
      finishFrame.patScale = SCALE;
    }
    ctx.fillStyle = finishFrame.pat;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(0, 0, cw, ch);
    ctx.globalAlpha = 1;
    // warm vignette
    const g = ctx.createRadialGradient(cw / 2, ch / 2, ch * 0.35, cw / 2, ch / 2, ch * 1.05);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(120,85,50,0.42)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, cw, ch);
    ctx.restore();
  }

  // --------------------------------------------------------------- light ----
  function glow(ctx, x, y, r, color, alpha) {
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(color, alpha));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.globalCompositeOperation = 'screen';
    const g2 = ctx.createRadialGradient(x, y, 0, x, y, r * 0.7);
    g2.addColorStop(0, rgba(color, alpha * 0.45));
    g2.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g2;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  }

  // ---------------------------------------------------------------- text ----
  /**
   * Typography with a brush-mask reveal. A soft ivory plate keeps the text
   * readable over paint (per the "keep text separate from textures" rule).
   */
  function title(ctx, lines, x, y, prog, o = {}) {
    if (prog <= 0) return;
    const align = o.align || 'center';
    const s = getScratch(3);
    const c = s.ctx;
    c.textAlign = align;
    c.textBaseline = 'alphabetic';
    let yy = y, maxW = 0;
    const metrics = [];
    for (const ln of lines) {
      c.font = ln.font;
      c.letterSpacing = ln.spacing || '0px';
      const w = c.measureText(ln.text).width;
      maxW = Math.max(maxW, w);
      metrics.push(w);
    }
    // plate
    if (o.plate !== false) {
      const ph = lines.reduce((a, l) => a + l.lh, 0);
      const px = align === 'center' ? x : align === 'left' ? x + maxW / 2 : x - maxW / 2;
      const plate = ellipsePts(px, y - lines[0].lh * 0.35 + ph / 2 - lines[0].lh * 0.25, maxW * 0.62 + 50, ph * 0.75 + 26, 16);
      wash(c, plate, o.plateColor || [246, 238, 220], { seed: o.seed || 11, layers: 12, alpha: 0.09, crisp: o.plateAlpha ?? 0.55, variance: 0.1, edge: false });
    }
    lines.forEach((ln, i) => {
      c.font = ln.font;
      c.letterSpacing = ln.spacing || '0px';
      c.fillStyle = ln.color || 'rgb(38,26,18)';
      c.fillText(ln.text, x, yy);
      if (ln.rule) {
        const w = metrics[i];
        const x0 = align === 'center' ? x - w / 2 : align === 'left' ? x : x - w;
        ink(c, spline([[x0, yy + 16], [x0 + w * 0.5, yy + 13], [x0 + w, yy + 17]], 10), { width: 2.2, color: ln.ruleColor || [150, 80, 30], alpha: 0.8, seed: 4 });
      }
      yy += ln.lh;
    });
    c.letterSpacing = '0px';
    // brush reveal from the left
    const left = (align === 'center' ? x - maxW / 2 : align === 'left' ? x : x - maxW) - 120;
    const right = left + maxW + 240;
    const front = lerp(left, right, easeOut(clamp(prog)));
    const top = y - lines[0].lh - 80, bot = yy + 40;
    applyMask(s, (m) => {
      m.filter = `blur(${(8 * SCALE).toFixed(1)}px)`;
      const pts = [[left - 400, top]];
      for (let i = 0; i <= 24; i++) pts.push([front + (noise2(i * 0.5, o.seed || 1) - 0.5) * 60, top + ((bot - top) * i) / 24]);
      pts.push([left - 400, bot]);
      tracePath(m, pts);
      m.fill();
    });
    blit(ctx, s, o.alpha ?? 1);
  }

  Object.assign(FC, {
    clamp, lerp, seg, smooth, ease, easeOut, easeIn, mix, rgba, rng, noise2, fbm, hash,
    ellipsePts, rectPts, spline, xf, mirrorX, tracePath,
    setScale, getScale: () => SCALE, canvas, layer, drawLayer, getScratch, blit, MARGIN,
    deform, wash, washField, brushStroke, ink, cumLen,
    blobPts, fillBlobMask, fillWipeMask, masked,
    buildPaper, drawPaper, granulate, finishFrame, glow, title,
  });
})();
