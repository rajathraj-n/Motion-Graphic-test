/*
 * scenes.js — In Time Tec · "Transform Complexity Into Possibility" (50 s).
 * Eight scenes on the script's timings. Every interface is illustrative:
 * generic labels, no client names, no performance figures.
 */
(function () {
  const FC = window.FC;
  const { W, H, clamp, lerp, seg, ease, easeOut, easeOutQuint, easeOutExpo, easeIn, easeInOutQuint, backOut, anim, UI, rgba } = FC;
  const { O, Y, K, G, MUTED, LINE, SOFT, F } = UI;
  const ORANGE = FC.COL.ORANGE, YELLOW = FC.COL.YELLOW;
  const TAU = Math.PI * 2;
  const BEAT = 60 / 118;

  // ================================================== shared UI chrome ===
  function base(c, w, h, a = 0.42) {
    UI.rr(c, 0, 0, w, h, 24);
    c.fillStyle = `rgba(255,255,255,${a})`;
    c.fill();
  }
  function chrome(c, w, title, icon, o = {}) {
    UI.rr(c, 22, 18, 34, 34, 10); c.fillStyle = SOFT; c.fill();
    UI.icon(c, icon, 27, 23, 24, O, 1.9);
    UI.text(c, title, 68, 42, { size: o.size || 17, w: 600 });
    if (o.pill) UI.pill(c, o.pill, w - 22 - (o.pillW || 76), 22, { dot: true, size: 11 });
    else for (let i = 0; i < 3; i++) { c.fillStyle = '#DCDFE5'; c.beginPath(); c.arc(w - 34 - i * 14, 35, 3.5, 0, TAU); c.fill(); }
    UI.divider(c, 0, 68, w);
  }

  // --------------------------------------------------- scene 1 panels ----
  const uiTrend = { w: 420, h: 280, draw(c, t, w, h) {
    base(c, w, h); chrome(c, w, 'Trends', 'trend');
    UI.lineChart(c, 26, 96, w - 52, 128, 1, { data: [0.3, 0.42, 0.36, 0.52, 0.48, 0.62, 0.58, 0.74] });
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach((d, i) => UI.text(c, d, 26 + i * ((w - 52) / 6), 252, { size: 11, color: MUTED, align: 'center' }));
  } };
  const uiFlow = { w: 520, h: 340, draw(c, t, w, h) {
    base(c, w, h); chrome(c, w, 'Workflow', 'flow', { pill: 'Active', pillW: 74 });
    const names = ['Intake', 'Review', 'Deliver'], icons = ['file', 'eye', 'send'];
    names.forEach((n, i) => {
      const x = 28 + i * 160, y = 108;
      UI.card(c, x, y, 140, 118, { r: 14 });
      UI.rr(c, x + 14, y + 14, 34, 34, 10); c.fillStyle = i === 1 ? O : SOFT; c.fill();
      UI.icon(c, icons[i], x + 19, y + 19, 24, i === 1 ? '#fff' : O, 1.9);
      UI.text(c, n, x + 14, y + 74, { size: 15, w: 600 });
      UI.lines(c, x + 14, y + 88, [96, 70], 11, 5);
      if (i < 2) { c.strokeStyle = O; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 142, y + 59); c.lineTo(x + 158, y + 59); c.stroke(); }
    });
    UI.divider(c, 28, 252, w - 56);
    UI.avatar(c, 46, 290, 14, '#FFD9C7', 'A'); UI.avatar(c, 70, 290, 14, '#FFEFA8', 'B'); UI.avatar(c, 94, 290, 14, '#E6E8EE', 'C');
    UI.lines(c, 124, 282, [150, 100], 12, 6);
    UI.pill(c, 'On track', w - 120, 278, { size: 11 });
  } };
  const uiGrid = { w: 420, h: 280, draw(c, t, w, h) {
    base(c, w, h); chrome(c, w, 'Data', 'grid');
    const cols = [26, 140, 250, 330];
    ['Source', 'Type', 'Status'].forEach((s, i) => UI.text(c, s, cols[i], 96, { size: 11, w: 600, color: MUTED }));
    for (let r = 0; r < 5; r++) {
      const y = 110 + r * 32;
      UI.divider(c, 26, y, w - 52);
      UI.bar(c, cols[0], y + 13, 78 - (r % 3) * 12, 7, '#DADDE3');
      UI.bar(c, cols[1], y + 13, 58, 7, '#E9EBF0');
      UI.pill(c, r % 3 === 1 ? 'Sync' : 'Ready', cols[2], y + 6, { size: 10, color: r % 3 === 1 ? '#9A6B00' : O, bg: r % 3 === 1 ? '#FFF6CC' : SOFT });
    }
  } };

  // ------------------------------------------------ scene 2/3 panels -----
  const drawCRM = (c, t, w, h) => {
    base(c, w, h); chrome(c, w, 'CRM · Contacts', 'users');
    const rows = [['MR', 'Lead'], ['JS', 'Active'], ['AK', 'Lead'], ['PT', 'Active']];
    rows.forEach(([ini, st], i) => {
      const y = 90 + i * 50;
      UI.avatar(c, 44, y + 18, 15, i % 2 ? '#FFEFA8' : '#FFD9C7', ini);
      UI.lines(c, 72, y + 9, [120 - i * 8, 80], 13, 6);
      UI.pill(c, st, w - 100, y + 7, { size: 10.5, color: st === 'Lead' ? O : '#555', bg: st === 'Lead' ? SOFT : '#F0F1F4' });
      if (i < 3) UI.divider(c, 26, y + 42, w - 52);
    });
  };
  const drawBoard = (c, t, w, h) => {
    base(c, w, h); chrome(c, w, 'Project Board', 'layers');
    ['To do', 'In progress', 'Done'].forEach((n, i) => {
      const x = 22 + i * ((w - 44) / 3), cw = (w - 44) / 3 - 10;
      UI.text(c, n, x + 4, 94, { size: 11.5, w: 600, color: MUTED });
      for (let k = 0; k < 3 - (i === 2 ? 1 : 0); k++) {
        const y = 106 + k * 58;
        UI.card(c, x, y, cw, 48, { r: 10, blur: 8, dy: 2 });
        UI.bar(c, x + 10, y + 12, cw * 0.62, 6, '#DADDE3');
        UI.bar(c, x + 10, y + 26, cw * 0.4, 6, '#ECEEF2');
        if (i === 1 && k === 0) UI.bar(c, x + 10, y + 37, cw * 0.3, 4, O);
      }
    });
  };
  const drawSheet = (c, t, w, h) => {
    base(c, w, h); chrome(c, w, 'Spreadsheet', 'grid');
    const x0 = 22, y0 = 84, cw = (w - 44 - 26) / 5, rh = 30;
    'ABCDE'.split('').forEach((ch, i) => UI.text(c, ch, x0 + 26 + i * cw + cw / 2, y0 + 14, { size: 11, w: 600, color: MUTED, align: 'center' }));
    for (let r = 0; r < 6; r++) {
      const y = y0 + 22 + r * rh;
      UI.text(c, String(r + 1), x0 + 10, y + 19, { size: 11, color: MUTED, align: 'center' });
      for (let k = 0; k < 5; k++) {
        c.strokeStyle = LINE; c.lineWidth = 1; c.strokeRect(x0 + 26 + k * cw, y, cw, rh);
        if ((r * 3 + k) % 4 !== 0) UI.bar(c, x0 + 34 + k * cw, y + 12, cw * (0.35 + ((r + k) % 3) * 0.15), 6, '#E3E5EA');
      }
    }
    c.strokeStyle = O; c.lineWidth = 2; c.strokeRect(x0 + 26 + 2 * cw, y0 + 22 + 2 * rh, cw, rh);
  };
  const drawReport = (c, t, w, h) => {
    base(c, w, h); chrome(c, w, 'Reports', 'chart');
    UI.bars(c, 30, 92, w - 60, 150, 1, { data: [0.42, 0.58, 0.5, 0.7, 0.62, 0.84, 0.74], hi: 5 });
    UI.divider(c, 30, 244, w - 60);
    UI.lines(c, 30, 262, [120], 12, 6);
    UI.pill(c, 'Monthly', w - 104, 252, { size: 10.5 });
  };
  const PW = 480, PH = 300;
  const uiCRM = { w: PW, h: PH, draw: drawCRM }, uiBoard = { w: PW, h: PH, draw: drawBoard }, uiSheet = { w: PW, h: PH, draw: drawSheet }, uiReport = { w: PW, h: PH, draw: drawReport };

  // unified workspace (scene 3)
  const DW = 1240, DH = 700;
  const MODS = [[490, 268], [960, 268], [490, 556], [960, 556]]; // module centres (panel px)
  const MOD_S = 432 / PW;
  const uiWorkspace = { w: DW, h: DH, dynamic: true, key: (t) => Math.round(clamp(t, 12.9, 18) * 30), draw(c, t, w, h) {
    base(c, w, h, 0.62);
    // sidebar
    c.fillStyle = 'rgba(245,246,248,0.9)'; UI.rr(c, 0, 0, 220, h, 24); c.fill(); c.fillRect(200, 0, 20, h);
    UI.rr(c, 26, 26, 38, 38, 11); c.fillStyle = O; c.fill();
    UI.icon(c, 'layers', 33, 33, 24, '#fff', 2);
    UI.text(c, 'Workspace', 76, 51, { size: 16, w: 600 });
    ['Overview', 'Customers', 'Projects', 'Data', 'Reports'].forEach((n, i) => {
      const y = 104 + i * 48;
      if (i === 0) { UI.rr(c, 16, y - 4, 188, 40, 10); c.fillStyle = '#fff'; c.fill(); }
      UI.icon(c, ['home', 'users', 'layers', 'db', 'chart'][i], 30, y + 4, 20, i === 0 ? O : MUTED, 1.8);
      UI.text(c, n, 62, y + 21, { size: 14, w: i === 0 ? 600 : 500, color: i === 0 ? K : '#5D626B' });
    });
    UI.text(c, 'Connected Workspace', 262, 64, { size: 24, w: 600 });
    UI.text(c, 'One view across teams and systems', 262, 92, { size: 13, color: MUTED, w: 400 });
    UI.pill(c, 'All systems connected', w - 230, 50, { dot: true, size: 11.5 });
    const k = seg(t, 13.15, 13.7);
    const fns = [drawCRM, drawBoard, drawSheet, drawReport];
    if (k > 0) MODS.forEach(([mx, my], i) => {
      c.save(); c.globalAlpha = k;
      c.translate(mx - (PW * MOD_S) / 2, my - (PH * MOD_S) / 2); c.scale(MOD_S, MOD_S);
      c.shadowColor = 'rgba(0,0,0,0.06)'; c.shadowBlur = 20; c.shadowOffsetY = 6;
      UI.rr(c, 0, 0, PW, PH, 22); c.fillStyle = '#fff'; c.fill(); c.shadowColor = 'transparent';
      fns[i](c, t, PW, PH);
      c.restore();
    });
    // the orange line flowing through every module
    const lp = seg(t, 13.55, 14.7);
    if (lp > 0) {
      const path = [[255, 691], [255, 412], [1195, 412], [1195, 133]].map(([x, y]) => ({ x, y }));
      const ph = (t * 0.35) % 1;
      UI.glowPath(c, path, lp, { w: 2.2, pulses: [ph, (ph + 0.33) % 1, (ph + 0.66) % 1] });
    }
  } };
  const uiTriad = (label, icon, sub) => ({ w: 320, h: 150, draw(c, t, w, h) {
    base(c, w, h, 0.5);
    UI.rr(c, 24, 26, 48, 48, 14); c.fillStyle = SOFT; c.fill();
    UI.icon(c, icon, 36, 38, 24, O, 2);
    UI.text(c, label, 88, 60, { size: 22, w: 600, ls: '2px' });
    UI.text(c, sub, 24, 116, { size: 13, w: 400, color: MUTED });
  } });
  const uiPeople = uiTriad('PEOPLE', 'users', 'Teams and expertise');
  const uiProcess = uiTriad('PROCESS', 'flow', 'Connected workflows');
  const uiTech = uiTriad('TECHNOLOGY', 'layers', 'Modern platforms');

  // --------------------------------------------------- scene 4 panels ----
  const MW = 1300, MH = 760;
  const NODES = [['INPUT DATA', 'db', 'Collected'], ['AI ANALYSIS', 'spark', 'Analyzing'], ['RECOMMENDATION', 'target', 'Prepared'], ['HUMAN REVIEW', 'user', 'Awaiting review']];
  const NX = [190, 497, 804, 1111], NY = 300, NBW = 240, NBH = 168;
  function drawAI(c, t, w, h) {
    base(c, w, h, 0.62);
    chrome(c, w, 'AI Workflow', 'spark', { size: 19, pill: t > 20.3 && t < 24.4 ? 'Running' : 'Ready', pillW: t > 20.3 && t < 24.4 ? 88 : 76 });
    UI.text(c, 'Automation  /  Review queue', 70, 106, { size: 13, w: 400, color: MUTED });
    // paths between nodes with travelling data points
    for (let i = 0; i < 3; i++) {
      const x0 = NX[i] + NBW / 2, x1 = NX[i + 1] - NBW / 2;
      const dp = seg(t, 19.0 + i * 0.25, 19.6 + i * 0.25);
      c.strokeStyle = LINE; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, NY); c.lineTo(x1, NY); c.stroke();
      if (dp > 0) { c.strokeStyle = O; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, NY); c.lineTo(lerp(x0, x1, dp), NY); c.stroke(); }
      if (t > 20 && t < 22.6) for (let k = 0; k < 3; k++) {
        const q = ((t - 20) * 0.9 + k / 3 + i * 0.13) % 1;
        const gx = lerp(x0, x1, q);
        UI.light(c, gx, NY, 14, ORANGE, 0.55); c.fillStyle = '#fff'; c.beginPath(); c.arc(gx, NY, 3.2, 0, TAU); c.fill();
      }
    }
    NODES.forEach(([name, icon, status], i) => {
      const x = NX[i] - NBW / 2, y = NY - NBH / 2;
      const hi = i === 1 ? seg(t, 20.7, 21.1) : i === 3 ? seg(t, 24.9, 25.2) : 0;
      UI.card(c, x, y, NBW, NBH, { r: 18, stroke: hi > 0.5 ? O : LINE, lw: hi > 0.5 ? 2 : 1 });
      if (hi > 0) { c.save(); c.globalAlpha = hi * 0.12; UI.rr(c, x, y, NBW, NBH, 18); c.fillStyle = O; c.fill(); c.restore(); }
      UI.rr(c, x + 18, y + 18, 44, 44, 13); c.fillStyle = i === 1 && hi > 0.5 ? O : SOFT; c.fill();
      UI.icon(c, icon, x + 28, y + 28, 24, i === 1 && hi > 0.5 ? '#fff' : O, 1.9);
      UI.text(c, name, x + 18, y + 96, { size: 14, w: 600, ls: '0.5px' });
      let st = status;
      if (i === 1 && t >= 22.2) st = 'Complete';
      if (i === 3 && t >= 25.05) st = 'Approved';
      UI.text(c, st, x + 18, y + 122, { size: 12.5, w: 400, color: i === 3 && t >= 25.05 ? '#1FA971' : MUTED });
      if (i === 1 && t > 20.3 && t < 22.2) { // processing spinner
        c.save(); c.translate(x + NBW - 36, y + 40); c.rotate(t * 6);
        c.strokeStyle = O; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0, 11, 0, Math.PI * 1.4); c.stroke(); c.restore();
      }
      if ((i === 1 && t >= 22.2) || (i === 0 && t > 19.4) || (i === 2 && t > 22.4) || (i === 3 && t >= 25.05)) {
        c.fillStyle = i === 3 ? '#1FA971' : O; c.beginPath(); c.arc(x + NBW - 36, y + 40, 11, 0, TAU); c.fill(); UI.icon(c, 'check', x + NBW - 45, y + 31, 18, '#fff', 2.4);
      }
    });
    // activity list
    UI.text(c, 'Activity', 70, 470, { size: 15, w: 600 });
    for (let r = 0; r < 4; r++) {
      const y = 492 + r * 58;
      const on = t > 19.6 + r * 0.6;
      UI.card(c, 70, y, w - 140, 46, { r: 12, blur: 6, dy: 2 });
      UI.rr(c, 84, y + 11, 24, 24, 7); c.fillStyle = on ? SOFT : '#F1F2F5'; c.fill();
      UI.icon(c, ['db', 'spark', 'target', 'user'][r], 88, y + 15, 16, on ? O : '#B9BDC5', 1.8);
      UI.bar(c, 124, y + 15, 220 - r * 26, 7, '#DADDE3'); UI.bar(c, 124, y + 28, 140, 5, '#ECEEF2');
      UI.bar(c, w - 300, y + 20, 160, 6, '#EEF0F3');
      if (on) UI.bar(c, w - 300, y + 20, 160 * clamp((t - 19.6 - r * 0.6) / 1.4), 6, O);
    }
  }
  const uiAI = { w: MW, h: MH, dynamic: true, key: (t) => Math.round(clamp(t, 18, 26.5) * 30), draw: drawAI };
  const uiSources = { w: 420, h: 260, draw(c, t, w, h) {
    base(c, w, h); chrome(c, w, 'Data sources', 'db');
    ['Documents', 'Systems', 'Forms'].forEach((s, i) => { const y = 92 + i * 52; UI.rr(c, 26, y, 30, 30, 8); c.fillStyle = SOFT; c.fill(); UI.icon(c, ['file', 'server', 'grid'][i], 31, y + 5, 20, O, 1.8); UI.text(c, s, 70, y + 20, { size: 13.5, w: 500 }); UI.pill(c, 'Linked', w - 96, y + 4, { size: 10 }); });
  } };
  const uiModel = { w: 420, h: 260, draw(c, t, w, h) {
    base(c, w, h); chrome(c, w, 'Model settings', 'gear');
    ['Confidence threshold', 'Human in the loop', 'Audit trail'].forEach((s, i) => { const y = 100 + i * 50; UI.text(c, s, 26, y + 14, { size: 13.5 }); UI.rr(c, w - 74, y, 44, 24, 12); c.fillStyle = O; c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(w - 42, y + 12, 9, 0, TAU); c.fill(); });
  } };
  const uiAnalysis = { w: 540, h: 340, dynamic: true, key: (t) => Math.round(clamp(t, 22, 24.2) * 30), draw(c, t, w, h) {
    base(c, w, h, 0.6); chrome(c, w, 'Analysis', 'chart', { pill: 'AI', pillW: 50 });
    UI.text(c, 'Trend', 26, 96, { size: 12, w: 600, color: MUTED });
    UI.lineChart(c, 26, 108, 300, 150, seg(t, 22.3, 23.2), { grid: true });
    UI.text(c, 'Volume', 26, 290, { size: 12, w: 600, color: MUTED });
    UI.bars(c, 90, 270, 236, 50, seg(t, 22.6, 23.4), { fat: 0.6 });
    UI.ring(c, 436, 170, 62, easeOut(seg(t, 22.8, 23.8)), { lw: 12 });
    UI.text(c, 'Processing', 436, 175, { size: 12.5, w: 600, align: 'center', color: MUTED });
    UI.text(c, 'Pipeline', 436, 268, { size: 12, w: 500, align: 'center', color: MUTED });
  } };
  const BTN = { x: 26, y: 112, w: 150, h: 44 };
  const uiInsight = { w: 420, h: 180, dynamic: true, key: (t) => (t < 24.95 ? 0 : 1), draw(c, t, w, h) {
    base(c, w, h, 0.7);
    UI.rr(c, 22, 22, 40, 40, 12); c.fillStyle = O; c.fill(); UI.icon(c, 'spark', 30, 30, 24, '#fff', 2);
    UI.text(c, 'Insight ready', 76, 40, { size: 16, w: 600 });
    UI.text(c, 'A recommended next step is ready for review.', 76, 62, { size: 12, w: 400, color: MUTED });
    UI.divider(c, 22, 92, w - 44);
    const done = t >= 24.95;
    UI.rr(c, BTN.x, BTN.y, BTN.w, BTN.h, 12); c.fillStyle = done ? '#1FA971' : O; c.fill();
    if (done) { UI.icon(c, 'check', BTN.x + 20, BTN.y + 11, 22, '#fff', 2.6); UI.text(c, 'Approved', BTN.x + 50, BTN.y + 28, { size: 14, w: 600, color: '#fff' }); }
    else UI.text(c, 'Review action', BTN.x + BTN.w / 2, BTN.y + 28, { size: 14, w: 600, color: '#fff', align: 'center' });
    UI.rr(c, BTN.x + BTN.w + 12, BTN.y, 110, BTN.h, 12); c.strokeStyle = LINE; c.lineWidth = 1.2; c.stroke();
    UI.text(c, 'Details', BTN.x + BTN.w + 67, BTN.y + 28, { size: 14, w: 500, color: '#5D626B', align: 'center' });
  } };

  // --------------------------------------------------- scene 5 panels ----
  function drawDash(c, t, w, h) {
    base(c, w, h, 0.7);
    c.fillStyle = 'rgba(245,246,248,0.95)'; UI.rr(c, 0, 0, 236, h, 24); c.fill(); c.fillRect(216, 0, 20, h);
    UI.rr(c, 26, 28, 40, 40, 12); c.fillStyle = O; c.fill(); UI.icon(c, 'layers', 34, 36, 24, '#fff', 2);
    UI.text(c, 'Workspace', 80, 54, { size: 17, w: 600 });
    const sel = t >= 28.5 ? 2 : 0, sk = seg(t, 28.5, 28.75);
    const items = [['Overview', 'home'], ['Workflows', 'flow'], ['Analytics', 'chart'], ['Teams', 'users'], ['Security', 'shield'], ['Settings', 'gear']];
    const hy = lerp(112, 112 + 2 * 50, ease(sk));
    UI.rr(c, 16, hy - 6, 204, 42, 11); c.fillStyle = '#fff'; c.fill();
    c.fillStyle = O; UI.rr(c, 16, hy + 4, 4, 22, 2); c.fill();
    items.forEach(([n, ic], i) => {
      const y = 112 + i * 50, on = i === sel;
      UI.icon(c, ic, 34, y + 3, 20, on ? O : MUTED, 1.8);
      UI.text(c, n, 66, y + 19, { size: 14.5, w: on ? 600 : 500, color: on ? K : '#5D626B' });
    });
    // top bar
    UI.rr(c, 270, 28, 380, 42, 12); c.fillStyle = '#fff'; c.fill(); c.strokeStyle = LINE; c.stroke();
    UI.icon(c, 'search', 284, 37, 20, MUTED, 1.8); UI.text(c, 'Search', 314, 55, { size: 13.5, w: 400, color: '#A3A8B0' });
    UI.icon(c, 'bell', w - 118, 37, 22, '#5D626B', 1.8); c.fillStyle = O; c.beginPath(); c.arc(w - 99, 40, 4, 0, TAU); c.fill();
    UI.avatar(c, w - 54, 49, 18, '#FFD9C7', 'IT');
    const k = ease(seg(t, 28.55, 29.15)); // shared-element page transition
    // page title crossfade
    c.globalAlpha = 1 - k; UI.text(c, 'Overview', 270, 130, { size: 28, w: 600 }); c.globalAlpha = k; UI.text(c, 'Analytics', 270, 130, { size: 28, w: 600 }); c.globalAlpha = 1;
    UI.text(c, 'Workflows and delivery at a glance', 270, 156, { size: 13.5, w: 400, color: MUTED });
    UI.rr(c, w - 186, 104, 150, 44, 12); c.fillStyle = O; c.fill(); UI.text(c, '+ New workflow', w - 111, 132, { size: 13.5, w: 600, color: '#fff', align: 'center' });
    // cards: the first card grows into the analytics chart (shared element)
    const cx0 = 270, cy0 = 186, cw = 310, ch = 150, gap = 22;
    const big = { x: 270, y: 186, w: w - 306, h: 330 };
    const r0 = { x: lerp(cx0, big.x, k), y: lerp(cy0, big.y, k), w: lerp(cw, big.w, k), h: lerp(ch, big.h, k) };
    ['Active workflows', 'In review', 'Releases'].forEach((n, i) => {
      if (i === 0) return;
      const x = cx0 + i * (cw + gap) + k * 80;
      c.globalAlpha = 1 - k;
      UI.card(c, x, cy0, cw, ch, { r: 16 });
      UI.text(c, n, x + 20, cy0 + 34, { size: 13.5, w: 500, color: MUTED });
      UI.spark(c, x + 20, cy0 + 60, cw - 40, 54, i * 2, i === 1 ? '#C9A400' : O);
      UI.pill(c, i === 1 ? 'Pending' : 'Scheduled', x + 20, cy0 + ch - 34, { size: 10.5 });
      c.globalAlpha = 1;
    });
    UI.card(c, r0.x, r0.y, r0.w, r0.h, { r: 16 });
    UI.text(c, k < 0.5 ? 'Active workflows' : 'Workflow throughput', r0.x + 20, r0.y + 34, { size: 13.5, w: 500, color: MUTED });
    if (k < 0.5) { c.globalAlpha = 1 - k * 2; UI.spark(c, r0.x + 20, r0.y + 60, r0.w - 40, 54, 0, O); UI.pill(c, 'Healthy', r0.x + 20, r0.y + r0.h - 34, { size: 10.5, dot: true }); c.globalAlpha = 1; }
    else { c.globalAlpha = (k - 0.5) * 2; UI.lineChart(c, r0.x + 24, r0.y + 64, r0.w * 0.62, r0.h - 100, seg(t, 28.9, 29.9)); UI.bars(c, r0.x + r0.w * 0.7, r0.y + 64, r0.w * 0.26, r0.h - 100, seg(t, 29.1, 29.9)); c.globalAlpha = 1; }
    // workflow list (slides down as the chart grows)
    const ly = lerp(360, 540, k);
    UI.text(c, 'Recent workflows', 270, ly + 10, { size: 15, w: 600 });
    for (let r = 0; r < 4; r++) {
      const y = ly + 26 + r * 54;
      if (y > h - 30) break;
      UI.card(c, 270, y, w - 306, 44, { r: 12, blur: 6, dy: 2 });
      UI.rr(c, 284, y + 10, 24, 24, 7); c.fillStyle = SOFT; c.fill(); UI.icon(c, 'flow', 288, y + 14, 16, O, 1.8);
      UI.bar(c, 322, y + 14, 200 - r * 20, 7, '#DADDE3'); UI.bar(c, 322, y + 27, 120, 5, '#ECEEF2');
      UI.pill(c, ['In review', 'Live', 'Draft', 'Live'][r], w - 160, y + 10, { size: 10.5, color: r === 2 ? '#555' : O, bg: r === 2 ? '#F0F1F4' : SOFT });
    }
  }
  const uiDash = { w: MW, h: MH, dynamic: true, key: (t) => Math.round(clamp(t, 26, 30.2) * 30), draw(c, t, w, h) {
    const x = seg(t, 26.0, 26.45);
    if (x < 1) { c.save(); c.globalAlpha = 1 - x; drawAI(c, 26, w, h); c.restore(); }
    c.save(); c.globalAlpha = x; drawDash(c, t, w, h); c.restore();
  } };
  const uiMobile = { w: 360, h: 740, dynamic: true, key: (t) => Math.round(clamp(t, 30, 32.5) * 30), draw(c, t, w, h) {
    base(c, w, h, 0.78);
    UI.text(c, '9:41', 34, 44, { size: 14, w: 600 });
    UI.rr(c, w / 2 - 50, 20, 100, 28, 14); c.fillStyle = K; c.fill();
    UI.text(c, 'Workflows', 26, 108, { size: 24, w: 600 });
    UI.text(c, 'Your day at a glance', 26, 132, { size: 12.5, w: 400, color: MUTED });
    UI.card(c, 20, 156, w - 40, 210, { r: 20 });
    UI.ring(c, w / 2, 256, 64, easeOut(seg(t, 30.8, 32.0)), { lw: 12 });
    UI.icon(c, 'flow', w / 2 - 14, 242, 28, O, 2);
    UI.text(c, 'Progress', w / 2, 352, { size: 12.5, w: 500, color: MUTED, align: 'center' });
    for (let r = 0; r < 4; r++) {
      const y = 388 + r * 66;
      UI.card(c, 20, y, w - 40, 56, { r: 14, blur: 6, dy: 2 });
      UI.rr(c, 34, y + 14, 28, 28, 8); c.fillStyle = SOFT; c.fill(); UI.icon(c, ['file', 'eye', 'send', 'check'][r], 38, y + 18, 20, O, 1.8);
      UI.bar(c, 76, y + 18, 140 - r * 14, 7, '#DADDE3'); UI.bar(c, 76, y + 32, 90, 5, '#ECEEF2');
      if (r < 2) { c.fillStyle = r === 0 ? O : Y; c.beginPath(); c.arc(w - 44, y + 28, 5, 0, TAU); c.fill(); }
    }
    UI.rr(c, w / 2 - 60, h - 22, 120, 5, 3); c.fillStyle = '#CDD0D6'; c.fill();
  } };

  // --------------------------------------------------- scene 6 panels ----
  const VW = 400, VH = 580;
  const capHead = (c, w, title, sub, icon) => {
    base(c, w, VH, 0.66);
    UI.rr(c, 28, 30, 56, 56, 16); c.fillStyle = SOFT; c.fill(); UI.icon(c, icon, 44, 46, 24, O, 2);
    UI.text(c, title, 28, 128, { size: 22, w: 600 });
    UI.text(c, sub, 28, 154, { size: 13, w: 400, color: MUTED });
    UI.divider(c, 28, 178, w - 56);
  };
  const uiData = { w: VW, h: VH, dynamic: true, key: (t) => Math.round(clamp(t, 35.6, 37.2) * 30), draw(c, t, w, h) {
    capHead(c, w, 'Data & Analytics', 'Unified, trusted data', 'db');
    const p = seg(t, 35.9, 37.0);
    const n = 3 + Math.floor(9 * p);
    UI.lineChart(c, 28, 212, w - 56, 190, 1, { data: UI.SERIES.slice(0, n) });
    for (let i = 0; i < 3; i++) { const y = 436 + i * 40; UI.bar(c, 28, y, w - 56, 8, '#EEF0F3'); UI.bar(c, 28, y, (w - 56) * [0.8, 0.62, 0.48][i] * easeOut(p), 8, i === 0 ? O : '#FFC4A8'); }
  } };
  const uiCloud = { w: VW, h: VH, dynamic: true, key: (t) => Math.round(clamp(t, 36.6, 38.0) * 30), draw(c, t, w, h) {
    capHead(c, w, 'Cloud & Modernization', 'Scalable, connected systems', 'cloud');
    const p = seg(t, 36.8, 37.8);
    const nodes = [[w / 2, 270, 'cloud'], [80, 400, 'server'], [w / 2, 440, 'db'], [w - 80, 400, 'layers'], [w / 2, 530, 'gear']];
    [[0, 1], [0, 2], [0, 3], [2, 4], [1, 2], [3, 2]].forEach(([a, b2], i) => {
      const q = clamp(p * 6 - i * 0.7);
      const A = nodes[a], B = nodes[b2];
      c.strokeStyle = LINE; c.lineWidth = 2; c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke();
      if (q > 0) { c.strokeStyle = O; c.lineWidth = 2.4; c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(lerp(A[0], B[0], q), lerp(A[1], B[1], q)); c.stroke(); }
    });
    nodes.forEach(([x, y, ic], i) => {
      const r = i === 0 ? 38 : 28;
      c.save(); c.shadowColor = 'rgba(0,0,0,0.08)'; c.shadowBlur = 12; c.shadowOffsetY = 4;
      c.fillStyle = i === 0 ? O : '#fff'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.restore();
      c.strokeStyle = i === 0 ? O : LINE; c.lineWidth = 1.2; c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke();
      UI.icon(c, ic, x - (i === 0 ? 14 : 11), y - (i === 0 ? 14 : 11), i === 0 ? 28 : 22, i === 0 ? '#fff' : O, 1.9);
    });
  } };
  const uiSec = { w: VW, h: VH, dynamic: true, key: (t) => Math.round(clamp(t, 37.3, 38.6) * 30), draw(c, t, w, h) {
    capHead(c, w, 'Cybersecurity', 'Protect what matters', 'shield');
    const p = seg(t, 37.5, 38.2);
    c.save(); c.translate(w / 2 - 56, 214); c.scale(112 / 24, 112 / 24);
    const sh = new Path2D('M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z');
    c.fillStyle = `rgba(240,96,35,${0.12 * p})`; c.fill(sh);
    c.setLineDash([60]); c.lineDashOffset = 60 * (1 - p); c.strokeStyle = O; c.lineWidth = 1.4; c.lineJoin = 'round'; c.stroke(sh); c.setLineDash([]);
    if (p > 0.6) { const q = seg(p, 0.6, 1); c.setLineDash([12]); c.lineDashOffset = 12 * (1 - q); c.lineCap = 'round'; c.beginPath(); c.moveTo(8.5, 12); c.lineTo(11, 14.5); c.lineTo(15.5, 9.5); c.lineWidth = 1.8; c.stroke(); c.setLineDash([]); }
    c.restore();
    const steps = [['user', 'Sign in'], ['key', 'Verify identity'], ['lock', 'Access granted']];
    steps.forEach(([ic, s], i) => {
      const y = 372 + i * 62, on = t > 37.8 + i * 0.22;
      UI.card(c, 28, y, w - 56, 50, { r: 12, blur: 6, dy: 2, stroke: on && i === 2 ? O : LINE });
      UI.icon(c, ic, 42, y + 13, 22, on ? O : '#B9BDC5', 1.8);
      UI.text(c, s, 78, y + 31, { size: 14, w: 500, color: on ? K : MUTED });
      if (on) { c.fillStyle = i === 2 ? '#1FA971' : O; c.beginPath(); c.arc(w - 54, y + 25, 9, 0, TAU); c.fill(); UI.icon(c, 'check', w - 61, y + 18, 14, '#fff', 2.6); }
    });
  } };

  // --------------------------------------------------- scene 7 panels ----
  const uiImpact = { w: 1400, h: 600, dynamic: true, key: (t) => Math.round(clamp(t, 41, 42.6) * 30), draw(c, t, w, h) {
    base(c, w, h, 0.66);
    chrome(c, w, 'Insights', 'chart', { size: 19, pill: 'Live', pillW: 64 });
    UI.card(c, 30, 96, 700, 470, { r: 18 });
    UI.text(c, 'Delivery trend', 56, 134, { size: 14, w: 600, color: MUTED });
    UI.lineChart(c, 56, 160, 648, 360, seg(t, 41.0, 42.2));
    UI.card(c, 754, 96, 300, 470, { r: 18 });
    UI.text(c, 'Workload mix', 780, 134, { size: 14, w: 600, color: MUTED });
    const dp = easeOut(seg(t, 41.2, 42.4));
    [[0.46, O], [0.32, '#FFB48F'], [0.22, Y]].reduce((a0, [v, col]) => { c.strokeStyle = col; c.lineWidth = 26; c.beginPath(); c.arc(904, 300, 88, -Math.PI / 2 + a0 * TAU * dp, -Math.PI / 2 + (a0 + v) * TAU * dp - 0.03); c.stroke(); return a0 + v; }, 0);
    ['Build', 'Support', 'Advisory'].forEach((s, i) => { const y = 440 + i * 36; c.fillStyle = [O, '#FFB48F', Y][i]; c.beginPath(); c.arc(790, y - 5, 6, 0, TAU); c.fill(); UI.text(c, s, 806, y, { size: 13.5, w: 500 }); });
    UI.card(c, 1078, 96, 292, 470, { r: 18 });
    UI.text(c, 'Pipeline', 1104, 134, { size: 14, w: 600, color: MUTED });
    UI.bars(c, 1104, 170, 240, 360, seg(t, 41.3, 42.5));
  } };
  const uiOutcome = (word, icon) => ({ w: 340, h: 190, draw(c, t, w, h) {
    base(c, w, h, 0.62);
    UI.rr(c, 28, 28, 56, 56, 16); c.fillStyle = SOFT; c.fill();
    UI.icon(c, icon, 44, 44, 24, O, 2);
    UI.text(c, word, 28, 146, { size: 30, w: 600, ls: '3px' });
    UI.bar(c, 28, 162, 46, 4, O);
  } });
  const uiClarity = uiOutcome('CLARITY', 'eye'), uiConf = uiOutcome('CONFIDENCE', 'shieldCheck'), uiGrowth = uiOutcome('GROWTH', 'trend');

  // ===================================================== backgrounds =====
  function bgSoft(c, o = {}) {
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, o.grey ? '#EEF0F3' : '#F7F8FA');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (const [x, y, r, a, col] of o.glows || []) UI.light(c, x, y, r, col || ORANGE, a);
    if (o.grid) {
      c.fillStyle = `rgba(23,23,23,${0.06 * o.grid})`;
      for (let x = 40; x < W; x += 48) for (let y = 40; y < H; y += 48) c.fillRect(x, y, 2, 2);
    }
  }
  function whiteOver(c, a) { if (a > 0) { c.fillStyle = `rgba(255,255,255,${clamp(a)})`; c.fillRect(0, 0, W, H); } }
  /** Light wipe: white covers from the left behind a glowing orange edge (p 0..1). Mode 'out' uncovers. */
  function lightWipe(c, p, mode = 'in', ang = 0.12) {
    if (p <= 0 || (mode === 'out' && p >= 1)) return;
    const front = lerp(-260, W + 260, mode === 'in' ? easeInOutQuint(p) : easeInOutQuint(p));
    c.save();
    c.translate(front, H / 2); c.rotate(ang);
    const span = 1400;
    if (mode === 'in') { const g = c.createLinearGradient(-160, 0, 0, 0); g.addColorStop(0, '#fff'); g.addColorStop(1, 'rgba(255,255,255,0.0)'); c.fillStyle = '#fff'; c.fillRect(-4000, -span, 3840, span * 2); c.fillStyle = g; c.fillRect(-160, -span, 160, span * 2); }
    else { const g = c.createLinearGradient(0, 0, 160, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, '#fff'); c.fillStyle = g; c.fillRect(0, -span, 160, span * 2); c.fillStyle = '#fff'; c.fillRect(160, -span, 4000, span * 2); }
    const g2 = c.createLinearGradient(-60, 0, 60, 0);
    g2.addColorStop(0, 'rgba(240,96,35,0)'); g2.addColorStop(0.45, 'rgba(240,96,35,0.55)'); g2.addColorStop(0.5, 'rgba(255,214,0,0.9)'); g2.addColorStop(0.55, 'rgba(240,96,35,0.55)'); g2.addColorStop(1, 'rgba(240,96,35,0)');
    c.fillStyle = g2; c.fillRect(-60, -span, 120, span * 2);
    c.restore();
  }

  // ======================================================== helpers ======
  const P = (ui, o) => ({ ui, w: ui.w, h: ui.h, radius: 24, glass: 0.72, glow: 0.3, shadow: 0.16, ...o });
  const lerpP = (a, b, k) => { const o = {}; for (const key of ['x', 'y', 'z', 'rx', 'ry', 'rz', 's', 'opacity', 'glow']) o[key] = lerp(a[key] ?? (key === 's' || key === 'opacity' ? 1 : 0), b[key] ?? (key === 's' || key === 'opacity' ? 1 : 0), k); return o; };
  const float = (t, i, amp = 5) => Math.sin(t * 1.1 + i * 1.7) * amp;
  const edge = (b, pn, side) => FC.panelToScreen(b, pn, side === 'l' ? 0 : side === 'r' ? pn.w : pn.w / 2, side === 't' ? 0 : side === 'b' ? pn.h : pn.h / 2);
  const center = (b, pn) => FC.panelToScreen(b, pn, pn.w / 2, pn.h / 2);
  const curve = (a, b2, bend = 0.25, n = 24) => {
    const mx = (a.x + b2.x) / 2, my = (a.y + b2.y) / 2, dx = b2.x - a.x, dy = b2.y - a.y;
    const cx = mx - dy * bend, cy = my + dx * bend;
    return Array.from({ length: n + 1 }, (_, i) => { const u = i / n; return { x: (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * cx + u * u * b2.x, y: (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * cy + u * u * b2.y }; });
  };

  // ====================================================== SCENE 01 ======
  function s1(t) {
    const cam = { tx: 960, ty: 540, dist: anim(t, 0, 4.4, 1.08, 0.95), yaw: anim(t, 0, 5, -0.05, 0.055), pitch: 0.015 };
    const b = FC.camBasis(cam);
    const em = (i) => easeOutQuint(seg(t, 1.0 + i * 0.2, 2.0 + i * 0.2));
    const al = ease(seg(t, 2.5, 3.6));
    const out = ease(seg(t, 4.15, 4.75));
    const L = lerpP(lerpP({ x: 480, y: 520, z: 1100, ry: 0.4, opacity: 0, s: 0.8 }, { x: 600, y: 440, z: 160, ry: 0.22 }, em(0)), { x: 690, y: 440, z: 280, ry: 0.3 }, al);
    const R = lerpP(lerpP({ x: 1440, y: 520, z: 1100, ry: -0.4, opacity: 0, s: 0.8 }, { x: 1320, y: 440, z: 160, ry: -0.22 }, em(2)), { x: 1230, y: 440, z: 280, ry: -0.3 }, al);
    const C = lerpP({ x: 960, y: 560, z: 1300, opacity: 0, s: 0.8 }, { x: 960, y: 430, z: 0 }, em(1));
    // the hero panel travels into the lens
    const push = easeIn(seg(t, 4.1, 5.0));
    C.x = lerp(C.x, b.pos[0], push); C.y = lerp(C.y, b.pos[1] + 40, push); C.z = lerp(C.z, b.pos[2] + 120, push);
    L.x -= 260 * out; R.x += 260 * out; L.opacity *= 1 - out; R.opacity *= 1 - out;
    const glow = 0.3 + 0.4 * seg(t, 2.5, 3.2);
    const panels = [
      P(uiTrend, { ...L, glow, y: L.y + float(t, 0) }),
      P(uiGrid, { ...R, glow, y: R.y + float(t, 2) }),
      P(uiFlow, { ...C, glow: glow + 0.2, y: C.y + float(t, 1) * (1 - push), glass: lerp(0.72, 1, push), content: 1 - seg(t, 4.5, 4.9), shadow: 0.16 * (1 - push) }),
    ];
    return {
      cam, panels,
      bg(c) {
        bgSoft(c, { glows: [[960, 560, 900, 0.2 * seg(t, 0, 1.3)], [1250, 380, 600, 0.12 * seg(t, 0.4, 1.6), YELLOW]] });
        // opening line with travelling light
        const lp = easeInOutQuint(seg(t, 0.15, 1.05)), la = 1 - seg(t, 1.4, 2.0);
        if (lp > 0 && la > 0) {
          c.globalAlpha = la;
          const x0 = 640, x1 = 1280;
          UI.glowPath(c, [{ x: x0, y: 540 }, { x: x1, y: 540 }], lp, { w: 2, head: false });
          const dx = lerp(x0, x1, (t * 0.75) % 1 * 0.999);
          if (dx < lerp(x0, x1, lp)) { UI.light(c, dx, 540, 40, YELLOW, 0.8); UI.light(c, dx, 540, 14, [255, 255, 255], 1); }
          c.globalAlpha = 1;
        }
      },
      over(c) {
        const tp = easeOutQuint(seg(t, 2.5, 3.0)), ex = seg(t, 4.1, 4.45);
        if (tp > 0 && ex < 1) {
          c.save();
          c.globalAlpha = 1 - ex;
          const y = 845 - 10 * ex, size = 96;
          c.font = F(700, size); c.letterSpacing = '4px';
          const sweep = easeInOutQuint(seg(t, 3.2, 3.95));
          const wA = c.measureText('COMPLEXITY').width, wB = c.measureText('OPPORTUNITY').width, wm = Math.max(wA, wB);
          const lx = lerp(960 - wm / 2 - 60, 960 + wm / 2 + 60, sweep);
          // highlight behind the new word
          const hk = easeOutExpo(seg(t, 3.55, 4.2));
          if (hk > 0) { UI.rr(c, 960 - (wB / 2 + 40) * hk, y - 92, (wB + 80) * hk, 120, 60); c.fillStyle = `rgba(240,96,35,${0.12 * hk})`; c.fill(); UI.light(c, 960, y - 32, 520 * hk, ORANGE, 0.18 * hk); }
          c.save(); c.beginPath(); c.rect(lx, 0, W, H); c.clip();
          c.fillStyle = K; c.textAlign = 'center'; c.fillText('COMPLEXITY', 960, y + (1 - tp) * 90); c.restore();
          c.save(); c.beginPath(); c.rect(0, 0, lx, H); c.clip();
          c.fillStyle = O; c.textAlign = 'center'; c.fillText('OPPORTUNITY', 960, y); c.restore();
          c.letterSpacing = '0px';
          if (sweep > 0 && sweep < 1) { c.fillStyle = O; c.fillRect(lx - 1.5, y - 110, 3, 140); UI.light(c, lx, y - 40, 90, YELLOW, 0.6); }
          // small kicker label
          UI.label(c, 'COMPLEXITY  →  OPPORTUNITY', 960, y - 128, { align: 'center', alpha: tp * (1 - ex) * 0.9, size: 14, ls: '5px' });
          c.restore();
        }
        whiteOver(c, easeIn(seg(t, 4.55, 4.98)));
      },
    };
  }

  // ================================================== SCENES 02 + 03 =====
  const A2 = [
    { ui: uiCRM, x: 520, y: 360, z: 260, ry: 0.18, rz: -0.015 },
    { ui: uiBoard, x: 1400, y: 330, z: 420, ry: -0.14, rz: 0.012 },
    { ui: uiSheet, x: 600, y: 770, z: 480, ry: 0.12, rz: 0.01 },
    { ui: uiReport, x: 1350, y: 780, z: 220, ry: -0.18, rz: -0.01 },
  ];
  const LINKS = [[0, 1, 'r', 'l'], [0, 2, 'b', 't'], [1, 3, 'b', 't'], [2, 3, 'r', 'l']];
  const DASH3 = { x: 960, y: 560, z: 0 };
  function s23(t) {
    // ---- camera
    let cam;
    if (t < 11) cam = { tx: anim(t, 5, 9.2, 820, 1080), ty: 560, dist: anim(t, 9, 11, 0.92, 1.24), yaw: anim(t, 5, 11, -0.03, 0.025), pitch: 0.01 };
    else cam = { tx: anim(t, 11, 13, 1080, 960) - 50 * ease(seg(t, 13.5, 15)) + 100 * ease(seg(t, 15, 17)), ty: 560, dist: anim(t, 11, 13.2, 1.24, 1.03) - 0.11 * easeIn(seg(t, 17, 18)), yaw: anim(t, 11, 13, 0.025, 0) - 0.035 * ease(seg(t, 13.5, 15)) + 0.07 * ease(seg(t, 15, 17.2)), pitch: 0.01 };
    const b = FC.camBasis(cam);
    // ---- the four disconnected tools
    const gather = (i) => easeInOutQuint(seg(t, 11.6 + i * 0.12, 13.15 + i * 0.12));
    const panels = A2.map((a, i) => {
      const k = easeOutQuint(seg(t, 5.0 + i * 0.13, 6.2 + i * 0.13));
      const p0 = lerpP({ ...a, z: a.z + 700, opacity: 0, s: 0.9 }, { ...a, y: a.y + float(t, i, 7) }, k);
      const [mx, my] = MODS[[0, 1, 2, 3][i]];
      const dst = FC.panelPoint({ ...DASH3, w: DW, h: DH }, mx - DW / 2, my - DH / 2);
      const g = gather(i);
      const p1 = lerpP(p0, { x: dst[0], y: dst[1], z: dst[2] - 4, rx: 0, ry: 0, rz: 0, s: MOD_S, opacity: 1 }, g);
      p1.opacity *= 1 - seg(t, 13.45, 13.75);
      return P(a.ui, { ...p1, glow: 0.25, radius: 24, shadow: 0.16 * (1 - g * 0.7) });
    });
    // ---- unified workspace + people/process/technology
    const dk = easeOutQuint(seg(t, 12.55, 13.4));
    if (dk > 0) panels.push(P(uiWorkspace, { x: DASH3.x, y: DASH3.y, z: lerp(120, 0, dk), s: lerp(0.94, 1, dk), opacity: dk, glow: 0.45, glass: 0.78, order: -1, sweep: anim(t, 14.2, 15.2, -0.4, 1.6) }));
    const triad = [uiPeople, uiProcess, uiTech];
    triad.forEach((ui, i) => {
      const k = easeOutQuint(seg(t, 15.0 + i * 0.25, 15.75 + i * 0.25));
      if (k <= 0) return;
      const act = seg(t, 15.75 + i * 0.45, 15.95 + i * 0.45) * (1 - seg(t, 16.2 + i * 0.45, 16.4 + i * 0.45));
      const end = seg(t, 17.0, 17.4);
      panels.push(P(ui, { x: 600 + i * 360, y: 830 + float(t, i, 4), z: lerp(380, -330, k), opacity: k, glow: 0.3 + 0.9 * Math.max(act, end), glass: 0.8, radius: 22 }));
    });
    return {
      cam, panels,
      bg(c) {
        const wk = seg(t, 11, 13);
        bgSoft(c, { grey: wk < 0.5, grid: 1 - wk, glows: [[1500, 900, 900, 0.16 * wk], [350, 120, 700, 0.1 * wk, YELLOW], [960, 540, 1100, 0.05]] });
        if (t > 6.6 && t < 12.6) {
          // connections: attempt, break, then re-form as one pathway
          const fixK = seg(t, 11.0, 11.35);
          LINKS.forEach(([a, b2, sa, sb], i) => {
            const A = edge(b, panels[a], sa), B = edge(b, panels[b2], sb);
            const draw = seg(t, 7.0 + i * 0.18, 7.7 + i * 0.18), brk = seg(t, 8.05 + i * 0.18, 8.35 + i * 0.18);
            const pts = curve(A, B, 0.12);
            c.save(); c.globalAlpha = 1 - fixK;
            if (brk <= 0) UI.glowPath(c, pts, draw, { w: 1.8, alpha: 0.85 });
            else if (i !== 3) {
              UI.glowPath(c, pts.slice(0, 11), 1, { w: 1.8, head: false, alpha: 0.85 });
              c.globalAlpha = (1 - fixK) * (1 - 0.5 * brk);
              UI.glowPath(c, pts.slice(14), 1, { w: 1.6, head: false, dash: [2, 8], color: '#B9BDC5', alpha: 0.9 });
            } else UI.glowPath(c, pts, 1, { w: 1.8, head: false, alpha: 0.85 });
            c.restore();
            // data card stalls halfway
            const dk2 = seg(t, 7.4 + i * 0.2, 8.2 + i * 0.2);
            if (dk2 > 0 && i !== 3 && fixK < 1) {
              const idx = Math.min(pts.length - 1, Math.floor(easeOut(dk2) * 9));
              const shake = brk > 0 ? Math.sin(t * 30) * 1.5 * (1 - brk) : 0;
              const p = pts[idx];
              c.save(); c.globalAlpha = 1 - fixK;
              UI.card(c, p.x - 34 + shake, p.y - 14, 68, 28, { r: 14, blur: 10, dy: 3 });
              UI.text(c, ['Record', 'File', 'Update'][i], p.x + shake, p.y + 4.5, { size: 11, w: 600, align: 'center', color: '#5D626B' });
              c.restore();
              // warning badge at the break
              const wb = backOut(seg(t, 8.3 + i * 0.2, 8.65 + i * 0.2)) * (1 - fixK);
              if (wb > 0) {
                const q = pts[12];
                c.save(); c.translate(q.x, q.y - 34); c.scale(wb, wb);
                c.shadowColor = 'rgba(0,0,0,0.15)'; c.shadowBlur = 10; c.shadowOffsetY = 3;
                c.fillStyle = Y; c.beginPath(); c.arc(0, 0, 15, 0, TAU); c.fill(); c.shadowColor = 'transparent';
                UI.text(c, '!', 0, 6.5, { size: 19, w: 700, align: 'center' });
                c.restore();
              }
            }
          });
          // re-formed single pathway (scene 3)
          const rp = seg(t, 11.0, 12.1);
          if (rp > 0 && t < 13.5) {
            const order = [0, 1, 3, 2].map((i) => center(b, panels[i]));
            const pts = [];
            for (let i = 0; i < order.length - 1; i++) pts.push(...curve(order[i], order[i + 1], 0.08, 16).slice(i ? 1 : 0));
            c.globalAlpha = 1 - seg(t, 13.1, 13.5);
            UI.glowPath(c, pts, easeInOutQuint(rp), { w: 3, pulses: [(t * 0.6) % 1] });
            c.globalAlpha = 1;
          }
        }
      },
      over(c) {
        whiteOver(c, 1 - easeOut(seg(t, 5.0, 5.45)));
        // problem labels
        const labels = [['DISCONNECTED TOOLS', 'layers'], ['SCATTERED DATA', 'db'], ['MANUAL HANDOFFS', 'users']];
        labels.forEach(([s, ic], i) => {
          const k = easeOutQuint(seg(t, 9.1 + i * 0.25, 9.7 + i * 0.25)), e = easeIn(seg(t, 10.9 + i * 0.06, 11.3 + i * 0.06));
          if (k <= 0 || e >= 1) return;
          const x = 560 + i * 400, y = 975 + (1 - k) * 40 + e * 40;
          c.save(); c.globalAlpha = k * (1 - e);
          UI.card(c, x - 175, y - 36, 350, 72, { r: 36, blur: 24, dy: 8 });
          UI.rr(c, x - 155, y - 20, 40, 40, 20); c.fillStyle = SOFT; c.fill();
          UI.icon(c, ic, x - 147, y - 12, 24, O, 1.9);
          UI.text(c, s, x - 102, y + 7, { size: 18, w: 600, ls: '1.5px' });
          c.restore();
        });
        // large orange light sweep before the transformation
        const sw = seg(t, 10.25, 11.25);
        if (sw > 0 && sw < 1) {
          const x = lerp(-300, W + 300, easeInOutQuint(sw));
          const g = c.createLinearGradient(x - 260, 0, x + 260, 0);
          g.addColorStop(0, 'rgba(240,96,35,0)'); g.addColorStop(0.5, 'rgba(240,96,35,0.22)'); g.addColorStop(1, 'rgba(240,96,35,0)');
          c.fillStyle = g; c.fillRect(x - 260, 0, 520, H);
          c.fillStyle = 'rgba(255,214,0,0.7)'; c.fillRect(x - 1.5, 0, 3, H);
        }
        // headline
        UI.kinetic(c, 'BUILDING CONNECTED SOLUTIONS', 960, 118, seg(t, 13.25, 13.95), { size: 50, w: 600, ls: '3px', exit: seg(t, 17.2, 17.6) });
        // the three cards connect, then the line races forward into the light wipe
        if (t > 16.9) {
          const pts = [];
          const bots = [0, 1, 2].map((i) => { const e = edge(b, panels[panels.length - 3 + i], 'b'); return { x: e.x, y: e.y + 26 }; });
          pts.push(...curve(bots[0], bots[1], -0.12, 16), ...curve(bots[1], bots[2], -0.12, 16).slice(1));
          pts.push({ x: W + 200, y: bots[2].y - 60 });
          UI.glowPath(c, pts, easeInOutQuint(seg(t, 16.95, 17.75)), { w: 3, headR: 7 });
        }
        lightWipe(c, seg(t, 17.5, 18.0), 'in');
      },
    };
  }

  // ====================================================== SCENE 04 ======
  function s4(t) {
    let cam;
    if (t < 22) cam = { tx: 960, ty: 540, dist: anim(t, 18, 22, 1.08, 0.95), yaw: anim(t, 18, 22, 0.04, -0.02), pitch: 0.01 };
    else if (t < 24) cam = { tx: anim(t, 22, 23.2, 960, 1090), ty: anim(t, 22, 23.2, 540, 520), dist: anim(t, 22, 23.2, 0.95, 0.9), yaw: anim(t, 22, 23.2, -0.02, -0.04), pitch: 0.01 };
    else cam = { tx: anim(t, 24, 24.7, 1090, 960) , ty: anim(t, 24, 24.7, 520, 600), dist: anim(t, 24, 24.7, 0.9, 0.8) + anim(t, 25.35, 26, 0, 0.2), yaw: anim(t, 24, 24.7, -0.04, 0) , pitch: 0.01 };
    if (t >= 25.35) { cam.tx = anim(t, 25.35, 26, 960, 960); cam.ty = anim(t, 25.35, 26, 600, 540); }
    const b = FC.camBasis(cam);
    const mk = easeOutQuint(seg(t, 18.0, 18.8));
    const fin = easeInOutQuint(seg(t, 25.3, 26.0));
    const M = P(uiAI, {
      x: 960, y: lerp(610, 540, fin), z: lerp(260, 0, mk), s: lerp(0.9, 0.92, mk) * lerp(1, 1 / 0.92, fin), opacity: mk,
      ry: lerp(0.06, 0.14, fin), rx: lerp(0.03, 0.05, fin), glow: 0.5, glass: 0.78, order: 0, sweep: anim(t, 19.2, 20.4, -0.4, 1.6),
    });
    const back = easeInOutQuint(seg(t, 25.1, 25.8));
    const sk = (i) => easeOutQuint(seg(t, 18.35 + i * 0.15, 19.1 + i * 0.15));
    const S1 = P(uiSources, { x: 470, y: 330, z: 420 + 500 * back, ry: 0.22, opacity: sk(0) * (1 - back), glow: 0.2 });
    const S2 = P(uiModel, { x: 1470, y: 780, z: 460 + 500 * back, ry: -0.22, opacity: sk(1) * (1 - back), glow: 0.2 });
    const ak = easeOutQuint(seg(t, 22.0, 22.65)), aBack = easeInOutQuint(seg(t, 24.0, 24.6)), aOut = seg(t, 25.0, 25.5);
    const A = P(uiAnalysis, { x: lerp(1640, 1340, ak), y: 450, z: lerp(0, -260, ak) + 260 * aBack, ry: -0.12, opacity: ak * (1 - aOut) * (1 - 0.35 * aBack), glow: 0.5, glass: 0.82 });
    const ik = easeOutQuint(seg(t, 23.0, 23.55)), ic = easeInOutQuint(seg(t, 24.0, 24.65)), iOut = easeInOutQuint(seg(t, 25.4, 26.0));
    const I = P(uiInsight, {
      x: lerp(lerp(420, 640, ik), 960, ic), y: lerp(800, 640, ic), z: lerp(-330, -560, ic) + 700 * iOut, ry: lerp(0.08, 0, ic),
      opacity: ik * (1 - iOut), glow: 0.5 + 0.5 * seg(t, 24.6, 25.0), glass: 0.86, radius: 20,
    });
    return {
      cam, panels: [S1, S2, M, A, I],
      bg(c) { bgSoft(c, { glows: [[960, 620, 1000, 0.13], [1600, 200, 600, 0.1, YELLOW], [300, 900, 700, 0.08]] }); },
      over(c) {
        lightWipe(c, seg(t, 18.0, 18.5), 'out');
        UI.kinetic(c, 'INTELLIGENT AUTOMATION', 960, 104, seg(t, 18.6, 19.3), { size: 50, w: 600, ls: '3px', exit: seg(t, 23.5, 23.9) });
        // cursor selects the review action
        const btn = FC.panelToScreen(b, I, BTN.x + BTN.w * 0.45, BTN.y + BTN.h * 0.6);
        const mv = easeInOutQuint(seg(t, 24.35, 24.92));
        const cx = lerp(1560, btn.x, mv), cy = lerp(1010, btn.y, mv);
        const press = seg(t, 24.92, 25.0) * (1 - seg(t, 25.06, 25.16));
        const ca = seg(t, 24.3, 24.5) * (1 - seg(t, 25.5, 25.8));
        UI.ripple(c, btn.x, btn.y, seg(t, 24.98, 25.55));
        UI.cursor(c, cx, cy, press, ca);
      },
    };
  }

  // ====================================================== SCENE 05 ======
  function s5(t) {
    const tr = easeInOutQuint(seg(t, 28.0, 30.0));
    const cam = { tx: lerp(960, 1040, tr) + anim(t, 33.2, 34, 0, 760, easeIn), ty: 540, dist: anim(t, 26, 28, 1.0, 0.97) + anim(t, 30, 32.4, 0, 0.08), yaw: lerp(0, 0.03, tr) - 0.04 * ease(seg(t, 30, 33)), pitch: 0.01 };
    const b = FC.camBasis(cam);
    const rot = easeInOutQuint(seg(t, 26.0, 28.0));
    const side = easeInOutQuint(seg(t, 30.0, 31.2)), sym = easeInOutQuint(seg(t, 32.0, 32.9));
    const D = P(uiDash, {
      x: lerp(lerp(960, 760, side), 700, sym), y: lerp(540, 560, side), z: lerp(lerp(0, 80, side), 60, sym), s: lerp(lerp(1, 0.92, side), 0.84, sym),
      ry: lerp(lerp(0.14, 0.03, rot), lerp(0.1, 0.12, sym), side), rx: lerp(0.05, 0.01, rot),
      glow: 0.5, glass: 0.8, sweep: anim(t, 28.6, 29.7, -0.4, 1.7), opacity: 1 - seg(t, 33.4, 33.95),
    });
    const mo = easeOutQuint(seg(t, 30.0, 31.0));
    const Mo = P(uiMobile, {
      x: lerp(lerp(1760, 1430, mo), 1250, sym), y: lerp(620, 570, mo), z: lerp(-60, -220, mo) + 60 * sym, ry: lerp(-0.25, -0.12, mo) + 0.02 * sym,
      opacity: mo * (1 - seg(t, 33.4, 33.95)), radius: 46, glow: 0.45, glass: 0.86, sweep: anim(t, 31.2, 32.2, -0.4, 1.7),
    });
    return {
      cam, panels: [D, Mo],
      bg(c) { bgSoft(c, { glows: [[1100, 560, 1000, 0.12], [400, 200, 600, 0.08, YELLOW], [1600, 950, 700, 0.1]] }); },
      over(c) {
        // cursor picks "Analytics" in the sidebar
        const item = FC.panelToScreen(b, D, 120, 112 + 2 * 50 + 14);
        const mv = easeInOutQuint(seg(t, 27.85, 28.45));
        const ca = seg(t, 27.8, 28.0) * (1 - seg(t, 28.9, 29.2));
        UI.ripple(c, item.x, item.y, seg(t, 28.5, 29.0));
        UI.cursor(c, lerp(item.x + 420, item.x, mv), lerp(item.y + 300, item.y, mv), seg(t, 28.45, 28.52) * (1 - seg(t, 28.58, 28.66)), ca);
        // desktop ⇄ mobile connection
        if (t > 32.3) {
          const a = edge(b, D, 'r'), m = edge(b, Mo, 'l');
          const pts = curve({ x: a.x - 40, y: a.y + 120 }, { x: m.x, y: m.y + 60 }, -0.3, 20);
          const ext = { x: W + 300, y: m.y + 60 };
          if (t > 33.2) pts.push(ext);
          UI.glowPath(c, pts, seg(t, 32.35, 33.0) * (t > 33.2 ? 0.9 : 1) + (t > 33.2 ? 0.1 * seg(t, 33.2, 33.9) : 0), { w: 3, pulses: [((t - 32) * 0.7) % 1] });
        }
        const hx = 1475, hk = seg(t, 32.5, 33.2), he = seg(t, 33.2, 33.55);
        UI.label(c, 'CUSTOM SOFTWARE', hx, 430, { alpha: easeOut(hk) * (1 - he), size: 14, ls: '4px' });
        ['SOFTWARE', 'BUILT AROUND', 'YOU.'].forEach((s, i) => UI.kinetic(c, s, hx, 500 + i * 66, seg(t, 32.55 + i * 0.1, 33.15 + i * 0.1), { size: 54, w: 700, align: 'left', exit: he, color: i === 2 ? O : K }));
      },
    };
  }

  // ====================================================== SCENE 06 ======
  function s6(t) {
    const pb = easeInOutQuint(seg(t, 38.0, 39.4)), cp = easeInOutQuint(seg(t, 40.0, 40.6));
    let tx = 960;
    tx = lerp(tx, 720, easeInOutQuint(seg(t, 36.0, 36.7)));
    tx = lerp(tx, 960, easeInOutQuint(seg(t, 36.75, 37.35)));
    tx = lerp(tx, 1200, easeInOutQuint(seg(t, 37.4, 38.0)));
    tx = lerp(tx, 960, pb);
    const cam = { tx, ty: 540, dist: lerp(0.96, 1.1, pb), yaw: lerp(0, 0.0, pb) + (tx - 960) * 0.00006, pitch: 0.01 };
    const b = FC.camBasis(cam);
    const spots = [{ x: 530, z: 140, ry: 0.16 }, { x: 960, z: 0, ry: 0 }, { x: 1390, z: 140, ry: -0.16 }];
    const fw = [seg(t, 36.0, 36.4) * (1 - seg(t, 36.75, 37.1)), 0, seg(t, 37.4, 37.8) * (1 - pb)];
    const uis = [uiData, uiCloud, uiSec];
    const panels = uis.map((ui, i) => {
      const k = easeOutQuint(seg(t, 34.3 + i * 0.28, 35.15 + i * 0.28));
      const s = spots[i];
      const al = { x: lerp(s.x, 530 + i * 430, pb), z: lerp(s.z - 280 * ease(fw[i]), 60, pb), ry: lerp(s.ry, [0.1, 0, -0.1][i], pb) };
      const cpt = { x: lerp(al.x, 760 + i * 200, cp), z: lerp(al.z, 120, cp), ry: al.ry * (1 - cp) };
      return P(ui, {
        x: lerp(960, cpt.x, k), y: 545 + float(t, i, 4), z: lerp(0, cpt.z, k), ry: cpt.ry * k, s: lerp(0.2, 1, k) * lerp(1, 0.74, cp), opacity: k,
        glow: 0.45 + 0.4 * ease(fw[i]), glass: 0.82, radius: 26, sweep: anim(t, 38.6 + i * 0.2, 39.4 + i * 0.2, -0.4, 1.7),
      });
    });
    return {
      cam, panels,
      bg(c) {
        bgSoft(c, { glows: [[960, 560, 1000, 0.12], [200, 900, 700, 0.08, YELLOW], [1700, 200, 700, 0.1]] });
        // links between capabilities
        if (t > 38.4) {
          const ph = (t * 0.6) % 1;
          for (let i = 0; i < 2; i++) UI.glowPath(c, curve(edge(b, panels[i], 'r'), edge(b, panels[i + 1], 'l'), 0.2, 16), seg(t, 38.5 + i * 0.2, 39.1 + i * 0.2), { w: 2.5, pulses: [ph, (ph + 0.5) % 1] });
        }
      },
      over(c) {
        // incoming line from the previous scene → centre point
        const ip = easeOutQuint(seg(t, 34.0, 34.35)), io = seg(t, 34.6, 35.0);
        if (io < 1) { c.globalAlpha = 1 - io; UI.glowPath(c, [{ x: -60, y: 560 }, { x: 960, y: 545 }], ip, { w: 3 }); UI.light(c, 960, 545, 80, YELLOW, 0.8 * ip * (1 - seg(t, 34.4, 34.9))); c.globalAlpha = 1; }
        UI.kinetic(c, 'DATA. CLOUD. SECURITY.', 960, 112, seg(t, 34.7, 35.3), { size: 50, w: 600, ls: '4px', exit: seg(t, 39.9, 40.2) });
        // compact → lines into the centre → circular light wipe
        if (t > 40.15) {
          const cpt = { x: 960, y: 545 };
          panels.forEach((pn, i) => { if (i !== 1) UI.glowPath(c, [center(b, pn), cpt], easeInOutQuint(seg(t, 40.15, 40.55)), { w: 3 }); });
          const r = 1300 * easeIn(seg(t, 40.55, 41.0));
          UI.light(c, 960, 545, 90 + r * 0.15, YELLOW, 0.45 * seg(t, 40.4, 40.6));
          if (r > 0) {
            c.fillStyle = '#fff'; c.beginPath(); c.arc(960, 545, r, 0, TAU); c.fill();
            c.strokeStyle = 'rgba(240,96,35,0.8)'; c.lineWidth = 6; c.stroke();
            UI.light(c, 960, 545, r + 40, ORANGE, 0.0);
          }
        }
      },
    };
  }

  // ====================================================== SCENE 07 ======
  function s7(t) {
    const pb = easeInOutQuint(seg(t, 44.0, 46.0));
    const cam = { tx: 960, ty: 540, dist: anim(t, 41, 43, 1.04, 1.0) + 0.12 * pb, yaw: anim(t, 41, 44, 0.03, 0), pitch: 0.012 };
    const b = FC.camBasis(cam);
    const dk = easeOutQuint(seg(t, 41.0, 41.7));
    const Dsh = P(uiImpact, { x: 960, y: lerp(450, 410, pb), z: lerp(lerp(160, 220, dk), 760, pb), s: lerp(0.95, 1, dk), opacity: dk * lerp(1, 0.5, pb), glow: 0.45, glass: 0.8, sweep: anim(t, 41.6, 42.6, -0.4, 1.7) });
    const beats = [42.54, 42.54 + BEAT, 42.54 + 2 * BEAT];
    const cards = [uiClarity, uiConf, uiGrowth].map((ui, i) => {
      const k = seg(t, beats[i], beats[i] + 0.55);
      return P(ui, { x: 560 + i * 400, y: lerp(980, 810, easeOutQuint(k)) - 30 * pb, z: lerp(-120, -280, easeOutQuint(k)), rx: lerp(0.35, 0, easeOutQuint(k)), opacity: easeOut(k), glow: 0.35 + 0.65 * Math.exp(-((t - beats[i] - 0.3) ** 2) * 20), glass: 0.86, radius: 24 });
    });
    return {
      cam, panels: [Dsh, ...cards],
      bg(c) {
        bgSoft(c, { glows: [[lerp(250, 1650, ease(seg(t, 41, 44.5))), 520, 900, 0.18], [960, 1000, 900, 0.08, YELLOW]] });
      },
      over(c) {
        if (t < 41.5) { c.fillStyle = `rgba(255,255,255,${1 - easeOut(seg(t, 41.0, 41.45))})`; c.fillRect(0, 0, W, H); }
        // orange-and-white gradient wipe
        const p = easeInOutQuint(seg(t, 45.3, 46.0));
        if (p > 0) {
          const x = lerp(-600, W + 200, p);
          c.save(); c.translate(x, H / 2); c.rotate(0.18);
          c.fillStyle = '#fff'; c.fillRect(-4600, -1400, 4000, 2800);
          const g = c.createLinearGradient(-600, 0, 200, 0);
          g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.55, '#FBD3BE'); g.addColorStop(0.85, '#F06023'); g.addColorStop(1, 'rgba(255,214,0,0)');
          c.fillStyle = g; c.fillRect(-600, -1400, 800, 2800);
          c.restore();
        }
      },
    };
  }

  // ====================================================== SCENE 08 ======
  function s8(t) {
    return {
      cam: { tx: 960, ty: 540, dist: 1 }, panels: [],
      bg(c) {
        bgSoft(c, { glows: [[960, 520, 1000, 0.14 * seg(t, 46.2, 47.2)], [960, 1100, 900, 0.12, YELLOW]] });
        // ambient reflection across the background
        const r = seg(t, 48.2, 49.4);
        if (r > 0 && r < 1) {
          const x = lerp(-400, W + 400, easeInOutQuint(r));
          c.save(); c.translate(x, H / 2); c.rotate(0.35);
          const g = c.createLinearGradient(-200, 0, 200, 0);
          g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,236,220,0.75)'); g.addColorStop(1, 'rgba(255,255,255,0)');
          c.fillStyle = g; c.fillRect(-200, -1300, 400, 2600); c.restore();
        }
      },
      over(c) {
        // the orange edge of the wipe exits
        const p = seg(t, 46.0, 46.35);
        if (p < 1) {
          const x = lerp(W + 200, W + 900, easeOut(p));
          c.save(); c.translate(x, H / 2); c.rotate(0.18);
          const g = c.createLinearGradient(-600, 0, 200, 0);
          g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.55, '#FBD3BE'); g.addColorStop(0.85, '#F06023'); g.addColorStop(1, 'rgba(255,214,0,0)');
          c.fillStyle = g; c.fillRect(-600, -1400, 800, 2800); c.restore();
        }
        // small orange light → logo
        const lk = seg(t, 46.2, 46.6) * (1 - seg(t, 47.0, 47.5));
        UI.light(c, 960, 480, 70 + 20 * Math.sin(t * 8), ORANGE, 0.9 * lk);
        UI.light(c, 960, 480, 12, [255, 255, 255], lk);
        const k = easeOutQuint(seg(t, 47.0, 47.7));
        if (k > 0) FC.drawLogo(c, 960, 470, k);
        const lp = easeInOutQuint(seg(t, 47.35, 48.0));
        if (lp > 0) {
          const half = 190 * lp;
          const g = c.createLinearGradient(960 - half, 0, 960 + half, 0);
          g.addColorStop(0, 'rgba(240,96,35,0)'); g.addColorStop(0.15, O); g.addColorStop(0.85, O); g.addColorStop(1, 'rgba(240,96,35,0)');
          c.fillStyle = g; c.fillRect(960 - half, 566, half * 2, 3);
          UI.light(c, 960, 567, 60 * lp, YELLOW, 0.5 * (1 - seg(t, 48, 48.6)));
        }
        const tk = seg(t, 48.0, 48.6);
        if (tk > 0) {
          c.save();
          c.font = F(500, 30); c.letterSpacing = `${lerp(22, 12, easeOutQuint(tk))}px`; c.textAlign = 'center';
          c.fillStyle = K; c.globalAlpha = easeOut(tk);
          c.fillText('CREATING ABUNDANCE', 966, 630);
          c.restore();
        }
        const ck = easeOutQuint(seg(t, 48.9, 49.45));
        if (ck > 0) {
          c.save(); c.globalAlpha = ck;
          const y = 790 + (1 - ck) * 24;
          c.font = F(600, 22); c.letterSpacing = '3px';
          const tw = c.measureText("LET'S BUILD WHAT'S NEXT").width + 3;
          const bw = tw + 110;
          UI.rr(c, 960 - bw / 2, y - 34, bw, 68, 34); c.fillStyle = O; c.fill();
          c.fillStyle = '#fff'; c.textAlign = 'left'; c.fillText("LET'S BUILD WHAT'S NEXT", 960 - bw / 2 + 40, y + 8);
          UI.icon(c, 'arrow', 960 + bw / 2 - 62, y - 12, 24, '#fff', 2.4);
          c.letterSpacing = '1px';
          UI.text(c, 'www.intimetec.com', 960, y + 82, { size: 22, w: 400, color: '#5D626B', align: 'center', ls: '1px' });
          c.restore();
        }
      },
    };
  }

  // ====================================================== logo ==========
  FC.loadLogo = () => new Promise((res) => {
    const tryLoad = (srcs) => {
      if (!srcs.length) { FC.logo = null; return res(); }
      const img = new Image();
      img.onload = () => { FC.logo = img; res(); };
      img.onerror = () => tryLoad(srcs.slice(1));
      img.src = srcs[0];
    };
    tryLoad(['assets/logo.svg', 'assets/logo.png']);
  });
  /** Official logo if supplied (drawn unmodified, aspect preserved); otherwise a plain wordmark placeholder. */
  FC.drawLogo = (c, x, y, k) => {
    c.save();
    c.globalAlpha = k;
    const sc = lerp(0.96, 1, k);
    c.translate(x, y); c.scale(sc, sc);
    if (FC.logo) {
      const h = 150, w = (FC.logo.naturalWidth / FC.logo.naturalHeight) * h;
      c.drawImage(FC.logo, -w / 2, -h / 2 - 10, w, h);
    } else {
      c.font = F(700, 104); c.letterSpacing = '4px'; c.textAlign = 'center'; c.fillStyle = K;
      c.fillText('IN TIME TEC', 4, 36);
    }
    c.restore();
  };

  // ====================================================== timeline ======
  const SCENES = [[0, 5, s1], [5, 18, s23], [18, 26, s4], [26, 34, s5], [34, 41, s6], [41, 46, s7], [46, 50.1, s8]];
  FC.frameAt = (t) => { const s = SCENES.find(([a, e]) => t < e) || SCENES[SCENES.length - 1]; return s[2](t); };
  FC.buildScenes = () => {};
  FC.DURATION = 50;
  FC.CONFIG = { name: 'intimetec', duration: 50, fps: 30, voOffsets: [0.3, 5.4, 11.4, 18.5, 26.5, 34.5, 41.4, 46.9] };
})();
