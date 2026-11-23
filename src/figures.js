/*
 * figures.js — the four portraits, the animated full figures (Rani on
 * horseback, Gandhi walking) and the crowd silhouettes.
 *
 * Figures are described as data — filled regions and ink lines in a local
 * coordinate frame — so the same drawing can be traced in charcoal, filled
 * with watercolor, animated, or shrunk into the finale's medallions.
 *
 * NOTE: these are stylised, hand-built illustrations. For broadcast work,
 * drop painted portrait layers into assets/portraits/ (see README) and they
 * replace the procedural busts automatically.
 */
(function () {
  const FC = window.FC;
  const { spline, ellipsePts, xf, mirrorX, wash, ink, tracePath, rgba, clamp, seg, lerp, granulate } = FC;

  // ---------------------------------------------------------------- palette
  const C = {
    ink: [32, 24, 20],
    skin: [184, 130, 94], skinShade: [140, 92, 64],
    skinG: [168, 118, 84],
    hatBrown: [96, 80, 64], band: [46, 36, 28],
    coat: [112, 86, 66], coatDark: [78, 58, 44], shirt: [236, 229, 212],
    khaki: [142, 122, 80], khakiDark: [100, 84, 52], leather: [88, 58, 34], brass: [196, 156, 70],
    capKhaki: [128, 112, 72], visor: [42, 34, 26],
    white: [240, 235, 222], whiteShade: [184, 186, 188], moustacheGrey: [196, 192, 184],
    maroon: [136, 36, 32], gold: [198, 152, 62], saffron: [222, 128, 46], turban: [196, 86, 40], lips: [158, 62, 52],
    hair: [36, 28, 24],
    horse: [64, 44, 32], horseLight: [112, 80, 54], steel: [205, 205, 212],
  };
  FC.C = C;

  const closed = (pts, res = 6) => spline(pts, res, true);
  const open = (pts, res = 8) => spline(pts, res, false);
  const mirror = (pts) => pts.map((p) => [-p[0], p[1]]);
  const circ = (x, y, r, n = 28) => ellipsePts(x, y, r, r, n);

  function limb(a, b, w0, w1) {
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2;
    const c = Math.cos(ang), s = Math.sin(ang);
    return [
      [a[0] + c * w0 / 2, a[1] + s * w0 / 2], [b[0] + c * w1 / 2, b[1] + s * w1 / 2],
      ...ellipsePts(b[0], b[1], w1 / 2, w1 / 2, 8, 0, ang, ang + Math.PI),
      [b[0] - c * w1 / 2, b[1] - s * w1 / 2], [a[0] - c * w0 / 2, a[1] - s * w0 / 2],
      ...ellipsePts(a[0], a[1], w0 / 2, w0 / 2, 8, 0, ang + Math.PI, ang + Math.PI * 2),
    ];
  }
  FC.limb = limb;

  // ================================================================ BUSTS ==
  // Local frame: head centre at (0,0); face half-width ≈ 75.

  function faceParts(face, earR) {
    const ear = earR;
    return { face: closed(face), earR: closed(ear), earL: closed(mirror(ear)) };
  }

  function bhagatSingh() {
    const f = faceParts(
      [[0, -92], [52, -80], [72, -40], [74, 0], [68, 40], [52, 72], [28, 94], [0, 102], [-28, 94], [-52, 72], [-68, 40], [-74, 0], [-72, -40], [-52, -80]],
      [[70, -14], [86, -20], [91, 4], [83, 30], [68, 30]]
    );
    const tilt = (pts) => pts.map(([x, y]) => { const a = -0.07, cx = 0, cy = -60; const dx = x - cx, dy = y - cy; return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)]; });
    const crown = tilt(closed([[-80, -62], [-86, -108], [-72, -148], [-34, -164], [0, -150], [34, -166], [72, -150], [86, -108], [80, -62]]));
    const band = tilt(closed([[-83, -60], [-84, -84], [0, -88], [84, -84], [83, -60], [0, -62]], 4));
    const brim = tilt(closed([[-152, -58], [-112, -80], [0, -90], [112, -80], [152, -60], [118, -40], [0, -26], [-120, -40]]));
    const coat = closed([[-42, 138], [-120, 162], [-214, 198], [-266, 262], [-296, 430], [296, 430], [266, 262], [214, 198], [120, 162], [42, 138]], 5);
    const shirtV = [[-46, 136], [0, 262], [46, 136]];
    const lapelL = closed([[-46, 148], [0, 264], [-28, 310], [-116, 192]], 4);
    const collarL = closed([[-44, 134], [-8, 190], [-66, 178]], 3);
    const moustache = closed([[0, 47], [24, 46], [44, 53], [52, 61], [28, 59], [0, 57], [-28, 59], [-52, 61], [-44, 53], [-24, 46]], 4);
    const fills = [
      { pts: coat, color: C.coat },
      { pts: shirtV, color: C.shirt },
      { pts: lapelL, color: C.coatDark }, { pts: mirror(lapelL), color: C.coatDark },
      { pts: collarL, color: C.shirt }, { pts: mirror(collarL), color: C.shirt },
      { pts: closed([[-38, 70], [38, 70], [42, 150], [0, 160], [-42, 150]], 4), color: C.skinShade },
      { pts: f.earL, color: C.skin }, { pts: f.earR, color: C.skin },
      { pts: f.face, color: C.skin },
      { pts: closed([[36, -50], [72, -30], [72, 30], [52, 72], [26, 92], [40, 40]], 5), color: C.skinShade, alpha: 0.35 },
      { pts: closed([[-74, -56], [74, -56], [72, -26], [0, -18], [-72, -26]], 4), color: C.skinShade, alpha: 0.45 },
      { pts: closed([[-75, -40], [-68, -62], [-56, -60], [-64, -18]], 3), color: C.hair },
      { pts: mirror(closed([[-75, -40], [-68, -62], [-56, -60], [-64, -18]], 3)), color: C.hair },
      { pts: moustache, color: C.hair },
      { pts: circ(-34, -10, 5.5, 12), color: C.ink }, { pts: circ(34, -10, 5.5, 12), color: C.ink },
      { pts: crown, color: C.hatBrown },
      { pts: band, color: C.band },
      { pts: brim, color: C.hatBrown },
    ];
    const lines = [
      { pts: open([[-72, -40], [-74, 0], [-68, 40], [-52, 72], [-28, 94], [0, 102], [28, 94], [52, 72], [68, 40], [74, 0], [72, -40]]), w: 3.2 },
      { pts: brim.concat([brim[0]]), w: 3 },
      { pts: crown.concat([crown[0]]), w: 3 },
      { pts: open(tilt([[-10, -150], [0, -128], [10, -150]])), w: 2 },
      { pts: open([[-54, -28], [-36, -37], [-14, -31]]), w: 4.5 }, { pts: open(mirror([[-54, -28], [-36, -37], [-14, -31]])), w: 4.5 },
      { pts: open([[-50, -10], [-35, -17], [-20, -10]]), w: 3 }, { pts: open(mirror([[-50, -10], [-35, -17], [-20, -10]])), w: 3 },
      { pts: open([[-47, -5], [-35, -2], [-23, -6]]), w: 1.4 }, { pts: open(mirror([[-47, -5], [-35, -2], [-23, -6]])), w: 1.4 },
      { pts: open([[5, -14], [9, 18], [15, 35], [3, 42], [-10, 38]]), w: 2.6 },
      { pts: open([[-2, 51], [-22, 50], [-40, 56], [-50, 60]]), w: 5 }, { pts: open([[2, 51], [22, 50], [40, 56], [50, 60]]), w: 5 },
      { pts: open([[-20, 74], [0, 76], [20, 74]]), w: 2.2 },
      { pts: f.earR.concat([f.earR[0]]), w: 2 }, { pts: f.earL.concat([f.earL[0]]), w: 2 },
      { pts: open([[-38, 92], [-40, 140]]), w: 2.2 }, { pts: open([[38, 92], [40, 140]]), w: 2.2 },
      { pts: open([[-296, 430], [-266, 262], [-214, 198], [-120, 162], [-42, 138]]), w: 3.4 },
      { pts: open([[296, 430], [266, 262], [214, 198], [120, 162], [42, 138]]), w: 3.4 },
      { pts: lapelL.concat([lapelL[0]]), w: 2.4 }, { pts: mirror(lapelL).concat([mirror(lapelL)[0]]), w: 2.4 },
      { pts: collarL.concat([collarL[0]]), w: 2 }, { pts: mirror(collarL).concat([mirror(collarL)[0]]), w: 2 },
      { pts: open([[0, 264], [0, 430]]), w: 2 },
      { pts: open([[-180, 300], [-150, 360], [-160, 420]]), w: 1.4 }, { pts: open([[175, 290], [150, 360], [165, 420]]), w: 1.4 },
    ];
    return { fills, lines, name: 'bhagat' };
  }

  function netaji() {
    const f = faceParts(
      [[0, -90], [55, -80], [76, -40], [78, 0], [72, 40], [56, 74], [30, 96], [0, 104], [-30, 96], [-56, 74], [-72, 40], [-78, 0], [-76, -40], [-55, -80]],
      [[74, -14], [90, -20], [95, 4], [87, 30], [72, 30]]
    );
    const capTop = closed([[-118, -116], [-64, -150], [0, -158], [64, -150], [118, -116], [90, -98], [0, -94], [-90, -98]]);
    const capBand = closed([[-90, -104], [0, -100], [90, -104], [86, -64], [0, -62], [-86, -64]], 4);
    const visor = closed([[-90, -68], [0, -66], [90, -68], [82, -46], [42, -34], [0, -31], [-42, -34], [-82, -46]], 4);
    const tunic = closed([[-44, 126], [-130, 156], [-232, 194], [-282, 262], [-302, 430], [302, 430], [282, 262], [232, 194], [130, 156], [44, 126]], 5);
    const lapelL = closed([[-48, 124], [-4, 204], [-34, 246], [-98, 168]], 4);
    const epL = closed([[-236, 192], [-132, 158], [-126, 178], [-232, 214]], 3);
    const pocketL = closed([[-196, 268], [-84, 262], [-80, 346], [-192, 352]], 3);
    const strap = [[-176, 178], [-150, 168], [150, 430], [118, 430]];
    const fills = [
      { pts: tunic, color: C.khaki },
      { pts: [[-42, 126], [0, 204], [42, 126]], color: [178, 162, 120] },
      { pts: lapelL, color: C.khakiDark }, { pts: mirror(lapelL), color: C.khakiDark },
      { pts: epL, color: C.khakiDark }, { pts: mirror(epL), color: C.khakiDark },
      { pts: strap, color: C.leather },
      { pts: closed([[-40, 78], [40, 78], [44, 136], [0, 146], [-44, 136]], 4), color: C.skinShade },
      { pts: f.earL, color: C.skin }, { pts: f.earR, color: C.skin },
      { pts: f.face, color: C.skin },
      { pts: closed([[40, -40], [76, -20], [72, 40], [56, 74], [30, 94], [46, 30]], 5), color: C.skinShade, alpha: 0.33 },
      { pts: closed([[-76, -50], [76, -50], [74, -34], [0, -30], [-74, -34]], 4), color: C.skinShade, alpha: 0.4 },
      { pts: circ(-32, -2, 5, 12), color: C.ink }, { pts: circ(32, -2, 5, 12), color: C.ink },
      { pts: capTop, color: C.capKhaki },
      { pts: capBand, color: [104, 88, 56] },
      { pts: visor, color: C.visor },
      { pts: circ(0, -84, 13, 18), color: C.brass },
      { pts: circ(0, 256, 7, 12), color: C.brass }, { pts: circ(0, 312, 7, 12), color: C.brass }, { pts: circ(0, 368, 7, 12), color: C.brass },
    ];
    const ring = (x, y, r) => { const p = circ(x, y, r, 40); return p.concat([p[0]]); };
    const lines = [
      { pts: open([[-76, -40], [-78, 0], [-72, 40], [-56, 74], [-30, 96], [0, 104], [30, 96], [56, 74], [72, 40], [78, 0], [76, -40]]), w: 3.2 },
      { pts: capTop.concat([capTop[0]]), w: 3 }, { pts: visor.concat([visor[0]]), w: 3 }, { pts: open([[-90, -104], [-86, -64]]), w: 2.4 }, { pts: open([[90, -104], [86, -64]]), w: 2.4 },
      { pts: ring(-32, -2, 23), w: 2.6 }, { pts: ring(32, -2, 23), w: 2.6 },
      { pts: open([[-10, -6], [0, -10], [10, -6]]), w: 2.4 },
      { pts: open([[-55, -6], [-77, -12]]), w: 2 }, { pts: open([[55, -6], [77, -12]]), w: 2 },
      { pts: open([[-54, -34], [-32, -41], [-12, -35]]), w: 4.4 }, { pts: open(mirror([[-54, -34], [-32, -41], [-12, -35]])), w: 4.4 },
      { pts: open([[-44, -2], [-32, -8], [-20, -2]]), w: 2.4 }, { pts: open(mirror([[-44, -2], [-32, -8], [-20, -2]])), w: 2.4 },
      { pts: open([[4, -4], [8, 26], [13, 40], [0, 46], [-12, 40]]), w: 2.6 },
      { pts: open([[-24, 68], [0, 72], [24, 68]]), w: 2.6 }, { pts: open([[-12, 80], [0, 82], [12, 80]]), w: 1.4 },
      { pts: f.earR.concat([f.earR[0]]), w: 2 }, { pts: f.earL.concat([f.earL[0]]), w: 2 },
      { pts: open([[-302, 430], [-282, 262], [-232, 194], [-130, 156], [-44, 126]]), w: 3.4 },
      { pts: open([[302, 430], [282, 262], [232, 194], [130, 156], [44, 126]]), w: 3.4 },
      { pts: lapelL.concat([lapelL[0]]), w: 2.4 }, { pts: mirror(lapelL).concat([mirror(lapelL)[0]]), w: 2.4 },
      { pts: epL.concat([epL[0]]), w: 2 }, { pts: mirror(epL).concat([mirror(epL)[0]]), w: 2 },
      { pts: pocketL.concat([pocketL[0]]), w: 2 }, { pts: mirror(pocketL).concat([mirror(pocketL)[0]]), w: 2 },
      { pts: open([[-196, 292], [-138, 296], [-80, 290]]), w: 1.6 }, { pts: open([[196, 292], [138, 296], [80, 290]]), w: 1.6 },
      { pts: open([[0, 206], [0, 430]]), w: 2 },
      { pts: open([[-176, 178], [118, 430]]), w: 2 }, { pts: open([[-150, 168], [150, 430]]), w: 2 },
    ];
    return { fills, lines, name: 'netaji' };
  }

  function gandhi() {
    const f = faceParts(
      [[0, -102], [50, -94], [72, -56], [76, -10], [70, 35], [55, 70], [30, 95], [0, 104], [-30, 95], [-55, 70], [-70, 35], [-76, -10], [-72, -56], [-50, -94]],
      [[72, -24], [98, -34], [107, 0], [98, 36], [74, 40]]
    );
    const shawl = closed([[-40, 92], [-132, 128], [-222, 178], [-272, 300], [-286, 430], [286, 430], [272, 300], [222, 178], [132, 128], [40, 92], [0, 170]], 5);
    const ring = (x, y, r) => { const p = circ(x, y, r, 40); return p.concat([p[0]]); };
    const moustache = closed([[0, 53], [20, 53], [36, 60], [20, 65], [0, 62], [-20, 65], [-36, 60], [-20, 53]], 4);
    const fills = [
      { pts: closed([[-36, 80], [36, 80], [40, 130], [0, 176], [-40, 130]], 4), color: C.skinShade },
      { pts: shawl, color: C.white },
      { pts: closed([[-222, 178], [-272, 300], [-286, 430], [-120, 430], [-60, 260]], 5), color: C.whiteShade, alpha: 0.5 },
      { pts: closed([[150, 140], [222, 178], [272, 300], [286, 430], [200, 430], [170, 260]], 5), color: C.whiteShade, alpha: 0.35 },
      { pts: f.earL, color: C.skinG }, { pts: f.earR, color: C.skinG },
      { pts: f.face, color: C.skinG },
      { pts: closed([[40, -60], [76, -10], [70, 35], [55, 70], [30, 95], [46, 20]], 5), color: C.skinShade, alpha: 0.35 },
      { pts: closed([[-50, -96], [0, -104], [50, -96], [30, -84], [-30, -84]], 4), color: [220, 180, 140], alpha: 0.5 },
      { pts: moustache, color: C.moustacheGrey },
      { pts: circ(-30, -8, 4.5, 12), color: C.ink }, { pts: circ(30, -8, 4.5, 12), color: C.ink },
    ];
    const lines = [
      { pts: open([[-72, -56], [-76, -10], [-70, 35], [-55, 70], [-30, 95], [0, 104], [30, 95], [55, 70], [70, 35], [76, -10], [72, -56], [50, -94], [0, -102], [-50, -94], [-72, -56]]), w: 3 },
      { pts: f.earR.concat([f.earR[0]]), w: 2.4 }, { pts: f.earL.concat([f.earL[0]]), w: 2.4 },
      { pts: ring(-30, -8, 21), w: 2 }, { pts: ring(30, -8, 21), w: 2 },
      { pts: open([[-9, -12], [0, -15], [9, -12]]), w: 2 },
      { pts: open([[-51, -12], [-74, -18]]), w: 1.6 }, { pts: open([[51, -12], [74, -18]]), w: 1.6 },
      { pts: open([[-46, -34], [-30, -39], [-14, -34]]), w: 2.4 }, { pts: open(mirror([[-46, -34], [-30, -39], [-14, -34]])), w: 2.4 },
      { pts: open([[-40, -8], [-30, -13], [-20, -8]]), w: 2 }, { pts: open(mirror([[-40, -8], [-30, -13], [-20, -8]])), w: 2 },
      { pts: open([[3, -10], [6, 28], [15, 42], [0, 49], [-15, 42]]), w: 2.6 },
      { pts: moustache.concat([moustache[0]]), w: 1.4 },
      { pts: open([[-26, 76], [0, 84], [26, 76]]), w: 2.4 },
      { pts: open([[-40, 50], [-48, 72]]), w: 1.2 }, { pts: open([[40, 50], [48, 72]]), w: 1.2 },
      { pts: open([[-286, 430], [-272, 300], [-222, 178], [-132, 128], [-40, 92]]), w: 3 },
      { pts: open([[286, 430], [272, 300], [222, 178], [132, 128], [40, 92]]), w: 3 },
      { pts: open([[-40, 92], [0, 170], [40, 92]]), w: 2.4 },
      { pts: open([[-200, 190], [-80, 300], [40, 430]]), w: 1.8 },
      { pts: open([[-130, 140], [-20, 260], [120, 430]]), w: 1.4 },
      { pts: open([[150, 140], [170, 260], [200, 430]]), w: 1.6 },
    ];
    return { fills, lines, name: 'gandhi' };
  }

  function rani() {
    const f = faceParts(
      [[0, -92], [50, -82], [66, -45], [68, 0], [62, 40], [46, 72], [24, 92], [0, 100], [-24, 92], [-46, 72], [-62, 40], [-68, 0], [-66, -45], [-50, -82]],
      [[64, -10], [78, -14], [80, 8], [74, 26], [62, 26]]
    );
    const turban = closed([[-82, -36], [-92, -92], [-62, -142], [0, -160], [62, -142], [92, -92], [82, -36], [52, -58], [0, -66], [-52, -58]]);
    const attire = closed([[-34, 126], [-122, 148], [-212, 188], [-262, 260], [-282, 430], [282, 430], [262, 260], [212, 188], [122, 148], [34, 126]], 5);
    const dupatta = closed([[-236, 196], [-150, 156], [-40, 150], [230, 430], [110, 430]], 5);
    const lips = closed([[-18, 62], [-6, 58], [0, 60], [6, 58], [18, 62], [8, 70], [0, 71], [-8, 70]], 4);
    const hairL = closed([[-66, -44], [-74, 0], [-70, 40], [-58, 30], [-60, -30]], 4);
    const fills = [
      { pts: attire, color: C.maroon },
      { pts: dupatta, color: C.saffron, alpha: 0.9 },
      { pts: closed([[-30, 78], [30, 78], [34, 132], [0, 140], [-34, 132]], 4), color: C.skinShade },
      { pts: hairL, color: C.hair }, { pts: mirror(hairL), color: C.hair },
      { pts: f.earL, color: C.skin }, { pts: f.earR, color: C.skin },
      { pts: f.face, color: C.skin },
      { pts: closed([[36, -40], [66, -20], [62, 40], [46, 72], [24, 90], [40, 30]], 5), color: C.skinShade, alpha: 0.3 },
      { pts: lips, color: C.lips },
      { pts: circ(-30, -6, 5, 12), color: C.ink }, { pts: circ(30, -6, 5, 12), color: C.ink },
      { pts: circ(0, -46, 4.5, 12), color: [180, 40, 30] },
      { pts: turban, color: C.turban },
      { pts: circ(0, -112, 12, 16), color: C.gold },
      { pts: closed([[-4, -122], [-10, -160], [2, -196], [14, -188], [6, -150], [6, -122]], 4), color: [236, 228, 210] },
      { pts: circ(-68, 34, 7, 12), color: C.gold }, { pts: circ(68, 34, 7, 12), color: C.gold },
    ];
    const lines = [
      { pts: open([[-66, -45], [-68, 0], [-62, 40], [-46, 72], [-24, 92], [0, 100], [24, 92], [46, 72], [62, 40], [68, 0], [66, -45]]), w: 3 },
      { pts: turban.concat([turban[0]]), w: 3 },
      { pts: open([[-84, -60], [-20, -110], [70, -132]]), w: 1.8 }, { pts: open([[-76, -90], [10, -138], [60, -148]]), w: 1.6 },
      { pts: open([[-60, -46], [20, -92], [86, -80]]), w: 1.6 },
      { pts: open([[-50, -28], [-30, -36], [-12, -30]]), w: 3.6 }, { pts: open(mirror([[-50, -28], [-30, -36], [-12, -30]])), w: 3.6 },
      { pts: open([[-46, -6], [-30, -14], [-14, -6]]), w: 3.6 }, { pts: open(mirror([[-46, -6], [-30, -14], [-14, -6]])), w: 3.6 },
      { pts: open([[-44, -2], [-30, 2], [-16, -4]]), w: 1.4 }, { pts: open(mirror([[-44, -2], [-30, 2], [-16, -4]])), w: 1.4 },
      { pts: open([[3, -8], [6, 24], [10, 35], [0, 40], [-10, 35]]), w: 2.2 },
      { pts: (() => { const p = circ(13, 38, 6, 20); return p.concat([p[0]]); })(), w: 1.4, color: [150, 110, 40] },
      { pts: lips.concat([lips[0]]), w: 1.6 },
      { pts: f.earR.concat([f.earR[0]]), w: 1.8 }, { pts: f.earL.concat([f.earL[0]]), w: 1.8 },
      { pts: open([[-282, 430], [-262, 260], [-212, 188], [-122, 148], [-34, 126]]), w: 3 },
      { pts: open([[282, 430], [262, 260], [212, 188], [122, 148], [34, 126]]), w: 3 },
      { pts: open([[-52, 132], [-30, 160], [0, 172], [30, 160], [52, 132]]), w: 4, color: [176, 130, 50] },
      { pts: open([[-236, 196], [110, 430]]), w: 2 }, { pts: open([[-150, 156], [230, 430]]), w: 2 },
    ];
    return { fills, lines, name: 'rani' };
  }

  FC.busts = { rani, bhagat: bhagatSingh, gandhi, netaji };

  // ---------------------------------------------------- figure rendering --
  const T = (pts, o) => pts.map((p) => [o.x + p[0] * o.s, o.y + p[1] * o.s]);

  /** Slow, painterly version for pre-rendering. */
  function paintFig(ctx, fig, o) {
    fig.fills.forEach((f, i) => {
      const pts = T(f.pts, o);
      wash(ctx, pts, f.color, {
        seed: 500 + i, layers: 7, alpha: 0.07 * (f.alpha ?? 1), crisp: 0.72 * (f.alpha ?? 1),
        variance: 0.018, edgeAlpha: 0.22, baseDepth: 1, depth: 2,
      });
    });
  }
  /** Fast flat-fill version for per-frame animation. */
  function fastFig(ctx, fig, o) {
    for (const f of fig.fills) {
      ctx.fillStyle = rgba(f.color, 0.92 * (f.alpha ?? 1));
      tracePath(ctx, T(f.pts, o));
      ctx.fill();
    }
  }
  /** Ink lines, staggered so they appear to be drawn one after another. */
  function inkFig(ctx, fig, prog, o) {
    const n = fig.lines.length;
    fig.lines.forEach((l, i) => {
      const p = o.stagger === false ? prog : seg(prog, (i / n) * 0.65, (i / n) * 0.65 + 0.35);
      if (p <= 0) return;
      const key = '_c' + o.x + '_' + o.y + '_' + o.s;
      const pts = l[key] || (l[key] = T(l.pts, o));
      ink(ctx, pts, { width: (l.w || 2) * o.s * (o.wMul || 1), color: l.color || o.color || C.ink, alpha: o.alpha ?? 0.85, progress: p, seed: i + 3, charcoal: o.charcoal });
    });
  }
  Object.assign(FC, { paintFig, fastFig, inkFig });

  /**
   * Pre-rendered bust canvas. Logical size 820×900, head centre at (410,320),
   * bust scale BS. If assets/portraits/<name>.png was loaded, that is used.
   */
  const BS = 1.3, BW = 820, BH = 900, BX = 410, BY = 320;
  FC.BUST = { BS, BW, BH, BX, BY };
  function renderBust(fig, withInk) {
    const S = FC.getScale();
    const c = FC.canvas(BW * S, BH * S), ctx = c.getContext('2d');
    ctx.scale(S, S);
    const ext = FC.portraits && FC.portraits[fig.name];
    if (ext) {
      ctx.drawImage(ext, 0, 0, BW, BH);
      return c;
    }
    const o = { x: BX, y: BY, s: BS };
    paintFig(ctx, fig, o);
    granulate(ctx, 0.55);
    if (withInk) inkFig(ctx, fig, 1, { ...o, stagger: false, alpha: 0.8 });
    return c;
  }
  FC.renderBust = renderBust;

  // ===================================================== RANI ON HORSEBACK ==
  // Local frame: origin = centre of the horse's barrel; ground at y = +152.
  const legL1 = 62, legL2 = 72;
  function horseRider(phase, gallop, t) {
    const fillsBack = [], fills = [], lines = [];
    const legPts = (j, th1, th2) => {
      const k = [j[0] + Math.sin(th1) * legL1, j[1] + Math.cos(th1) * legL1];
      const h = [k[0] + Math.sin(th2) * legL2, k[1] + Math.cos(th2) * legL2];
      return [j, k, h];
    };
    // gait (rotary gallop) blended toward a proud standing pose as `gallop` → 0
    const legs = [
      { j: [-116, 18], off: 0.0, hind: true, far: true },
      { j: [104, 22], off: 2.4, hind: false, far: true },
      { j: [-104, 22], off: 0.6, hind: true, far: false },
      { j: [116, 24], off: 3.0, hind: false, far: false },
    ];
    const stand = [[-0.08, 0.04], [0.75, -0.95], [0.04, 0.0], [0.05, 0.02]];
    legs.forEach((L, i) => {
      const a = phase + L.off;
      let th1, th2;
      if (L.hind) { th1 = -0.05 + 0.55 * Math.sin(a); th2 = th1 + 0.25 + 0.55 * Math.max(0, -Math.sin(a + 0.6)); }
      else { th1 = 0.2 + 0.6 * Math.sin(a); th2 = th1 - (0.15 + 1.0 * Math.max(0, Math.sin(a + 1.3))); }
      th1 = lerp(stand[i][0], th1, gallop); th2 = lerp(stand[i][1], th2, gallop);
      const [j, k, h] = legPts(L.j, th1, th2);
      const col = L.far ? [44, 30, 22] : C.horse;
      (L.far ? fillsBack : fills).push({ pts: limb(j, k, 30, 17), color: col }, { pts: limb(k, h, 15, 11), color: col }, { pts: limb(h, [h[0] + 6, h[1] + 4], 15, 15), color: [26, 20, 16] });
      if (!L.far) lines.push({ pts: [j, k, h], w: 1.4 });
    });
    // tail & mane sway
    const sway = (s, f = 1) => Math.sin(t * 9 * f - s * 4) * 10 * s * (0.4 + 0.6 * gallop);
    const tailC = [[-160, -34], [-200, -24 + sway(0.3)], [-236, 6 + sway(0.6)], [-256, 46 + sway(0.85)], [-262, 86 + sway(1)]];
    const tail = open(tailC, 6);
    const tailPoly = [];
    tail.forEach((p, i) => { const w = 18 * (1 - i / tail.length) + 4; tailPoly.push([p[0], p[1] - w / 2]); });
    for (let i = tail.length - 1; i >= 0; i--) { const w = 18 * (1 - i / tail.length) + 4; tailPoly.push([tail[i][0] + 2, tail[i][1] + w / 2]); }
    fills.push({ pts: tailPoly, color: [40, 28, 22] });
    // body
    fills.push(
      { pts: ellipsePts(-110, -4, 64, 60, 28), color: C.horse },
      { pts: ellipsePts(0, 0, 142, 56, 36), color: C.horse },
      { pts: ellipsePts(106, -2, 56, 60, 28), color: C.horse },
      { pts: closed([[78, -36], [118, -84], [160, -134], [190, -164], [216, -144], [186, -80], [164, -16], [120, 34]], 5), color: C.horse },
      { pts: closed([[182, -166], [198, -184], [212, -170], [246, -132], [270, -106], [276, -90], [262, -79], [240, -86], [210, -108], [188, -128]], 5), color: C.horse },
      { pts: [[190, -172], [193, -200], [205, -174]], color: C.horse },
      { pts: ellipsePts(-10, -26, 110, 20, 24), color: C.horseLight, alpha: 0.45 },
      { pts: circ(214, -146, 4, 10), color: [18, 14, 12] },
    );
    // mane strands
    for (let i = 0; i < 9; i++) {
      const s = i / 8;
      const bx = lerp(118, 196, s), by = lerp(-86, -170, s);
      lines.push({ pts: open([[bx, by], [bx - 22, by + 4 + sway(0.5, 1.3) * 0.5], [bx - 42, by + 14 + sway(0.9, 1.3)]], 4), w: 6, color: [30, 22, 18] });
    }
    // rider
    const bob = 0;
    fills.push(
      { pts: closed([[-62, -56], [46, -60], [54, 0], [42, 28], [-56, 28], [-66, 0]], 4), color: [118, 28, 28] },
      { pts: circ(-34, -128 + bob, 30, 20), color: [92, 64, 34] },
      { pts: closed([[-16, -82], [22, -86], [62, -52], [58, -20], [54, 40], [38, 42], [40, -18], [0, -50]], 4), color: [226, 214, 188] },
      { pts: closed([[34, 36], [66, 38], [70, 50], [34, 50]], 2), color: [40, 28, 20] },
      { pts: closed([[-26, -70], [26, -74], [34, -122], [30, -170], [10, -186], [-14, -180], [-30, -150]], 5), color: C.maroon },
      { pts: closed([[-28, -86], [28, -90], [28, -76], [-28, -72]], 2), color: C.gold },
      { pts: closed([[2, -180], [16, -182], [18, -196], [4, -196]], 2), color: C.skinShade },
      { pts: closed([[-8, -198], [-14, -222], [0, -240], [22, -240], [32, -228], [34, -218], [41, -212], [34, -206], [34, -198], [26, -190], [14, -186], [2, -188]], 4), color: C.skin },
      { pts: closed([[-19, -220], [-18, -246], [0, -259], [26, -257], [37, -240], [31, -227], [10, -232], [-10, -226]], 4), color: C.turban },
      { pts: circ(30, -238, 4.5, 10), color: C.gold },
      { pts: closed([[2, -236], [-14, -226], [-20, -204], [-18, -178], [-10, -168], [-4, -176], [-8, -200], [2, -218]], 4), color: C.hair },
      { pts: ellipsePts(26, -217, 3.2, 2.2, 10), color: C.ink },
      { pts: circ(6, -203, 3.5, 10), color: C.gold },
    );
    lines.push({ pts: open([[19, -224], [26, -226], [32, -223]]), w: 2, color: C.hair });
    // scarf / dupatta streaming behind
    const scarf = [];
    for (let i = 0; i <= 20; i++) {
      const s = i / 20;
      scarf.push([-6 - 230 * s, -186 + 34 * s + Math.sin(6 * s - t * 10) * 20 * s * (0.5 + 0.5 * gallop)]);
    }
    const sPoly = [];
    scarf.forEach((p, i) => sPoly.push([p[0], p[1] - 13 * (1 - (i / 20) * 0.6)]));
    for (let i = scarf.length - 1; i >= 0; i--) sPoly.push([scarf[i][0], scarf[i][1] + 13 * (1 - (i / 20) * 0.6)]);
    fillsBack.unshift({ pts: sPoly, color: C.saffron });
    lines.push({ pts: open(scarf, 2), w: 1.2, color: [150, 70, 20] });
    // arms & sword (sword raised, rising with the settle pose)
    const raise = 1 - gallop * 0.35;
    const sh = [16, -168], el = [44 + 6 * raise, -196 - 14 * raise], hd = [56 + 8 * raise, -238 - 24 * raise];
    fills.push({ pts: limb(sh, el, 18, 15), color: C.maroon }, { pts: limb(el, hd, 14, 11), color: C.maroon }, { pts: circ(hd[0], hd[1], 7, 10), color: C.skin });
    const tip = [hd[0] - 50 - 20 * raise, hd[1] - 120 - 20 * raise];
    const blade = open([hd, [hd[0] + 2, hd[1] - 40], [lerp(hd[0], tip[0], 0.6) + 12, lerp(hd[1], tip[1], 0.6)], tip], 6);
    lines.push({ pts: blade, w: 6, color: [150, 150, 160] }, { pts: blade, w: 2, color: [235, 235, 240] }, { pts: [[hd[0] - 14, hd[1] - 4], [hd[0] + 14, hd[1] + 4]], w: 5, color: C.gold });
    const sh2 = [22, -158], el2 = [52, -124], hd2 = [92, -108];
    fills.push({ pts: limb(sh2, el2, 16, 13), color: [120, 30, 28] }, { pts: limb(el2, hd2, 12, 10), color: [120, 30, 28] }, { pts: circ(hd2[0], hd2[1], 6, 10), color: C.skin });
    lines.push({ pts: [hd2, [180, -110], [262, -86]], w: 1.4, color: [60, 30, 20] });
    lines.push({ pts: open([[8, -258], [0, -282], [-14, -300]], 4), w: 3, color: [240, 236, 220] });
    lines.push({ pts: closed([[-8, -198], [-14, -222], [0, -240], [22, -240], [32, -228], [34, -218], [41, -212], [34, -206], [34, -198], [26, -190], [14, -186], [2, -188]], 4), w: 1.4 });
    return { fillsBack, fills, lines };
  }
  FC.horseRider = horseRider;

  // ====================================================== GANDHI WALKING ==
  // Local frame: origin on the ground under the hips; figure ≈ 430 tall.
  function gandhiWalk(phase) {
    const back = [], fills = [], lines = [];
    const bob = -5 * Math.abs(Math.cos(phase));
    const hip = [8, -205 + bob];
    const leg = (ph) => {
      const th1 = 0.36 * Math.sin(ph);
      const th2 = th1 - 0.55 * Math.max(0, Math.cos(ph)) * (Math.sin(ph) < 0.6 ? 1 : 0.5);
      const k = [hip[0] + Math.sin(th1) * 104, hip[1] + Math.cos(th1) * 104];
      const a = [k[0] + Math.sin(th2) * 100, k[1] + Math.cos(th2) * 100];
      return [k, a];
    };
    const [kB, aB] = leg(phase + Math.PI), [kF, aF] = leg(phase);
    const foot = (a, c) => ({ pts: closed([[a[0] - 8, a[1] - 4], [a[0] + 22, a[1] - 2], [a[0] + 24, a[1] + 4], [a[0] - 8, a[1] + 4]], 2), color: c });
    back.push({ pts: limb(kB, aB, 13, 10), color: C.skinShade }, foot(aB, [92, 66, 44]));
    // back arm
    const sw = Math.sin(phase);
    const shB = [2, -328 + bob], elB = [-8 - 22 * sw, -270 + bob], hdB = [-4 - 34 * sw, -216 + bob];
    back.push({ pts: limb(shB, elB, 14, 11), color: C.skinShade }, { pts: limb(elB, hdB, 11, 9), color: C.skinShade });
    fills.push({ pts: limb(kF, aF, 13, 10), color: C.skinG }, foot(aF, [104, 74, 50]));
    // dhoti follows the knees
    fills.push({ pts: closed([[-36, -240 + bob], [40, -242 + bob], [Math.max(kF[0], kB[0]) + 20, Math.max(kF[1], kB[1]) + 18], [lerp(kF[0], kB[0], 0.5), (kF[1] + kB[1]) / 2 + 6], [Math.min(kF[0], kB[0]) - 18, Math.max(kF[1], kB[1]) + 16]], 4), color: C.white });
    lines.push({ pts: open([[-10, -230 + bob], [lerp(-10, kB[0], 0.6), lerp(-230, kB[1], 0.6)], [kB[0] - 8, kB[1] + 10]], 4), w: 1.2, color: [130, 130, 135] });
    lines.push({ pts: open([[20, -230 + bob], [lerp(20, kF[0], 0.6), lerp(-230, kF[1], 0.6)], [kF[0] + 6, kF[1] + 12]], 4), w: 1.2, color: [130, 130, 135] });
    // torso with shawl, leaning forward
    const torso = closed([[-34, -238], [40, -242], [54, -290], [52, -334], [32, -352], [-10, -356], [-36, -336], [-44, -290]], 5).map(([x, y]) => [x + (y + 240) * -0.07, y + bob]);
    fills.push({ pts: torso, color: C.white });
    fills.push({ pts: closed([[-40, -330], [30, -352], [56, -300], [-20, -240]], 4).map(([x, y]) => [x + (y + 240) * -0.07, y + bob]), color: C.whiteShade, alpha: 0.4 });
    lines.push({ pts: torso.concat([torso[0]]), w: 1.6 });
    lines.push({ pts: open([[-30, -335], [10, -300], [48, -250]].map(([x, y]) => [x + (y + 240) * -0.07, y + bob])), w: 1.2, color: [120, 120, 130] });
    // head
    const hx = 30, hy = bob;
    const head = closed([[10, -372], [6, -395], [16, -418], [40, -428], [62, -420], [72, -402], [76, -390], [85, -379], [77, -373], [76, -363], [68, -353], [52, -349], [34, -352]], 4).map(([x, y]) => [x - hx + 30, y + hy]);
    fills.push({ pts: closed([[22, -352], [40, -352], [42, -372], [24, -372]], 2).map(([x, y]) => [x, y + bob]), color: C.skinShade });
    fills.push({ pts: head, color: C.skinG });
    fills.push({ pts: ellipsePts(32, -390 + bob, 8, 12, 12), color: C.skinShade });
    lines.push({ pts: head.concat([head[0]]), w: 1.6 });
    const g = ellipsePts(70, -389 + bob, 8, 8, 20);
    lines.push({ pts: g.concat([g[0]]), w: 1.8 }, { pts: [[62, -391 + bob], [36, -395 + bob]], w: 1.4 });
    lines.push({ pts: open([[66, -366 + bob], [72, -364 + bob], [78, -366 + bob]]), w: 2.2, color: [220, 216, 206] });
    // front arm holding the staff
    const shF = [36, -332 + bob], elF = [62 + 4 * sw, -282 + bob], hdF = [96 + 6 * sw, -270 + bob];
    fills.push({ pts: limb(shF, elF, 14, 11), color: C.skinG }, { pts: limb(elF, hdF, 11, 9), color: C.skinG });
    const stickBot = [128 + 34 * Math.sin(phase - 0.6), 0];
    const dir = [stickBot[0] - hdF[0], stickBot[1] - hdF[1]], dl = Math.hypot(dir[0], dir[1]);
    const stickTop = [hdF[0] - dir[0] / dl * 70, hdF[1] - dir[1] / dl * 70];
    lines.push({ pts: open([stickTop, hdF, stickBot], 3), w: 6, color: [92, 64, 38] });
    fills.push({ pts: circ(hdF[0], hdF[1], 7, 10), color: C.skinG });
    return { back, fills, lines };
  }
  FC.gandhiWalk = gandhiWalk;

  // ====================================================== CROWD FIGURES ==
  /**
   * Silhouette person. type: walker | protester | soldier | spearman | banner
   * Facing right. (x, y) is the ground point; s scales a ~170px-tall figure.
   */
  function person(ctx, x, y, s, phase, type, color, alpha = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = rgba(color, alpha);
    ctx.strokeStyle = rgba(color, alpha);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const march = type === 'soldier';
    const amp = march ? 0.42 : type === 'walker' ? 0.34 : 0.08;
    const bob = -3 * Math.abs(Math.cos(phase));
    const hip = [0, -88 + bob];
    const drawLeg = (ph) => {
      const th1 = amp * Math.sin(ph);
      const th2 = th1 - (march ? 0.15 : 0.45) * Math.max(0, Math.cos(ph));
      const k = [hip[0] + Math.sin(th1) * 44, hip[1] + Math.cos(th1) * 44];
      const a = [k[0] + Math.sin(th2) * 44, k[1] + Math.cos(th2) * 44];
      ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(hip[0], hip[1]); ctx.lineTo(k[0], k[1]); ctx.lineTo(a[0], a[1]); ctx.lineTo(a[0] + 9, a[1]); ctx.stroke();
    };
    drawLeg(phase + Math.PI); drawLeg(phase);
    // torso
    ctx.beginPath();
    ctx.moveTo(-12, -86 + bob); ctx.lineTo(13, -86 + bob); ctx.lineTo(16, -140 + bob); ctx.quadraticCurveTo(0, -150 + bob, -16, -140 + bob); ctx.closePath(); ctx.fill();
    if (type === 'walker') { // dhoti flare
      ctx.beginPath(); ctx.moveTo(-14, -92 + bob); ctx.lineTo(16, -92 + bob); ctx.lineTo(20, -52); ctx.lineTo(-18, -52); ctx.closePath(); ctx.fill();
    }
    // head
    ctx.beginPath(); ctx.arc(2, -158 + bob, 11, 0, Math.PI * 2); ctx.fill();
    if (type === 'walker') { ctx.beginPath(); ctx.moveTo(-10, -164 + bob); ctx.lineTo(13, -166 + bob); ctx.lineTo(6, -176 + bob); ctx.lineTo(-6, -174 + bob); ctx.closePath(); ctx.fill(); }
    if (type === 'soldier') { ctx.beginPath(); ctx.moveTo(-12, -164 + bob); ctx.lineTo(14, -164 + bob); ctx.lineTo(22, -160 + bob); ctx.lineTo(12, -172 + bob); ctx.lineTo(-10, -172 + bob); ctx.closePath(); ctx.fill(); }
    if (type === 'spearman') { ctx.beginPath(); ctx.arc(2, -166 + bob, 12, Math.PI, 0); ctx.fill(); }
    ctx.lineWidth = 8;
    const sw = Math.sin(phase);
    if (type === 'protester' || type === 'banner') {
      const lift = 0.5 + 0.5 * Math.sin(phase * 0.5);
      ctx.beginPath(); ctx.moveTo(6, -136 + bob); ctx.lineTo(16, -168 - lift * 6 + bob); ctx.lineTo(20 + lift * 2, -200 - lift * 8 + bob); ctx.stroke();
      ctx.beginPath(); ctx.arc(21 + lift * 2, -204 - lift * 8 + bob, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-6, -136 + bob); ctx.lineTo(-12, -110 + bob); ctx.lineTo(-8, -88 + bob); ctx.stroke();
      if (type === 'banner') {
        ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(21, -200 + bob); ctx.lineTo(21, -270 + bob); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(21, -270 + bob);
        for (let i = 0; i <= 8; i++) ctx.lineTo(21 + i * 9, -270 + bob + Math.sin(i * 0.8 - phase * 2) * 4);
        for (let i = 8; i >= 0; i--) ctx.lineTo(21 + i * 9, -238 + bob + Math.sin(i * 0.8 - phase * 2) * 4);
        ctx.closePath(); ctx.fill();
      }
    } else if (type === 'soldier') {
      ctx.beginPath(); ctx.moveTo(-4, -136 + bob); ctx.lineTo(-10 - sw * 14, -112 + bob); ctx.lineTo(-6 - sw * 20, -90 + bob); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(8, -136 + bob); ctx.lineTo(12, -116 + bob); ctx.lineTo(6, -132 + bob); ctx.stroke();
      ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-2, -96 + bob); ctx.lineTo(18, -200 + bob); ctx.stroke();
    } else if (type === 'spearman') {
      ctx.beginPath(); ctx.moveTo(6, -136 + bob); ctx.lineTo(20, -112 + bob); ctx.stroke();
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(20, -40 + bob); ctx.lineTo(22, -232 + bob); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(22, -248 + bob); ctx.lineTo(27, -228 + bob); ctx.lineTo(17, -228 + bob); ctx.closePath(); ctx.fill();
    } else {
      ctx.beginPath(); ctx.moveTo(-4, -136 + bob); ctx.lineTo(-8 - sw * 12, -112 + bob); ctx.lineTo(-4 - sw * 18, -90 + bob); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(8, -136 + bob); ctx.lineTo(12 + sw * 12, -112 + bob); ctx.lineTo(10 + sw * 18, -90 + bob); ctx.stroke();
    }
    ctx.restore();
  }
  FC.person = person;
})();
