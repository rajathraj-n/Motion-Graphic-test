/*
 * ui.js — 2D drawing kit for the illustrative software interfaces and the
 * kinetic typography. Everything here draws into panel pixel space.
 * The UI is conceptual: labels are generic, and charts carry no claimed
 * business figures (per the brief: no invented statistics or client names).
 */
(function () {
  const FC = window.FC;
  const { clamp, lerp, seg, ease, easeOut, easeOutQuint, easeOutExpo, rgba } = FC;
  const O = '#F06023', Y = '#FFD600', K = '#171717', G = '#F5F6F8';
  const MUTED = '#8A8F98', LINE = '#E7E9EE', SOFT = '#FFF1EA';
  const F = (w, px) => `${w} ${px}px Poppins, "Segoe UI", Arial, sans-serif`;
  const UI = { O, Y, K, G, MUTED, LINE, SOFT, F };

  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  UI.rr = rr;
  UI.card = (c, x, y, w, h, o = {}) => {
    c.save();
    if (o.shadow !== false) { c.shadowColor = 'rgba(23,23,23,0.08)'; c.shadowBlur = o.blur ?? 18; c.shadowOffsetY = o.dy ?? 6; }
    rr(c, x, y, w, h, o.r ?? 14);
    c.fillStyle = o.fill || '#FFFFFF';
    c.fill();
    c.restore();
    if (o.stroke !== false) { rr(c, x + 0.5, y + 0.5, w - 1, h - 1, o.r ?? 14); c.strokeStyle = o.stroke || LINE; c.lineWidth = o.lw || 1; c.stroke(); }
  };
  UI.text = (c, s, x, y, o = {}) => {
    c.font = F(o.w || 500, o.size || 14);
    c.fillStyle = o.color || K;
    c.textAlign = o.align || 'left';
    c.textBaseline = o.base || 'alphabetic';
    c.letterSpacing = o.ls || '0px';
    const prev = c.globalAlpha;
    c.globalAlpha = prev * (o.alpha ?? 1);
    c.fillText(s, x, y);
    c.globalAlpha = prev;
    c.letterSpacing = '0px';
  };
  UI.pill = (c, s, x, y, o = {}) => {
    c.font = F(o.w || 500, o.size || 11);
    const tw = c.measureText(s).width, h = (o.size || 11) + 10, w = tw + 20 + (o.dot ? 12 : 0);
    rr(c, x, y, w, h, h / 2);
    c.fillStyle = o.bg || SOFT; c.fill();
    if (o.dot) { c.fillStyle = o.color || O; c.beginPath(); c.arc(x + 12, y + h / 2, 3.2, 0, Math.PI * 2); c.fill(); }
    UI.text(c, s, x + 10 + (o.dot ? 12 : 0), y + h / 2 + 0.5, { size: o.size || 11, color: o.color || O, w: o.w || 500, base: 'middle' });
    return w;
  };
  UI.bar = (c, x, y, w, h, color = LINE, r) => { rr(c, x, y, w, h, r ?? h / 2); c.fillStyle = color; c.fill(); };
  /** Placeholder text lines (skeleton) for secondary UI copy. */
  UI.lines = (c, x, y, widths, gap = 12, h = 6, color = '#E9EBF0') => widths.forEach((w, i) => UI.bar(c, x, y + i * gap, w, h, color));
  UI.avatar = (c, x, y, r, color = '#FFD9C7', ini) => {
    c.fillStyle = color; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    if (ini) UI.text(c, ini, x, y + 0.5, { size: r * 0.8, w: 600, color: O, align: 'center', base: 'middle' });
  };
  UI.divider = (c, x, y, w) => { c.fillStyle = LINE; c.fillRect(x, y, w, 1); };

  // ------------------------------------------------------------ charts ----
  const SERIES = [0.32, 0.38, 0.35, 0.47, 0.44, 0.55, 0.52, 0.63, 0.6, 0.71, 0.69, 0.8];
  UI.SERIES = SERIES;
  /** Smooth line chart drawn on from left to right (p 0..1). */
  UI.lineChart = (c, x, y, w, h, p = 1, o = {}) => {
    const data = o.data || SERIES;
    if (o.grid !== false) for (let i = 0; i <= 3; i++) UI.divider(c, x, y + (h * i) / 3, w);
    const pts = data.map((v, i) => [x + (w * i) / (data.length - 1), y + h - v * h]);
    const n = pts.length - 1, upto = p * n;
    const path = (fill) => {
      c.beginPath();
      c.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i <= Math.ceil(upto) && i <= n; i++) {
        const a = pts[i - 1], bb = pts[i];
        const f = Math.min(1, upto - (i - 1));
        const mx = (a[0] + bb[0]) / 2;
        if (f >= 1) c.bezierCurveTo(mx, a[1], mx, bb[1], bb[0], bb[1]);
        else { const ex = lerp(a[0], bb[0], f), ey = lerp(a[1], bb[1], ease(f)); c.lineTo(ex, ey); }
      }
      if (fill) { const lx = x + (w * Math.min(upto, n)) / n; c.lineTo(lx, y + h); c.lineTo(x, y + h); c.closePath(); }
    };
    if (p <= 0) return;
    const g = c.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, 'rgba(240,96,35,0.22)'); g.addColorStop(1, 'rgba(240,96,35,0)');
    path(true); c.fillStyle = g; c.fill();
    path(false); c.strokeStyle = o.color || O; c.lineWidth = o.lw || 2.6; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke();
    const k = Math.min(Math.floor(upto), n), f = upto - k;
    const hx = k < n ? lerp(pts[k][0], pts[k + 1][0], f) : pts[n][0], hy = k < n ? lerp(pts[k][1], pts[k + 1][1], ease(f)) : pts[n][1];
    c.fillStyle = '#fff'; c.beginPath(); c.arc(hx, hy, 5, 0, Math.PI * 2); c.fill();
    c.strokeStyle = o.color || O; c.lineWidth = 2.4; c.stroke();
  };
  UI.bars = (c, x, y, w, h, p = 1, o = {}) => {
    const data = o.data || [0.45, 0.62, 0.5, 0.74, 0.66, 0.85, 0.78];
    const n = data.length, gap = w / n, bw = gap * (o.fat || 0.52);
    data.forEach((v, i) => {
      const k = easeOutQuint(clamp((p * (n + 2) - i) / 3));
      const bh = v * h * k;
      UI.bar(c, x + i * gap + (gap - bw) / 2, y + h - bh, bw, bh, i === (o.hi ?? n - 2) ? O : (o.color || '#FFD2BD'), Math.min(6, bw / 2));
    });
  };
  UI.ring = (c, x, y, r, p, o = {}) => {
    c.lineCap = 'round';
    c.lineWidth = o.lw || 9;
    c.strokeStyle = o.track || '#F1F2F5';
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke();
    if (p > 0) { c.strokeStyle = o.color || O; c.beginPath(); c.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(p)); c.stroke(); }
  };
  UI.spark = (c, x, y, w, h, seed = 1, color = O) => {
    c.beginPath();
    for (let i = 0; i <= 10; i++) { const v = 0.5 + 0.3 * Math.sin(i * 0.9 + seed) + i * 0.02; const px = x + (w * i) / 10, py = y + h - v * h; i ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.strokeStyle = color; c.lineWidth = 2; c.lineJoin = 'round'; c.stroke();
  };

  // ------------------------------------------------------------- icons ----
  /** Line icons on a 24-unit grid, drawn at (x,y) with size s. */
  UI.icon = (c, name, x, y, s = 24, color = K, lw = 1.8) => {
    c.save();
    c.translate(x, y); c.scale(s / 24, s / 24);
    c.strokeStyle = color; c.fillStyle = color; c.lineWidth = lw * 24 / s * (s / 24); c.lineCap = 'round'; c.lineJoin = 'round';
    c.lineWidth = lw;
    const P = new Path2D(ICONS[name] || ICONS.dot);
    c.stroke(P);
    c.restore();
  };
  const ICONS = {
    chart: 'M4 20V10M10 20V4M16 20v-7M21 20H3',
    trend: 'M3 17l6-6 4 4 8-8M15 7h6v6',
    flow: 'M5 6h4v4H5zM15 14h4v4h-4zM7 10v4a2 2 0 0 0 2 2h6',
    grid: 'M4 4h16v16H4zM4 10h16M4 15h16M10 4v16',
    users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c0-4 3-6 7-6s7 2 7 6M17 3a4 4 0 0 1 0 8M22 21c0-3-2-5-4-5.5',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.5-7 8-7s8 3 8 7',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1',
    spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
    db: 'M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6',
    cloud: 'M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9a4.5 4.5 0 0 0 1 9z',
    shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
    shieldCheck: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM8.5 12l2.5 2.5 4.5-5',
    lock: 'M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    warn: 'M12 4l9 16H3zM12 10v4M12 17v.5',
    file: 'M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6',
    eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    home: 'M3 11l9-7 9 7M5 10v10h14V10',
    bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5',
    layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5',
    target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01',
    server: 'M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01',
    key: 'M8 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM11 11h10M18 11v3M15 11v2',
    dot: 'M12 12h.01',
    arrow: 'M5 12h14M13 6l6 6-6 6',
    send: 'M4 12l16-8-6 16-3-7z',
  };

  // -------------------------------------------------- kinetic typography --
  /**
   * Masked slide-up reveal, word by word. p: 0..1 (enter), q: 0..1 (exit).
   */
  UI.kinetic = (c, s, x, y, p, o = {}) => {
    if (p <= 0) return;
    const size = o.size || 64, wgt = o.w || 600;
    c.save();
    c.font = F(wgt, size);
    c.letterSpacing = o.ls || '0px';
    const words = s.split(' ');
    const space = c.measureText(' ').width;
    const widths = words.map((wd) => c.measureText(wd).width);
    const total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);
    let cx = o.align === 'left' ? x : o.align === 'right' ? x - total : x - total / 2;
    const exit = o.exit || 0;
    words.forEach((wd, i) => {
      const k = easeOutQuint(clamp(p * (1 + words.length * 0.18) - i * 0.18));
      const e = easeOutQuint(clamp(exit * (1 + words.length * 0.12) - i * 0.12));
      c.save();
      c.beginPath(); c.rect(cx - 10, y - size * 1.05, widths[i] + 20, size * 1.4); c.clip();
      c.fillStyle = o.color || K;
      c.globalAlpha = (o.alpha ?? 1) * k * (1 - e);
      c.textBaseline = 'alphabetic';
      c.fillText(wd, cx, y + (1 - k) * size * 0.9 - e * size * 0.9);
      c.restore();
      cx += widths[i] + space;
    });
    c.restore();
    return total;
  };
  /** Small caps label with tracking. */
  UI.label = (c, s, x, y, o = {}) => UI.text(c, s, x, y, { size: o.size || 13, w: o.w || 600, color: o.color || O, ls: o.ls || '3px', align: o.align, alpha: o.alpha });

  // ------------------------------------------------------------- cursor ---
  UI.cursor = (c, x, y, press = 0, alpha = 1) => {
    if (alpha <= 0) return;
    c.save();
    c.globalAlpha = alpha;
    c.translate(x, y);
    const k = 1 - 0.12 * press;
    c.scale(k * 1.15, k * 1.15);
    c.shadowColor = 'rgba(0,0,0,0.25)'; c.shadowBlur = 8; c.shadowOffsetY = 3;
    c.beginPath();
    c.moveTo(0, 0); c.lineTo(0, 22); c.lineTo(5.5, 17); c.lineTo(9.5, 26); c.lineTo(13, 24.5); c.lineTo(9, 15.8); c.lineTo(16, 15.5); c.closePath();
    c.fillStyle = K; c.fill();
    c.shadowColor = 'transparent';
    c.strokeStyle = '#fff'; c.lineWidth = 1.6; c.stroke();
    c.restore();
  };
  UI.ripple = (c, x, y, p) => {
    if (p <= 0 || p >= 1) return;
    c.save();
    c.strokeStyle = `rgba(240,96,35,${0.6 * (1 - p)})`;
    c.lineWidth = 3;
    c.beginPath(); c.arc(x, y, 8 + 34 * easeOut(p), 0, Math.PI * 2); c.stroke();
    c.restore();
  };

  // --------------------------------------------------------- light lines --
  /** Glowing orange path through screen points, drawn on to `p`, with a travelling pulse. */
  UI.glowPath = (c, pts, p = 1, o = {}) => {
    if (p <= 0 || pts.length < 2) return;
    const L = [0];
    for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    const total = L[L.length - 1], lim = total * clamp(p);
    const trace = () => {
      c.beginPath(); c.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        if (L[i] <= lim) c.lineTo(pts[i].x, pts[i].y);
        else { const f = (lim - L[i - 1]) / (L[i] - L[i - 1] || 1); c.lineTo(lerp(pts[i - 1].x, pts[i].x, f), lerp(pts[i - 1].y, pts[i].y, f)); break; }
      }
    };
    c.save();
    c.lineCap = 'round'; c.lineJoin = 'round';
    if (o.dash) c.setLineDash(o.dash);
    c.globalAlpha = o.alpha ?? 1;
    trace(); c.strokeStyle = 'rgba(240,96,35,0.18)'; c.lineWidth = (o.w || 2.5) * 5; c.stroke();
    trace(); c.strokeStyle = o.color || O; c.lineWidth = o.w || 2.5; c.stroke();
    c.setLineDash([]);
    // head + pulses
    const at = (d) => { for (let i = 1; i < pts.length; i++) if (L[i] >= d) { const f = (d - L[i - 1]) / (L[i] - L[i - 1] || 1); return [lerp(pts[i - 1].x, pts[i].x, f), lerp(pts[i - 1].y, pts[i].y, f)]; } return [pts[pts.length - 1].x, pts[pts.length - 1].y]; };
    const dot = (d, r, a) => { const [x, y] = at(d); const g = c.createRadialGradient(x, y, 0, x, y, r * 4); g.addColorStop(0, `rgba(255,214,0,${a})`); g.addColorStop(0.3, `rgba(240,96,35,${a * 0.6})`); g.addColorStop(1, 'rgba(240,96,35,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 4, 0, Math.PI * 2); c.fill(); c.fillStyle = `rgba(255,255,255,${a})`; c.beginPath(); c.arc(x, y, r * 0.7, 0, Math.PI * 2); c.fill(); };
    if (o.head !== false && p < 1) dot(lim, o.headR || 5, 1);
    if (o.pulses) for (const q of o.pulses) if (q >= 0 && q <= 1 && q * total <= lim) dot(q * total, 3.5, 0.9);
    c.restore();
  };
  /** Soft radial light. */
  UI.light = (c, x, y, r, color, a) => {
    if (a <= 0) return;
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(color, a)); g.addColorStop(1, rgba(color, 0));
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  };

  FC.UI = UI;
})();
