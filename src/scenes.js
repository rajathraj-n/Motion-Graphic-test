/*
 * scenes.js — the 30-second timeline: six scenes and their transitions.
 * Times follow the script exactly (00:00–00:04, 00:04–00:09, …).
 */
(function () {
  const FC = window.FC;
  const {
    W, H, C, clamp, lerp, seg, ease, easeOut, easeIn, smooth, rgba, rng, noise2,
    ellipsePts, spline, tracePath, layer, drawLayer, masked, wash, washField, brushStroke, ink,
    blobPts, fillBlobMask, fillWipeMask, drawPaper, granulate, glow, title, person,
  } = FC;

  // ---- editable on-screen copy (overridable from Remotion props via FC.setText)
  const DEFAULT_TEXT = {
    title: 'THE COLORS OF COURAGE',
    rani: ['RANI LAKSHMIBAI', '— 1857 —'],
    bhagat: ['BHAGAT SINGH', 'THE REVOLUTIONARY SPIRIT'],
    gandhi: ['MAHATMA GANDHI', 'THE POWER OF PEACE'],
    netaji: ['NETAJI', 'SUBHAS CHANDRA BOSE'],
    medallions: ['RANI LAKSHMIBAI', 'BHAGAT SINGH', 'MAHATMA GANDHI', 'NETAJI SUBHAS\nCHANDRA BOSE'],
    date: '15 AUGUST 1947',
    finalTitle: 'THEIR COURAGE. OUR FREEDOM.',
    finalLine: "A TRIBUTE TO INDIA'S FREEDOM FIGHTERS",
  };
  FC.DEFAULT_TEXT = DEFAULT_TEXT;
  FC.setText = (obj) => { FC.TEXT = obj; };
  const TX = () => (FC.TEXT ? { ...DEFAULT_TEXT, ...FC.TEXT } : DEFAULT_TEXT);

  const INK = [34, 26, 22];
  const SAFFRON = [234, 136, 44], WHITE = [246, 241, 230], GREEN = [34, 128, 54], NAVY = [24, 34, 112];
  const TAU = Math.PI * 2;

  /** Parallax camera: zoom about (fx,fy), pan by (px,py), scaled by layer depth d. */
  function cam(c, k, d) {
    const z = 1 + (k.z - 1) * d;
    c.translate(k.fx, k.fy);
    c.scale(z, z);
    c.translate(-k.fx - k.px * d, -k.fy - k.py * d);
  }
  const withCam = (c, k, d, fn) => { c.save(); cam(c, k, d); fn(c); c.restore(); };

  // Typography presets
  const F = {
    big: (px) => `700 ${px}px Cinzel, "Trajan Pro", Georgia, serif`,
    mid: (px) => `500 ${px}px Cinzel, Georgia, serif`,
    ital: (px) => `italic 500 ${px}px "Cormorant Garamond", Georgia, serif`,
  };

  // Placement of a pre-rendered bust (head centre hx,hy; k = canvas scale)
  function drawBust(c, img, hx, hy, k) {
    const B = FC.BUST;
    c.drawImage(img, hx - B.BX * k, hy - B.BY * k, B.BW * k, B.BH * k);
  }
  const bustInk = (hx, hy, k) => ({ x: hx, y: hy, s: FC.BUST.BS * k });

  /** Animated figure → scratch canvas: flat fills, pigment texture, ink. */
  function animFig(ctx, idx, fig, place, k, depth, maskFn, alpha = 1) {
    masked(ctx, idx, (c) => {
      cam(c, k, depth);
      c.translate(place.x, place.y);
      if (place.rot) c.rotate(place.rot);
      c.scale(place.s, place.s);
      const o = { x: 0, y: 0, s: 1 };
      if (fig.fillsBack) { FC.fastFig(c, { fills: fig.fillsBack }, o); }
      if (fig.back) { FC.fastFig(c, { fills: fig.back }, o); }
      FC.fastFig(c, fig, o);
      c.save(); c.setTransform(FC.getScale(), 0, 0, FC.getScale(), 0, 0); granulate(c, 0.7); c.restore();
      for (const [i, l] of fig.lines.entries()) ink(c, l.pts, { width: l.w || 1.5, color: l.color || INK, alpha: 0.8, seed: i + 1, taper: false });
    }, maskFn || ((c) => { c.fillStyle = '#000'; c.fillRect(0, 0, W, H); }), alpha);
  }

  // ============================================================ SCENE 1 ===
  // India outline (lon, lat), simplified, following the official boundary.
  const INDIA = [
    [74.5, 37.05], [75.6, 36.8], [77.0, 35.7], [78.2, 35.5], [79.6, 35.6], [80.3, 35.3], [80.1, 34.4], [79.2, 33.0], [78.8, 31.6],
    [79.7, 30.9], [80.6, 30.4], [80.1, 28.8], [81.5, 27.9], [83.3, 27.4], [84.6, 27.3], [86.0, 26.6], [88.1, 26.4],
    [88.1, 27.6], [88.8, 28.0], [88.9, 27.2], [89.8, 26.8], [91.6, 26.8], [92.1, 26.9], [91.7, 27.8], [93.0, 28.6],
    [94.6, 29.3], [96.0, 29.4], [97.3, 28.3], [96.2, 27.3], [95.2, 26.6], [94.6, 25.4], [94.2, 24.0], [93.4, 23.0],
    [92.7, 22.0], [92.3, 23.6], [91.8, 24.1], [91.3, 23.3], [91.5, 24.6], [92.3, 24.9], [90.0, 25.2], [89.8, 25.9],
    [88.5, 26.4], [88.6, 25.3], [88.1, 24.6], [88.8, 24.2], [88.7, 23.0], [89.0, 22.0], [88.2, 21.6], [87.0, 21.5],
    [86.5, 20.4], [85.0, 19.3], [84.0, 18.2], [82.3, 16.6], [81.1, 15.8], [80.2, 15.0], [80.3, 13.3], [79.8, 11.5],
    [79.8, 10.3], [79.0, 9.3], [78.2, 8.9], [77.5, 8.1], [76.6, 8.9], [76.0, 10.4], [75.4, 12.0], [74.7, 13.5],
    [74.0, 15.5], [73.4, 17.0], [72.9, 19.0], [72.7, 20.8], [72.6, 22.2], [72.3, 21.5], [71.0, 20.8], [69.9, 21.6],
    [69.0, 22.4], [70.3, 22.9], [69.6, 22.9], [68.4, 23.6], [68.7, 24.3], [70.0, 24.2], [71.0, 24.4], [70.6, 25.7],
    [70.0, 26.7], [70.8, 27.8], [72.2, 28.4], [73.4, 29.9], [74.6, 31.0], [75.3, 32.2], [74.2, 32.9], [73.6, 33.4],
    [73.4, 34.4], [72.6, 35.0], [71.9, 36.0], [72.8, 36.8],
  ];
  const MAPC = { x: 960, y: 455, k: 20.5 };
  const proj = ([lon, lat]) => [MAPC.x + (lon - 82.8) * MAPC.k * 0.93, MAPC.y - (lat - 22.6) * MAPC.k];

  const S1 = {
    start: 0, end: 4,
    init() {
      const outline = spline(INDIA.map(proj), 3, true);
      this.outline = outline.concat([outline[0]]);
      this.grid = [];
      for (const lat of [10, 20, 30]) this.grid.push(spline([[66, lat], [82, lat + 0.15], [99, lat]].map(proj), 10));
      for (const lon of [70, 80, 90]) this.grid.push(spline([[lon, 5], [lon + 0.1, 22], [lon, 39]].map(proj), 10));
      this.tropic = spline([[64, 23.44], [100, 23.44]].map(proj), 2);
      this.bg = layer((c) => {
        washField(c, -160, -160, W + 320, H + 320, [214, 172, 104], { seed: 3, count: 14, size: 0.4, alpha: 0.035 });
        washField(c, -160, 500, W + 320, 700, [170, 116, 66], { seed: 5, count: 8, size: 0.35, alpha: 0.03 });
      });
      this.fill = layer((c) => {
        const poly = INDIA.map(proj);
        wash(c, poly, [222, 168, 78], { seed: 21, layers: 16, alpha: 0.05, crisp: 0.28, variance: 0.03, edgeAlpha: 0.3 });
        wash(c, poly.map(([x, y]) => [lerp(x, 960, 0.25), lerp(y, 470, 0.25)]), [196, 120, 52], { seed: 22, layers: 10, alpha: 0.04, variance: 0.06, edgeAlpha: 0.05 });
      });
      this.stroke = layer((c) => {
        brushStroke(c, [[-120, 800], [400, 690], [960, 545], [1500, 400], [2040, 270]], 190, SAFFRON, { seed: 8, alpha: 0.075, crisp: 0.3, bristles: 40 });
      });
      this.crowd = layer((c) => {
        const r = rng(77);
        for (let i = 0; i < 46; i++) {
          const x = -120 + i * 47 + r.range(-15, 15), s = r.range(0.62, 0.85);
          person(c, x, 1085 + r.range(0, 40), s, r.range(0, 6), r.pick(['walker', 'protester', 'walker', 'banner']), [96, 64, 40], 0.5);
        }
      });
    },
    draw(c, lt) {
      const k = { z: 1 + 0.07 * ease(seg(lt, 0, 4.5)), fx: 960, fy: 470, px: 0, py: 0 };
      withCam(c, k, 0.3, () => drawPaper(c));
      // background sepia / gold
      masked(c, 0, (s) => { cam(s, k, 0.5); drawLayer(s, this.bg); }, (s) => fillBlobMask(s, 960, 470, 1400 * easeOut(seg(lt, 1.0, 2.8)), 4, 0.3));
      // ink drop
      if (lt < 0.5) {
        const p = seg(lt, 0.05, 0.46);
        c.save(); cam(c, k, 1);
        c.fillStyle = rgba(INK, 0.15 * p);
        c.beginPath(); c.ellipse(960 + 24 * (1 - p), 470 + 30 * (1 - p), 14 + 8 * (1 - p), 12 + 8 * (1 - p), 0, 0, TAU); c.fill();
        const r = lerp(34, 11, easeIn(p));
        c.fillStyle = rgba(INK, 0.3 + 0.7 * p);
        c.beginPath(); c.ellipse(960, 470 - 22 * (1 - p), r, r * 1.08, 0, 0, TAU); c.fill();
        c.fillStyle = `rgba(255,255,255,${0.35 * p})`;
        c.beginPath(); c.arc(960 - r * 0.35, 470 - 22 * (1 - p) - r * 0.35, r * 0.22, 0, TAU); c.fill();
        c.restore();
      }
      c.save(); cam(c, k, 1);
      // ink bloom → stains
      if (lt >= 0.42) {
        const r = 170 * easeOut(seg(lt, 0.42, 1.6));
        const fade = 1 - 0.92 * seg(lt, 1.15, 2.3);
        const rr = rng(12);
        for (let i = 0; i < 9; i++) {
          const a = rr.range(0, TAU), d = r * rr.range(1.1, 1.9);
          c.fillStyle = rgba([150, 104, 60], 0.12 * fade);
          tracePath(c, blobPts(960 + Math.cos(a) * d, 470 + Math.sin(a) * d, r * rr.range(0.12, 0.32), 40 + i, 0.4, 40));
          c.fill();
        }
        for (let i = 0; i < 7; i++) {
          c.fillStyle = rgba(INK, (i === 0 ? 0.1 : 0.16) * fade);
          tracePath(c, blobPts(960, 470, r * (1.05 - i * 0.13), 3 + i * 0.21, 0.3, 90, lt * 0.2));
          c.fill();
        }
        for (let i = 0; i < 6; i++) {
          const a = rr.range(0, TAU), d = r * rr.range(1.15, 1.5);
          c.fillStyle = rgba(INK, 0.6 * fade);
          c.beginPath(); c.arc(960 + Math.cos(a) * d, 470 + Math.sin(a) * d, rr.range(2, 6) * seg(lt, 0.42, 0.6), 0, TAU); c.fill();
        }
      }
      c.restore();
      // golden fill of the subcontinent
      masked(c, 0, (s) => { cam(s, k, 1); drawLayer(s, this.fill); }, (s) => fillBlobMask(s, 960, 470, 520 * easeOut(seg(lt, 1.35, 2.5)), 9, 0.3));
      glow(c, 960, 470, 520, [255, 200, 110], 0.55 * seg(lt, 1.6, 2.8));
      // saffron brush sweep (multiplied so the map reads through it)
      masked(c, 0, (s) => { cam(s, k, 1.08); drawLayer(s, this.stroke); }, (s) => fillWipeMask(s, ease(seg(lt, 2.0, 2.95)), -0.26, 3, 70, 50), 0.92, 'multiply');
      // charcoal map details and ink outline
      c.save(); cam(c, k, 1);
      this.grid.forEach((g, i) => ink(c, g, { width: 1.2, color: [70, 50, 36], alpha: 0.32, progress: seg(lt, 1.15 + i * 0.08, 2.3 + i * 0.08), seed: 50 + i, charcoal: true, taper: false }));
      ink(c, this.tropic, { width: 1, color: [90, 60, 40], alpha: 0.3, progress: seg(lt, 1.6, 2.6), seed: 60, charcoal: true });
      ink(c, this.outline, { width: 3.4, color: INK, alpha: 0.88, progress: ease(seg(lt, 0.95, 2.1)), seed: 7, taper: false });
      ink(c, this.outline, { width: 1.2, color: INK, alpha: 0.35, progress: ease(seg(lt, 1.1, 2.3)), seed: 8, charcoal: true, taper: false });
      c.restore();
      // people emerging in the background
      const cp = seg(lt, 2.3, 3.6);
      if (cp > 0) withCam(c, k, 1.25, () => drawLayer(c, this.crowd, 0, 30 * (1 - easeOut(cp)), easeOut(cp)));
      title(c, [{ text: TX().title, font: F.big(86), spacing: '10px', lh: 96, rule: true }], 960, 930, seg(lt, 2.35, 3.5), { seed: 2 });
    },
  };

  // ============================================================ SCENE 2 ===
  const S2 = {
    start: 4, end: 9,
    init() {
      this.sky = layer((c) => {
        washField(c, -160, -160, W + 320, 560, [216, 150, 92], { seed: 31, count: 12, size: 0.4, alpha: 0.05, squash: 0.6 });
        washField(c, -160, 250, W + 320, 360, [236, 190, 128], { seed: 32, count: 10, size: 0.35, alpha: 0.05, squash: 0.5 });
        washField(c, -160, -160, W + 320, 300, [150, 92, 64], { seed: 33, count: 7, size: 0.35, alpha: 0.035, squash: 0.5 });
        wash(c, ellipsePts(1480, 260, 110, 110, 24), [246, 214, 150], { seed: 34, layers: 12, alpha: 0.07, crisp: 0.3, variance: 0.05 });
      });
      this.hills = layer((c) => {
        wash(c, spline([[-200, 620], [150, 545], [420, 580], [700, 520], [920, 565], [1120, 540], [1400, 565], [1720, 528], [2100, 575], [2100, 760], [-200, 760]], 4, true), [160, 112, 78], { seed: 35, layers: 14, alpha: 0.05, crisp: 0.25, variance: 0.03 });
      });
      // Jhansi fort on its rocky hill
      const fortShapes = [];
      const lines = [];
      const hill = spline([[760, 780], [990, 590], [1120, 540], [1320, 515], [1560, 505], [1780, 520], [1960, 560], [2080, 640], [2080, 900], [760, 900]], 4, true);
      fortShapes.push({ pts: hill, color: [150, 106, 70] });
      lines.push(spline([[860, 700], [990, 590], [1120, 540], [1320, 515], [1560, 505], [1780, 520], [1960, 560], [2080, 640]], 6));
      const merlons = (x0, x1, y, w = 16, gap = 14) => {
        const pts = [[x0, y]];
        for (let x = x0; x + w <= x1; x += w + gap) pts.push([x, y], [x, y - 14], [x + w, y - 14], [x + w, y]);
        pts.push([x1, y]);
        return pts;
      };
      const wall = [[1100, 525], [1100, 410], ...merlons(1100, 1800, 410).slice(1), [1800, 410], [1800, 525]];
      fortShapes.push({ pts: wall, color: [176, 128, 84] });
      lines.push(wall);
      for (const tx of [1110, 1330, 1580, 1795]) {
        const tw = 46, top = 360;
        const t = [[tx - tw, 530], [tx - tw, top], ...merlons(tx - tw, tx + tw, top, 13, 10).slice(1), [tx + tw, top], [tx + tw, 530]];
        fortShapes.push({ pts: t, color: [164, 116, 76] });
        lines.push(t);
        lines.push([[tx - tw + 10, 470], [tx - tw + 10, 445]], [[tx + tw - 10, 470], [tx + tw - 10, 445]]);
      }
      const keep = [[1385, 420], [1385, 300], ...merlons(1385, 1515, 300, 14, 12).slice(1), [1515, 300], [1515, 420]];
      fortShapes.push({ pts: keep, color: [182, 134, 88] });
      lines.push(keep);
      const dome = ellipsePts(1450, 298, 44, 40, 24, 0, Math.PI, TAU);
      fortShapes.push({ pts: dome.concat([[1494, 298], [1406, 298]]), color: [190, 146, 98] });
      lines.push(dome, [[1450, 258], [1450, 186]]);
      const gate = ellipsePts(1450, 492, 30, 34, 16, 0, Math.PI, TAU);
      fortShapes.push({ pts: [[1420, 528], ...gate, [1480, 528]], color: [70, 46, 32] });
      lines.push([[1420, 528], ...gate, [1480, 528]]);
      for (let x = 1160; x < 1780; x += 64) if (Math.abs(x - 1450) > 70) lines.push(ellipsePts(x, 455, 7, 10, 8, 0, Math.PI, TAU));
      this.fortLines = lines.map((l) => (l.length > 3 ? l : spline(l, 4)));
      this.fort = layer((c) => {
        fortShapes.forEach((s, i) => wash(c, s.pts, s.color, { seed: 60 + i, layers: 10, alpha: 0.06, crisp: 0.55, variance: 0.01, edgeAlpha: 0.2, baseDepth: 1, depth: 2 }));
        wash(c, [[1100, 410], [1800, 410], [1800, 530], [1100, 530]], [120, 80, 50], { seed: 70, layers: 6, alpha: 0.03, variance: 0.08 });
        granulate(c, 0.5);
      });
      this.soldiers = layer((c) => {
        const r = rng(9);
        for (let i = 0; i < 22; i++) person(c, 60 + i * 34 + r.range(-8, 8), 730 + r.range(-6, 6), r.range(0.42, 0.5), r.range(0, 6), 'spearman', [104, 68, 44], 0.42);
        for (let i = 0; i < 16; i++) person(c, 1180 + i * 38 + r.range(-8, 8), 700 + r.range(-4, 4), r.range(0.34, 0.4), r.range(0, 6), 'spearman', [120, 80, 52], 0.32);
      });
      this.ground = layer((c) => {
        washField(c, -160, 640, W + 320, 600, [182, 132, 82], { seed: 41, count: 14, size: 0.35, alpha: 0.06, squash: 0.45 });
        washField(c, -160, 820, W + 320, 420, [140, 94, 58], { seed: 42, count: 8, size: 0.3, alpha: 0.05, squash: 0.4 });
        const r = rng(43);
        for (let i = 0; i < 40; i++) { const x = r.range(-100, W + 100), y = r.range(760, 1150); ink(c, spline([[x, y], [x + r.range(30, 90), y + r.range(-4, 4)]], 4), { width: r.range(1, 2.4), color: [96, 64, 40], alpha: 0.35, seed: i }); }
      });
      this.fore = layer((c) => {
        wash(c, spline([[-200, 1000], [120, 960], [380, 1010], [520, 1100], [520, 1260], [-200, 1260]], 4, true), [92, 62, 40], { seed: 45, layers: 12, alpha: 0.06, crisp: 0.3, variance: 0.06 });
        wash(c, spline([[1500, 1100], [1700, 990], [1980, 960], [2100, 1000], [2100, 1260], [1500, 1260]], 4, true), [92, 62, 40], { seed: 46, layers: 12, alpha: 0.06, crisp: 0.3, variance: 0.06 });
      });
    },
    draw(c, lt) {
      const tr = ease(seg(lt, 0, 5));
      const k = { z: 1 + 0.06 * tr, fx: 960, fy: 600, px: lerp(-50, 60, tr), py: lerp(25, -20, tr) };
      withCam(c, k, 0.15, () => drawPaper(c));
      const reveal = (s) => fillBlobMask(s, 700, 520, 2300 * easeOut(seg(lt, -0.35, 1.0)), 14, 0.3);
      masked(c, 0, (s) => {
        withCam(s, k, 0.15, () => drawLayer(s, this.sky));
        withCam(s, k, 0.3, () => drawLayer(s, this.hills));
        withCam(s, k, 0.85, () => drawLayer(s, this.ground));
      }, reveal);
      // fort: ink first, then pigment
      masked(c, 0, (s) => withCam(s, k, 0.45, () => drawLayer(s, this.fort)), (s) => { cam(s, k, 0.45); fillBlobMask(s, 1450, 450, 720 * easeOut(seg(lt, 0.45, 1.5)), 17, 0.3); });
      c.save(); cam(c, k, 0.45);
      const n = this.fortLines.length;
      this.fortLines.forEach((l, i) => ink(c, l, { width: 2, color: [60, 38, 26], alpha: 0.75, progress: seg(lt, 0.05 + (i / n) * 0.6, 0.55 + (i / n) * 0.6), seed: i, taper: false }));
      // pennant
      const fp = seg(lt, 1.0, 1.4);
      if (fp > 0) {
        c.fillStyle = rgba([186, 70, 40], 0.85 * fp);
        c.beginPath(); c.moveTo(1450, 188);
        for (let i = 0; i <= 6; i++) c.lineTo(1450 + i * 9, 190 + i * 2.4 + Math.sin(i * 0.9 - lt * 7) * 3);
        c.lineTo(1450, 218); c.closePath(); c.fill();
      }
      c.restore();
      withCam(c, k, 0.65, () => drawLayer(c, this.soldiers, 0, 0, seg(lt, 1.0, 2.0)));

      // Rani Lakshmibai on horseback
      const gallop = 1 - smooth(seg(lt, 3.7, 4.55));
      const phase = lt * TAU * 1.35;
      const fig = FC.horseRider(phase, gallop, lt);
      const x = 820 + 90 * ease(seg(lt, 1.2, 4.4)), sc = 1.15;
      const place = { x, y: 900 - 152 * sc - 9 * Math.sin(2 * phase) * gallop, s: sc, rot: 0.035 * Math.sin(phase) * gallop };
      // dust kicked up
      c.save(); cam(c, k, 1);
      for (let i = 0; i < 16; i++) {
        const life = (lt * 1.6 + i / 16) % 1;
        const dx = x - 120 - life * 260 + (noise2(i, 3) - 0.5) * 120, dy = 890 - life * 40 - noise2(i, 9) * 30;
        c.fillStyle = rgba([170, 128, 86], 0.18 * (1 - life) * gallop * seg(lt, 1.2, 1.8));
        tracePath(c, blobPts(dx, dy, 18 + life * 40, i, 0.4, 24));
        c.fill();
      }
      c.restore();
      animFig(c, 2, fig, place, k, 1, (s) => { cam(s, k, 1); fillBlobMask(s, x, 680, 950 * easeOut(seg(lt, 0.85, 2.0)), 23, 0.35); });
      glow(c, x + 40 - k.px * 0.2, 470, 380, [255, 214, 140], 0.6 * seg(lt, 1.5, 2.6));
      withCam(c, k, 1.35, () => drawLayer(c, this.fore));
      title(c, [
        { text: TX().rani[0], font: F.big(62), spacing: '6px', lh: 66 },
        { text: TX().rani[1] ?? '', font: F.ital(44), spacing: '4px', lh: 44, color: 'rgb(120,50,28)' },
      ], 120, 930, seg(lt, 1.6, 2.7), { align: 'left', seed: 5 });
    },
  };

  // ============================================================ SCENE 3 ===
  const S3 = {
    start: 9, end: 14,
    init() {
      const sheets = [
        [40, 60, 540, 420, -0.06, 'INQUILAB ZINDABAD'],
        [1320, 40, 560, 400, 0.05, 'LAHORE · 1928'],
        [700, -60, 620, 360, -0.03, 'THE CALL OF THE NATION'],
        [-60, 560, 560, 520, 0.07, 'FREEDOM'],
        [1440, 520, 560, 520, -0.04, 'YOUTH OF INDIA, ARISE'],
        [420, 480, 520, 460, 0.035, 'LONG LIVE REVOLUTION'],
      ];
      this.news = layer((c) => {
        sheets.forEach(([x, y, w, h, rot, head], i) => {
          const r = rng(90 + i);
          c.save();
          c.translate(x + w / 2, y + h / 2); c.rotate(rot); c.translate(-w / 2, -h / 2);
          wash(c, [[0, 0], [w, 0], [w, h], [0, h]], [228, 214, 180], { seed: 100 + i, layers: 6, alpha: 0.08, crisp: 0.88, variance: 0.006, edgeAlpha: 0.35, baseDepth: 2, depth: 1 });
          c.fillStyle = 'rgba(40,30,22,0.72)';
          c.font = F.big(Math.min(44, (w - 40) / (head.length * 0.78)));
          c.textAlign = 'center';
          c.fillText(head, w / 2, 62);
          c.fillRect(20, 80, w - 40, 3);
          c.fillRect(20, 86, w - 40, 1);
          const cols = 3, cw = (w - 40 - (cols - 1) * 18) / cols;
          for (let col = 0; col < cols; col++) {
            for (let ly = 110; ly < h - 22; ly += 14) {
              if (r.next() < 0.06) continue;
              let xx = 20 + col * (cw + 18);
              const end = xx + cw * (r.next() < 0.1 ? r.range(0.3, 0.8) : 1);
              while (xx < end - 6) { const wl = Math.min(end - xx, r.range(8, 34)); c.fillStyle = `rgba(50,40,30,${r.range(0.25, 0.45)})`; c.fillRect(xx, ly, wl, 4); xx += wl + 6; }
            }
          }
          c.restore();
        });
        washField(c, -160, -160, W + 320, H + 320, [176, 120, 70], { seed: 130, count: 12, size: 0.4, alpha: 0.035 });
        granulate(c, 0.6);
      });
      this.pigment = layer((c) => {
        washField(c, -160, -160, W + 320, H + 320, [150, 98, 60], { seed: 140, count: 16, size: 0.4, alpha: 0.05 });
        washField(c, -160, -160, W + 320, H + 320, [196, 140, 84], { seed: 141, count: 10, size: 0.3, alpha: 0.05 });
      });
      this.fig = FC.busts.bhagat();
      this.bust = FC.bustImgs.bhagat;
      const r = rng(150);
      this.streaks = [];
      for (let i = 0; i < 30; i++) {
        const a = -Math.PI - 0.2 + (Math.PI + 0.4) * (i / 29) + r.range(-0.04, 0.04);
        const r0 = r.range(300, 360), r1 = r0 + r.range(320, 820);
        const bend = r.range(-0.08, 0.08);
        this.streaks.push({ pts: spline([[1180 + Math.cos(a) * r0, 420 + Math.sin(a) * r0], [1180 + Math.cos(a + bend) * (r0 + r1) / 2, 420 + Math.sin(a + bend) * (r0 + r1) / 2], [1180 + Math.cos(a + bend * 1.6) * r1, 420 + Math.sin(a + bend * 1.6) * r1]], 10), w: r.range(2, 6), d: r.range(0, 0.6) });
      }
      this.crowd = Array.from({ length: 30 }, (_, i) => ({
        x: i < 15 ? 80 + i * 46 + r.range(-10, 10) : 1500 + (i - 15) * 30 + r.range(-10, 10),
        y: 1100 + r.range(-20, 30), s: r.range(0.75, 1.05), ph: r.range(0, TAU), type: r.pick(['protester', 'protester', 'banner', 'walker']), d: r.range(0, 0.8),
      }));
    },
    draw(c, lt) {
      const pz = ease(seg(lt, 1.9, 4.3));
      const k = { z: 1 + 0.13 * pz, fx: 1180, fy: 400, px: 0, py: 0 };
      withCam(c, k, 0.2, () => drawPaper(c));
      // newspaper collage slides in, later dissolves into pigment
      const nIn = easeOut(seg(lt, -0.45, 0.85));
      const nOut = seg(lt, 3.95, 4.9);
      withCam(c, k, 0.35, () => drawLayer(c, this.news, lerp(-220, 0, nIn), 0, seg(lt, -0.45, 0.4) * (1 - 0.75 * nOut)));
      if (nOut > 0) masked(c, 0, (s) => withCam(s, k, 0.35, () => drawLayer(s, this.pigment)), (s) => {
        const r = rng(160);
        for (let i = 0; i < 14; i++) fillBlobMask(s, r.range(0, W), r.range(0, H), 520 * easeOut(clamp((nOut - r.range(0, 0.4)) / 0.6)), 160 + i, 0.4);
      });
      // golden light behind the portrait
      glow(c, 1180, 400, 640, [255, 206, 110], 0.75 * seg(lt, 1.0, 2.1));
      // radiating ink streaks — growing resistance
      c.save(); cam(c, k, 0.8);
      this.streaks.forEach((st, i) => ink(c, st.pts, { width: st.w, color: [70, 36, 20], alpha: 0.5, progress: easeOut(seg(lt, 2.1 + st.d, 3.3 + st.d)), seed: 200 + i }));
      c.restore();
      // protesters
      const ca = seg(lt, 1.9, 3.0);
      if (ca > 0) {
        c.save(); cam(c, k, 0.7);
        for (const p of this.crowd) {
          const a = seg(lt, 1.9 + p.d, 2.7 + p.d);
          person(c, p.x, p.y + 30 * (1 - easeOut(a)), p.s, p.ph + lt * 3.2, p.type, [72, 44, 28], 0.55 * a);
        }
        c.restore();
      }
      // portrait: watercolor fill, then charcoal & ink drawing on top
      const hx = 1180, hy = 430, bk = 1.2;
      masked(c, 2, (s) => { cam(s, k, 1); drawBust(s, this.bust, hx, hy, bk); }, (s) => { cam(s, k, 1); fillBlobMask(s, hx, hy + 120, 900 * easeOut(seg(lt, 0.85, 2.1)), 31, 0.35); });
      c.save(); cam(c, k, 1);
      FC.inkFig(c, this.fig, seg(lt, 0.0, 1.35), { ...bustInk(hx, hy, bk), charcoal: true, alpha: 0.85, wMul: 0.9 });
      c.restore();
      title(c, [
        { text: TX().bhagat[0], font: F.big(66), spacing: '6px', lh: 58 },
        { text: TX().bhagat[1] ?? '', font: F.mid(28), spacing: '7px', lh: 30, color: 'rgb(130,52,26)' },
      ], 110, 160, seg(lt, 1.4, 2.5), { align: 'left', seed: 9 });
    },
  };

  // ============================================================ SCENE 4 ===
  const S4 = {
    start: 14, end: 19,
    init() {
      this.sky = layer((c) => {
        washField(c, -160, -160, W + 320, 560, [186, 206, 214], { seed: 51, count: 12, size: 0.4, alpha: 0.05, squash: 0.5 });
        washField(c, -160, 220, W + 320, 260, [244, 222, 178], { seed: 52, count: 10, size: 0.4, alpha: 0.06, squash: 0.4 });
      });
      this.sea = layer((c) => {
        wash(c, [[-200, 420], [2100, 412], [2100, 560], [-200, 575]], [104, 148, 172], { seed: 53, layers: 16, alpha: 0.05, crisp: 0.3, variance: 0.02 });
        wash(c, [[-200, 470], [2100, 466], [2100, 560], [-200, 575]], [80, 124, 150], { seed: 54, layers: 10, alpha: 0.04, variance: 0.04 });
        const r = rng(55);
        for (let i = 0; i < 36; i++) { const x = r.range(-150, W + 150), y = r.range(430, 560); ink(c, spline([[x, y], [x + 30, y - 3], [x + 70, y]], 4), { width: 1.4, color: [60, 92, 112], alpha: 0.4, seed: i }); }
      });
      this.palms = layer((c) => {
        const palm = (x, y, h, lean) => {
          const top = [x + lean, y - h];
          ink(c, spline([[x, y], [x + lean * 0.3, y - h * 0.5], top], 8), { width: 7, color: [70, 64, 50], alpha: 0.7, seed: x });
          for (let i = 0; i < 7; i++) {
            const a = -Math.PI / 2 + (i - 3) * 0.5;
            const l = 90 + (i % 2) * 20;
            ink(c, spline([top, [top[0] + Math.cos(a) * l * 0.6, top[1] + Math.sin(a) * l * 0.4 - 10], [top[0] + Math.cos(a) * l, top[1] + Math.sin(a) * l * 0.5 + 30]], 6), { width: 5, color: [74, 96, 70], alpha: 0.65, seed: x + i });
          }
        };
        palm(1560, 590, 240, 30); palm(1660, 600, 200, -20); palm(1800, 585, 260, 40); palm(-60, 600, 230, 20); palm(60, 590, 190, -30);
        washField(c, 1450, 520, 600, 120, [110, 124, 96], { seed: 56, count: 5, size: 0.4, alpha: 0.05, squash: 0.5 });
      });
      this.shore = layer((c) => {
        wash(c, spline([[-200, 560], [400, 548], [900, 565], [1400, 552], [2100, 560], [2100, 1260], [-200, 1260]], 4, true), [214, 190, 150], { seed: 57, layers: 16, alpha: 0.05, crisp: 0.45, variance: 0.02 });
        wash(c, spline([[-200, 560], [700, 552], [1400, 562], [2100, 556], [2100, 600], [1200, 612], [-200, 604]], 4, true), [176, 160, 132], { seed: 58, layers: 10, alpha: 0.05, variance: 0.05 });
        washField(c, -160, 650, W + 320, 600, [196, 166, 120], { seed: 59, count: 12, size: 0.3, alpha: 0.04, squash: 0.4 });
        const r = rng(60);
        for (let i = 0; i < 70; i++) { const x = r.range(-150, W + 150), y = r.range(640, 1180); ink(c, spline([[x, y], [x + r.range(20, 70), y + r.range(-3, 3)]], 4), { width: r.range(0.8, 2), color: [140, 116, 84], alpha: 0.4, seed: i }); }
      });
      // charcoal trace of the standing figure
      const g = FC.gandhiWalk(0);
      this.trace = [...g.back, ...g.fills].map((f) => f.pts.concat([f.pts[0]])).concat(g.lines.map((l) => l.pts));
      const r = rng(61);
      this.followers = Array.from({ length: 16 }, (_, i) => {
        const row = i % 3;
        return { x: 760 - Math.floor(i / 3) * 150 - row * 55 + r.range(-20, 20), y: [905, 870, 840][row], s: [0.95, 0.78, 0.64][row], a: [0.72, 0.55, 0.4][row], ph: r.range(0, TAU), d: i * 0.11 };
      });
    },
    draw(c, lt) {
      const walk = Math.max(0, lt - 1.5);
      const k = { z: 1, fx: 960, fy: 540, px: 44 * walk, py: 0 };
      const gx = 900, gy = 910, gs = 1.05;
      withCam(c, k, 0.1, () => drawPaper(c));
      masked(c, 0, (s) => {
        withCam(s, k, 0.08, () => drawLayer(s, this.sky));
        withCam(s, k, 0.25, () => drawLayer(s, this.sea));
        withCam(s, k, 0.4, () => drawLayer(s, this.palms));
        withCam(s, k, 0.95, () => drawLayer(s, this.shore));
      }, (s) => fillBlobMask(s, gx, 640, 2300 * easeOut(seg(lt, 0.85, 2.2)), 41, 0.3));
      glow(c, 1300, 430, 760, [255, 214, 130], 0.7 * seg(lt, 2.3, 4.0));
      // ink circle (enso) behind Gandhi
      const ep = seg(lt, 3.85, 4.6);
      if (ep > 0) {
        const pts = ellipsePts(930, 669, 310, 310, 120, 0, -2.0, -2.0 + TAU * 0.97);
        ink(c, pts, { width: 18, color: INK, alpha: 0.85, progress: easeOut(ep), seed: 70 });
      }
      // followers on the march
      for (const f of this.followers) {
        const a = seg(lt, 1.8 + f.d, 2.5 + f.d);
        if (a <= 0) continue;
        person(c, f.x, f.y, f.s, f.ph + walk * TAU * 0.85, 'walker', [74, 64, 56], f.a * a);
      }
      // Gandhi
      const phase = walk * TAU * 0.85;
      const fig = FC.gandhiWalk(phase);
      const fillA = seg(lt, 0.55, 1.4);
      if (fillA > 0) animFig(c, 2, fig, { x: gx, y: gy, s: gs }, { z: 1, fx: 0, fy: 0, px: 0, py: 0 }, 0, (s) => fillBlobMask(s, gx + 20, gy - 230, 330 * easeOut(fillA), 43, 0.3));
      // charcoal outline drawn first, fading as the paint takes over
      const tp = seg(lt, -0.45, 0.95), ta = 1 - 0.85 * seg(lt, 1.2, 1.8);
      if (ta > 0.02) {
        c.save(); c.translate(gx, gy); c.scale(gs, gs);
        const n = this.trace.length;
        this.trace.forEach((l, i) => ink(c, l, { width: 1.6, color: INK, alpha: 0.8 * ta, progress: seg(tp, (i / n) * 0.6, (i / n) * 0.6 + 0.4), seed: i, charcoal: true }));
        c.restore();
      }
      title(c, [
        { text: TX().gandhi[0], font: F.big(62), spacing: '6px', lh: 56 },
        { text: TX().gandhi[1] ?? '', font: F.mid(28), spacing: '8px', lh: 30, color: 'rgb(56,92,110)' },
      ], 110, 150, seg(lt, 1.3, 2.4), { align: 'left', seed: 13 });
    },
  };

  // ============================================================ SCENE 5 ===
  const S5 = {
    start: 19, end: 24,
    init() {
      this.green = layer((c) => {
        washField(c, -160, -160, W + 320, H + 320, [40, 84, 58], { seed: 81, count: 18, size: 0.45, alpha: 0.07 });
        washField(c, -160, -160, W + 320, H + 320, [70, 112, 74], { seed: 82, count: 10, size: 0.35, alpha: 0.05 });
        washField(c, -160, 700, W + 320, 600, [26, 56, 38], { seed: 83, count: 8, size: 0.35, alpha: 0.06, squash: 0.5 });
        granulate(c, 0.5);
      });
      this.fig = FC.busts.netaji();
      this.bust = FC.bustImgs.netaji;
    },
    draw(c, lt) {
      const pz = ease(seg(lt, 0.9, 2.2));
      const k = { z: 1 + 0.1 * pz, fx: 760, fy: 420, px: 20 * ease(seg(lt, 0, 5)), py: 0 };
      withCam(c, k, 0.1, () => drawPaper(c));
      masked(c, 0, (s) => withCam(s, k, 0.3, () => drawLayer(s, this.green)), (s) => fillWipeMask(s, easeOut(seg(lt, -0.45, 0.85)), 0.05, 81, 120, 80));
      // rising golden light
      glow(c, 760, lerp(1000, 380, ease(seg(lt, 1.8, 3.8))), 900, [255, 196, 96], 0.7 * seg(lt, 1.8, 3.4));
      // INA soldiers marching in step
      const ma = seg(lt, 1.8, 2.6) * (1 - 0.55 * seg(lt, 3.8, 4.6));
      if (ma > 0) {
        c.save(); cam(c, k, 0.6);
        const rows = [{ y: 760, s: 0.55, a: 0.45, sp: 34 }, { y: 830, s: 0.7, a: 0.55, sp: 44 }, { y: 920, s: 0.88, a: 0.65, sp: 56 }];
        const ph = lt * TAU * 1.0;
        rows.forEach((r, ri) => {
          for (let i = 0; i < 22; i++) {
            const span = W + 400;
            const x = ((i * span) / 22 + lt * r.sp + ri * 37) % span - 200;
            person(c, x, r.y, r.s, ph, 'soldier', [18, 36, 26], r.a * ma);
          }
        });
        c.restore();
      }
      // portrait: silhouette, then fast elegant strokes of paint
      const hx = 760, hy = 430, bk = 1.2;
      const sil = seg(lt, -0.1, 0.5) * (1 - seg(lt, 0.9, 1.5));
      if (sil > 0) masked(c, 2, (s) => { cam(s, k, 1); drawBust(s, this.bust, hx, hy, bk); s.globalCompositeOperation = 'source-in'; s.setTransform(1, 0, 0, 1, 0, 0); s.fillStyle = rgba([16, 30, 22], 1); s.fillRect(0, 0, s.canvas.width, s.canvas.height); }, (s) => { s.fillStyle = '#000'; s.fillRect(0, 0, W, H); }, 0.85 * sil);
      masked(c, 2, (s) => { cam(s, k, 1); drawBust(s, this.bust, hx, hy, bk); }, (s) => fillWipeMask(s, easeOut(seg(lt, 0.35, 1.3)), -1.0, 91, 140, 70));
      c.save(); cam(c, k, 1);
      FC.inkFig(c, this.fig, seg(lt, 0.3, 1.4), { ...bustInk(hx, hy, bk), alpha: 0.85, wMul: 0.9 });
      c.restore();
      glow(c, 800 - k.px * 0.1, 400, 330, [255, 178, 90], 0.55 * seg(lt, 1.0, 2.0));
      title(c, [
        { text: TX().netaji[0], font: F.big(76), spacing: '10px', lh: 62 },
        { text: TX().netaji[1] ?? '', font: F.mid(36), spacing: '6px', lh: 36, color: 'rgb(40,82,52)' },
      ], 1480, 200, seg(lt, 1.2, 2.3), { seed: 17 });
    },
  };

  // ============================================================ SCENE 6 ===
  const FW = 1200, FH = 800;
  const S6 = {
    start: 24, end: 30,
    init() {
      const S = FC.getScale();
      const band = (y, col, seed) => {
        const cv = FC.canvas(FW * S, FH * S), x = cv.getContext('2d');
        x.scale(S, S);
        wash(x, [[0, y], [FW, y], [FW, y + FH / 3], [0, y + FH / 3]], col, { seed, layers: 14, alpha: 0.06, crisp: 0.78, variance: 0.006, edgeAlpha: 0.12, baseDepth: 2, depth: 2 });
        washField(x, 0, y, FW, FH / 3, col.map((v) => v * 0.9), { seed: seed + 1, count: 6, size: 0.3, alpha: 0.03, squash: 0.4 });
        granulate(x, 0.35);
        return cv;
      };
      this.bands = [band(0, SAFFRON, 201), band(FH / 3, WHITE, 203), band((2 * FH) / 3, GREEN, 205)];
      this.flag = FC.canvas(FW * S, FH * S);
      this.flagCtx = this.flag.getContext('2d');
      const cx = FW / 2, cy = FH / 2, R = 110;
      this.ring = ellipsePts(cx, cy, R, R, 140, 0, -Math.PI / 2, -Math.PI / 2 + TAU);
      this.spokes = Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * TAU - Math.PI / 2; return [[cx + Math.cos(a) * 8, cy + Math.sin(a) * 8], [cx + Math.cos(a) * R * 0.94, cy + Math.sin(a) * R * 0.94]]; });
      // medallions
      const names = [['RANI LAKSHMIBAI'], ['BHAGAT SINGH'], ['MAHATMA GANDHI'], ['NETAJI SUBHAS', 'CHANDRA BOSE']];
      const keys = ['rani', 'bhagat', 'gandhi', 'netaji'];
      this.meds = keys.map((key, i) => {
        const M = 420, cv = FC.canvas(M * S, M * S), x = cv.getContext('2d');
        x.scale(S, S);
        wash(x, ellipsePts(M / 2, M / 2, 168, 168, 30), [226, 196, 140], { seed: 220 + i, layers: 14, alpha: 0.07, crisp: 0.85, variance: 0.02, edgeAlpha: 0.3 });
        x.save();
        tracePath(x, blobPts(M / 2, M / 2, 158, 230 + i, 0.03));
        x.clip();
        const bk = 0.46;
        x.drawImage(FC.bustImgsInk[key], M / 2 - FC.BUST.BX * bk, M / 2 - 20 - FC.BUST.BY * bk, FC.BUST.BW * bk, FC.BUST.BH * bk);
        x.restore();
        const ring = ellipsePts(M / 2, M / 2, 163, 163, 120);
        ink(x, ring.concat([ring[0]]), { width: 4, color: [110, 70, 30], alpha: 0.85, seed: 240 + i, taper: false });
        ink(x, ellipsePts(M / 2, M / 2, 172, 172, 120), { width: 1.4, color: [150, 100, 40], alpha: 0.6, seed: 250 + i, taper: false, progress: 0.97 });
        return { cv, names: names[i] };
      });
      const r = rng(260);
      this.dust = Array.from({ length: 90 }, () => ({ x: r.range(0, W), y: r.range(0, H), r: r.range(0.8, 3), d: r.range(20, 70), ph: r.range(0, TAU) }));
    },
    drawFlag(lt) {
      const x = this.flagCtx, S = FC.getScale();
      x.setTransform(1, 0, 0, 1, 0, 0);
      x.clearRect(0, 0, this.flag.width, this.flag.height);
      x.setTransform(S, 0, 0, S, 0, 0);
      const starts = [-0.25, -0.05, 0.12];
      this.bands.forEach((b, i) => {
        const p = easeOut(seg(lt, starts[i], starts[i] + 0.6));
        if (p <= 0) return;
        x.save();
        const front = lerp(-120, FW + 120, p);
        x.beginPath(); x.moveTo(-10, -10);
        for (let j = 0; j <= 16; j++) x.lineTo(front + (noise2(j * 0.6, i * 5) - 0.5) * 120, -10 + ((FH + 20) * j) / 16);
        x.lineTo(-10, FH + 10); x.closePath(); x.clip();
        x.drawImage(b, 0, 0, FW, FH);
        x.restore();
      });
      ink(x, this.ring, { width: 7, color: NAVY, alpha: 0.95, progress: easeOut(seg(lt, 0.4, 0.95)), seed: 270, taper: false });
      this.spokes.forEach((s, i) => {
        const p = seg(lt, 0.6 + i * 0.025, 0.75 + i * 0.025);
        if (p > 0) ink(x, s, { width: 3, color: NAVY, alpha: 0.95, progress: p, seed: 280 + i, taper: false });
      });
      const hub = seg(lt, 0.55, 0.75);
      if (hub > 0) { x.fillStyle = rgba(NAVY, 0.95 * hub); x.beginPath(); x.arc(FW / 2, FH / 2, 14, 0, TAU); x.fill(); }
    },
    draw(c, lt) {
      drawPaper(c);
      this.drawFlag(lt);
      // flag: starts filling the frame, camera pulls back
      const pb = ease(seg(lt, 0.95, 3.1));
      const fs = lerp(1.75, 0.82, pb), fcx = 960, fcy = lerp(540, 380, pb);
      const fw = FW * fs, fh = FH * fs, fx = fcx - fw / 2, fy = fcy - fh / 2;
      const amp = lerp(4, 12, pb), N = 120;
      const fa = lerp(1, 0.8, pb);
      const S = FC.getScale();
      const wave = (uu) => Math.sin(uu * TAU * 1.25 - lt * 3.0) * amp * (0.25 + 0.75 * uu);
      masked(c, 0, (s) => {
        for (let i = 0; i < N; i++) {
          const u = i / N;
          s.drawImage(this.flag, u * FW * S, 0, (FW / N) * S + 1, FH * S, fx + u * fw, fy + wave(u), fw / N + 0.8, fh);
        }
        // light & shade follow the slope of the wave
        const g = s.createLinearGradient(fx, 0, fx + fw, 0);
        for (let i = 0; i <= 40; i++) {
          const u = i / 40, sl = (wave(u + 0.01) - wave(u)) / (amp * 0.05 + 1e-6);
          g.addColorStop(u, sl > 0 ? `rgba(70,45,20,${0.16 * Math.min(1, sl)})` : `rgba(255,250,235,${0.14 * Math.min(1, -sl)})`);
        }
        s.globalCompositeOperation = 'source-atop';
        s.fillStyle = g;
        s.fillRect(fx, fy - amp * 2, fw, fh + amp * 4);
      }, (s) => { s.fillRect(0, 0, W, H); }, fa);
      // pole hint once pulled back
      if (pb > 0.3) ink(c, [[fx - 10, fy - 30], [fx - 12, fy + fh + 30]], { width: 6, color: [96, 66, 40], alpha: 0.7 * seg(pb, 0.3, 1), seed: 290, taper: false });
      glow(c, 960, 420, 980, [255, 206, 120], 0.6 * seg(lt, 2.6, 4.0));
      // the four portraits fade in, in sequence
      const xs = [465, 795, 1125, 1455];
      this.meds.forEach((m, i) => {
        const a = seg(lt, 1.35 + i * 0.38, 2.05 + i * 0.38);
        if (a <= 0) return;
        const sc = lerp(0.9, 1, easeOut(a)), size = 300 * sc;
        masked(c, 0, (s) => {
          s.drawImage(m.cv, xs[i] - size / 2, 400 - size / 2, size, size);
        }, (s) => fillBlobMask(s, xs[i], 400, 210 * easeOut(a), 300 + i, 0.25));
        title(c, String(TX().medallions[i] ?? '').split('\n').map((t) => ({ text: t, font: F.mid(19), spacing: '3px', lh: 23 })), xs[i], 598, seg(lt, 1.6 + i * 0.38, 2.3 + i * 0.38), { seed: 310 + i, plateAlpha: 0.75 });
      });
      // ink dust settling
      const dl = 1 - seg(lt, 3.4, 4.6);
      if (dl > 0) {
        const fall = easeOut(seg(lt, 2.2, 4.6));
        for (const d of this.dust) {
          c.fillStyle = rgba(INK, 0.5 * dl * seg(lt, 2.2, 2.6));
          c.beginPath(); c.arc(d.x + Math.sin(d.ph + lt) * 6, d.y + d.d * fall, d.r, 0, TAU); c.fill();
        }
      }
      title(c, [{ text: TX().date, font: F.mid(34), spacing: '12px', lh: 40, color: 'rgb(120,56,24)' }], 960, 788, seg(lt, 0.9, 1.9), { seed: 320, plateAlpha: 0.7 });
      title(c, [{ text: TX().finalTitle, font: F.big(68), spacing: '8px', lh: 74, rule: true }], 960, 902, seg(lt, 4.0, 5.0), { seed: 330, plateAlpha: 0.75 });
      title(c, [{ text: TX().finalLine, font: F.ital(34), spacing: '4px', lh: 34, color: 'rgb(90,60,36)' }], 960, 966, seg(lt, 4.6, 5.4), { seed: 340, plate: false });
    },
  };

  // ========================================================= TIMELINE ====
  const SCENES = [S1, S2, S3, S4, S5, S6];
  const TRANS = [
    { at: 4, dur: 0.9, type: 'bleed', color: SAFFRON, x: 1740, y: 320 },
    { at: 9, dur: 0.8, type: 'wipe', color: INK, ang: 0.12 },
    { at: 14, dur: 0.9, type: 'dissolve', color: [246, 240, 226] },
    { at: 19, dur: 0.9, type: 'circle', color: INK, x: 930, y: 669 },
    { at: 24, dur: 1.1, type: 'tricolor' },
  ];

  function maskFor(tr, p) {
    switch (tr.type) {
      case 'bleed': return (s) => fillBlobMask(s, tr.x, tr.y, 2500 * easeIn(clamp(p)) + 1, 61, 0.35);
      case 'wipe': return (s) => fillWipeMask(s, clamp(p), tr.ang, 62, 110, 50);
      case 'dissolve': return (s) => {
        const r = rng(63);
        for (let i = 0; i < 26; i++) { const x = r.range(-100, W + 100), y = r.range(-100, H + 100), d = r.range(0, 0.45); fillBlobMask(s, x, y, 520 * easeOut(clamp((p - d) / 0.55)), 64 + i, 0.4); }
      };
      case 'circle': return (s) => fillBlobMask(s, tr.x, tr.y, 300 + 2000 * easeIn(clamp(p)), 65, 0.1);
      default: return (s) => fillWipeMask(s, clamp(p), -0.2, 66, 100, 50);
    }
  }
  function solid(col, tex = 0.5) {
    return (s) => { s.fillStyle = rgba(col); s.fillRect(-50, -50, W + 100, H + 100); granulate(s, tex); };
  }

  function drawScene(sc, c, t) {
    c.save();
    sc.draw(c, t - sc.start);
    c.restore();
  }

  function renderFrame(c, t) {
    const S = FC.getScale();
    c.setTransform(S, 0, 0, S, 0, 0);
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
    c.fillStyle = '#efe5cd';
    c.fillRect(0, 0, W, H);
    let idx = SCENES.findIndex((s) => t < s.end);
    if (idx < 0) idx = SCENES.length - 1;
    const tr = TRANS.find((r) => Math.abs(t - r.at) < r.dur / 2);
    if (tr) {
      const prev = SCENES.find((s) => s.end === tr.at), next = SCENES.find((s) => s.start === tr.at);
      const p = (t - (tr.at - tr.dur / 2)) / tr.dur;
      drawScene(prev, c, t);
      if (tr.type === 'tricolor') {
        const q = p * 1.45;
        masked(c, 1, solid(SAFFRON, 0.5), maskFor(tr, q));
        masked(c, 1, solid(WHITE, 0.3), maskFor(tr, q - 0.15));
        masked(c, 1, solid(GREEN, 0.5), maskFor(tr, q - 0.3));
        masked(c, 1, (s) => drawScene(next, s, t), maskFor(tr, q - 0.45));
      } else {
        const lead = tr.type === 'dissolve' ? 0.12 : 0.08;
        masked(c, 1, solid(tr.color, 0.6), maskFor(tr, p + lead), tr.type === 'dissolve' ? 0.7 : 0.95);
        masked(c, 1, (s) => drawScene(next, s, t), maskFor(tr, p));
      }
    } else {
      drawScene(SCENES[idx], c, t);
    }
    FC.finishFrame(c);
    // fade in from black at the very start
    if (t < 0.4) {
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
      c.fillStyle = `rgba(10,8,6,${1 - smooth(t / 0.4)})`;
      c.fillRect(0, 0, c.canvas.width, c.canvas.height);
      c.restore();
    }
  }

  async function loadPortraits() {
    FC.portraits = {};
    const names = ['rani', 'bhagat', 'gandhi', 'netaji'];
    await Promise.all(names.map((n) => new Promise((res) => {
      const img = new Image();
      img.onload = () => { FC.portraits[n] = img; res(); };
      img.onerror = () => res();
      img.src = `${FC.ASSET_BASE || ''}assets/portraits/${n}.png`;
    })));
  }

  FC.init = async function (scale) {
    FC.setScale(scale);
    await loadPortraits();
    try { await document.fonts.load(F.big(40)); await document.fonts.load(F.mid(40)); await document.fonts.load(F.ital(40)); await document.fonts.ready; } catch (e) { /* fallback fonts */ }
    FC.buildPaper();
    FC.bustImgs = {}; FC.bustImgsInk = {};
    for (const [key, fn] of Object.entries(FC.busts)) {
      const fig = fn();
      FC.bustImgs[key] = FC.renderBust(fig, false);
      FC.bustImgsInk[key] = FC.renderBust(fig, true);
    }
    for (const s of SCENES) s.init();
  };
  FC.renderFrame = renderFrame;
  FC.DURATION = 30;
  FC.SCENES = SCENES;
})();
