/*
  SPOKEN AI - Intro (0-18s)
  Recreates the style of the reference: dark B&W footage + caption, push-in into a
  glowing voice orb, floating glass UI cards, then the headline "U speak / We listen".

  HOW TO USE
  1. After Effects > File > Scripts > Run Script File...  and pick this file.
  2. File > Save As... to keep the .aep project.
  Everything it builds is normal After Effects layers:
   - Text: double-click any text layer and type.
   - Colours: select the CONTROLS layer > Effect Controls panel > change the swatches.
   - Footage: select the FOOTAGE layer, then Alt-drag (Option-drag on Mac) your clip
     from the Project panel onto it - it keeps all the animation.
   - Logo: double-click the "Orb" layer to open the orb comp and edit "SPOKEN AI".
  Font used: Inter (free from Google Fonts). Install it before running for best results.
*/

(function () {

    // ------------------------------------------------------------------ settings
    var COMP_NAME = "SPOKEN AI - Main";
    var ORB_NAME = "Orb - SPOKEN AI";
    var W = 1920, H = 1080, FPS = 24, DUR = 18;

    var BRAND = "SPOKEN AI";
    var LINE1 = "U speak";
    var LINE2 = "We listen";
    var CAPTION = "Most customer calls still start like this:\rlong waits, missed calls, lost customers.";

    var FONT_BOLD = "Inter-Bold";
    var FONT_SEMI = "Inter-SemiBold";
    var FONT_REG = "Inter-Regular";

    var COLORS = [
        ["Background Deep", "#040A1F"],
        ["Background Glow", "#0B2A6B"],
        ["Glow Blue", "#1E5BD8"],
        ["Cyan Highlight", "#4FA8FF"],
        ["Ice White", "#DCE8FF"],
        ["Logo Blue", "#2A62D6"],
        ["Headline Top", "#8CC8FF"],
        ["Headline Bottom", "#2F6FF0"]
    ];

    // ------------------------------------------------------------------ helpers
    function hex(h) {
        return [parseInt(h.substr(1, 2), 16) / 255, parseInt(h.substr(3, 2), 16) / 255, parseInt(h.substr(5, 2), 16) / 255];
    }
    function colorOf(name) {
        for (var i = 0; i < COLORS.length; i++) { if (COLORS[i][0] === name) { return hex(COLORS[i][1]); } }
        return [1, 1, 1];
    }
    // expression that reads a colour from the CONTROLS layer (works from any comp)
    function ctrl(name) {
        return 'comp("' + COMP_NAME + '").layer("CONTROLS").effect("' + name + '")("Color")';
    }

    var TR = { pos: "ADBE Position", scale: "ADBE Scale", rot: "ADBE Rotate Z", op: "ADBE Opacity",
               anchor: "ADBE Anchor Point", rx: "ADBE Rotate X", ry: "ADBE Rotate Y" };
    function tr(layer, key) { return layer.property("ADBE Transform Group").property(TR[key]); }

    function easeArr(n, inf) { var a = []; for (var i = 0; i < n; i++) { a.push(new KeyframeEase(0, inf)); } return a; }
    function easeKey(prop, k, inf) {
        for (var d = 1; d <= 3; d++) {
            try { prop.setTemporalEaseAtKey(k, easeArr(d, inf), easeArr(d, inf)); return; } catch (e) {}
        }
    }
    // keys(prop, [[time, value], ...], mode)  mode: number = ease influence, "linear", "hold"
    function keys(prop, list, mode) {
        var i;
        for (i = 0; i < list.length; i++) { prop.setValueAtTime(list[i][0], list[i][1]); }
        for (i = 1; i <= prop.numKeys; i++) {
            if (mode === "hold") { prop.setInterpolationTypeAtKey(i, KeyframeInterpolationType.HOLD); }
            else if (mode === "linear") { prop.setInterpolationTypeAtKey(i, KeyframeInterpolationType.LINEAR); }
            else {
                prop.setInterpolationTypeAtKey(i, KeyframeInterpolationType.BEZIER);
                easeKey(prop, i, mode ? mode : 75);
            }
        }
    }

    function effects(layer) { return layer.property("ADBE Effect Parade"); }
    function addFx(layer, match, name) {
        var e = effects(layer).addProperty(match);
        if (name) { e.name = name; }
        return effects(layer).property(e.name);
    }
    function setP(e, idx, v) { try { e.property(idx).setValue(v); } catch (err) {} }
    function exprP(e, idx, x) { try { e.property(idx).expression = x; } catch (err) {} }

    function addBlur(layer, amount, name) {
        var e = addFx(layer, "ADBE Gaussian Blur 2", name ? name : "Blur");
        setP(e, 1, amount);
        setP(e, 3, 1); // repeat edge pixels off/on varies by version; harmless
        return e;
    }
    function blurProp(layer, name) { return effects(layer).property(name ? name : "Blur").property(1); }

    function addGlow(layer, radius, intensity) {
        var e = addFx(layer, "ADBE Glo2", "Glow");
        setP(e, 3, radius);
        setP(e, 4, intensity);
        return e;
    }
    // Gradient Ramp: shape 1 = linear, 2 = radial
    function addRamp(layer, p1, c1Name, p2, c2Name, shape, name) {
        var e = addFx(layer, "ADBE Ramp", name ? name : "Gradient");
        setP(e, 1, p1); setP(e, 2, colorOf(c1Name)); exprP(e, 2, ctrl(c1Name));
        setP(e, 3, p2); setP(e, 4, colorOf(c2Name)); exprP(e, 4, ctrl(c2Name));
        setP(e, 5, shape);
        return e;
    }
    function addFillFx(layer, cName) {
        var e = addFx(layer, "ADBE Fill", "Colour");
        setP(e, 3, colorOf(cName)); exprP(e, 3, ctrl(cName));
        return e;
    }

    // ---- shape helpers (every lookup is fresh, so adding siblings never breaks references)
    function shapeLayer(comp, name) { var l = comp.layers.addShape(); l.name = name; return l; }
    function root(layer) { return layer.property("ADBE Root Vectors Group"); }
    function addGroup(layer, gname) { var g = root(layer).addProperty("ADBE Vector Group"); g.name = gname; return gname; }
    function gc(layer, gname) { return root(layer).property(gname).property("ADBE Vectors Group"); }
    function gPos(layer, gname, p) { root(layer).property(gname).property("ADBE Vector Transform Group").property("ADBE Vector Position").setValue(p); }
    function addRect(layer, gname, size, round, pos) {
        var r = gc(layer, gname).addProperty("ADBE Vector Shape - Rect");
        r.property("ADBE Vector Rect Size").setValue(size);
        r.property("ADBE Vector Rect Roundness").setValue(round ? round : 0);
        if (pos) { r.property("ADBE Vector Rect Position").setValue(pos); }
        return r;
    }
    function addEllipse(layer, gname, size, pos) {
        var e = gc(layer, gname).addProperty("ADBE Vector Shape - Ellipse");
        e.property("ADBE Vector Ellipse Size").setValue(size);
        if (pos) { e.property("ADBE Vector Ellipse Position").setValue(pos); }
        return e;
    }
    function addFill(layer, gname, cName, opacity) {
        var f = gc(layer, gname).addProperty("ADBE Vector Graphic - Fill");
        f.property("ADBE Vector Fill Color").setValue(colorOf(cName));
        f.property("ADBE Vector Fill Color").expression = ctrl(cName);
        f.property("ADBE Vector Fill Opacity").setValue(opacity === undefined ? 100 : opacity);
        return f;
    }
    function addStroke(layer, gname, cName, width, opacity) {
        var s = gc(layer, gname).addProperty("ADBE Vector Graphic - Stroke");
        s.property("ADBE Vector Stroke Color").setValue(colorOf(cName));
        s.property("ADBE Vector Stroke Color").expression = ctrl(cName);
        s.property("ADBE Vector Stroke Width").setValue(width);
        s.property("ADBE Vector Stroke Opacity").setValue(opacity === undefined ? 100 : opacity);
        return s;
    }

    function textLayer(comp, name, str, font, size, cName, pos, tracking) {
        var l = comp.layers.addText(str);
        l.name = name;
        var sp = l.property("ADBE Text Properties").property("ADBE Text Document");
        var td = sp.value;
        try { td.font = font; } catch (e) {}
        td.fontSize = size;
        td.applyFill = true;
        td.fillColor = colorOf(cName);
        td.applyStroke = false;
        td.justification = ParagraphJustification.CENTER_JUSTIFY;
        td.tracking = tracking ? tracking : 0;
        sp.setValue(td);
        tr(l, "pos").setValue(pos);
        return l;
    }

    // word-by-word blur reveal using a normal Text Animator (editable in the timeline)
    function revealWords(layer, t0, t1) {
        var animators = function () { return layer.property("ADBE Text Properties").property("ADBE Text Animators"); };
        var a = animators().addProperty("ADBE Text Animator");
        a.name = "Reveal";
        var props = function () { return animators().property("Reveal").property("ADBE Text Animator Properties"); };
        props().addProperty("ADBE Text Opacity");
        props().property("ADBE Text Opacity").setValue(0);
        try {
            props().addProperty("ADBE Text Blur");
            props().property("ADBE Text Blur").setValue([24, 24]);
        } catch (e1) {}
        try {
            props().addProperty("ADBE Text Position 3D");
            props().property("ADBE Text Position 3D").setValue([0, 40, 0]);
        } catch (e2) {}
        var sel = animators().property("Reveal").property("ADBE Text Selectors").addProperty("ADBE Text Selector");
        sel = animators().property("Reveal").property("ADBE Text Selectors").property(1);
        try { sel.property("ADBE Text Range Advanced").property("ADBE Text Range Type2").setValue(3); } catch (e3) {}
        keys(sel.property("ADBE Text Percent Start"), [[t0, 0], [t1, 100]], 60);
    }

    // ------------------------------------------------------------------ build
    app.beginUndoGroup("Build SPOKEN AI Intro");
    var proj = app.project ? app.project : app.newProject();
    var folder = proj.items.addFolder("SPOKEN AI Intro");

    var main = proj.items.addComp(COMP_NAME, W, H, 1, DUR, FPS);
    main.parentFolder = folder;
    main.bgColor = colorOf("Background Deep");
    main.motionBlur = true;

    // ---- CONTROLS (made first so every colour expression can find it)
    var controls = main.layers.addNull(DUR);
    controls.name = "CONTROLS";
    for (var ci = 0; ci < COLORS.length; ci++) {
        var cc = addFx(controls, "ADBE Color Control", COLORS[ci][0]);
        setP(cc, 1, hex(COLORS[ci][1]));
    }
    tr(controls, "pos").setValue([80, 80]);

    // =============================================================== ORB PRECOMP
    var orb = proj.items.addComp(ORB_NAME, 1000, 1000, 1, DUR, FPS);
    orb.parentFolder = folder;
    var C = [500, 500];

    // outer haze
    var haze = shapeLayer(orb, "Orb - Outer Haze");
    addGroup(haze, "Haze"); addEllipse(haze, "Haze", [780, 780]); addFill(haze, "Haze", "Glow Blue", 100);
    addBlur(haze, 90);
    tr(haze, "op").setValue(70);
    haze.blendingMode = BlendingMode.ADD;

    // thick soft rim glow
    var rimGlow = shapeLayer(orb, "Orb - Rim Glow");
    addGroup(rimGlow, "Ring"); addEllipse(rimGlow, "Ring", [620, 620]); addStroke(rimGlow, "Ring", "Cyan Highlight", 46, 100);
    addBlur(rimGlow, 30);
    rimGlow.blendingMode = BlendingMode.ADD;

    // wavy rims (Turbulent Displace makes the liquid edge)
    function wavyRim(name, size, width, cName, amount, scale, evo, spin, opacity) {
        var l = shapeLayer(orb, name);
        addGroup(l, "Ring");
        var e = addEllipse(l, "Ring", [size, size]);
        e.property("ADBE Vector Ellipse Size").expression = "var s = " + size + " + Math.sin(time*2.1)*10; [s, s]";
        addStroke(l, "Ring", cName, width, opacity);
        var td = addFx(l, "ADBE Turbulent Displace", "Liquid Edge");
        setP(td, 2, amount);
        setP(td, 3, scale);
        setP(td, 5, 2);
        exprP(td, 6, "time*" + evo);
        tr(l, "rot").expression = "time*" + spin;
        l.blendingMode = BlendingMode.ADD;
        return l;
    }
    wavyRim("Orb - Wavy Rim A", 650, 10, "Cyan Highlight", 26, 60, 90, 8, 100);
    wavyRim("Orb - Wavy Rim B", 615, 5, "Ice White", 34, 85, -70, -12, 70);
    var fine = wavyRim("Orb - Wavy Rim Fine Lines", 680, 30, "Cyan Highlight", 40, 110, 55, 5, 35);
    try {
        var st = gc(fine, "Ring").property("ADBE Vector Graphic - Stroke").property("ADBE Vector Stroke Dashes");
        st.addProperty("ADBE Vector Stroke Dash 1");
        gc(fine, "Ring").property("ADBE Vector Graphic - Stroke").property("ADBE Vector Stroke Dashes").property("ADBE Vector Stroke Dash 1").setValue(2);
        gc(fine, "Ring").property("ADBE Vector Graphic - Stroke").property("ADBE Vector Stroke Dashes").addProperty("ADBE Vector Stroke Gap 1");
        gc(fine, "Ring").property("ADBE Vector Graphic - Stroke").property("ADBE Vector Stroke Dashes").property("ADBE Vector Stroke Gap 1").setValue(5);
    } catch (eDash) {}

    // frosted glass core
    var core = shapeLayer(orb, "Orb - Glass Core");
    addGroup(core, "Core"); addEllipse(core, "Core", [570, 570]); addFill(core, "Core", "Ice White", 100);
    addRamp(core, [430, 400], "Ice White", [780, 760], "Glow Blue", 2, "Glass Gradient");

    // moving highlight that circles inside the glass
    var hi = shapeLayer(orb, "Orb - Glass Highlight");
    addGroup(hi, "Highlight"); addEllipse(hi, "Highlight", [200, 400], [-95, 0]); addFill(hi, "Highlight", "Ice White", 100);
    addBlur(hi, 45);
    tr(hi, "rot").expression = "time*28";
    tr(hi, "op").setValue(75);
    hi.blendingMode = BlendingMode.SCREEN;

    // waveform bars behind the logo
    var bars = shapeLayer(orb, "Logo - Waveform Bars");
    var NB = 41;
    for (var b = 0; b < NB; b++) {
        var gn = "Bar " + (b + 1);
        addGroup(bars, gn);
        var r = addRect(bars, gn, [7, 100], 3.5);
        r.property("ADBE Vector Rect Size").expression =
            "var i = " + b + "; var n = " + NB + ";\n" +
            "var x = (i - (n-1)/2) / ((n-1)/2);\n" +
            "var env = Math.exp(-x*x*2.2);\n" +
            "var h = 30 + 250*env*(0.55 + 0.45*Math.abs(Math.sin(time*3.1 + i*1.7)));\n" +
            "[7, h]";
        gPos(bars, gn, [(b - (NB - 1) / 2) * 12, 0]);
    }
    var barFill = root(bars).addProperty("ADBE Vector Graphic - Fill");
    barFill.property("ADBE Vector Fill Color").setValue(colorOf("Glow Blue"));
    barFill.property("ADBE Vector Fill Color").expression = ctrl("Glow Blue");
    tr(bars, "op").setValue(80);

    // logo word
    var logo = textLayer(orb, "Logo - " + BRAND + " (edit text here)", BRAND, FONT_BOLD, 86, "Logo Blue", [500, 530], 10);
    addFillFx(logo, "Logo Blue");
    tr(logo, "op").setValue(88);

    // =============================================================== MAIN COMP
    // background
    var bg = main.layers.addSolid(colorOf("Background Deep"), "BG - Navy Gradient", W, H, 1, DUR);
    addRamp(bg, [960, 560], "Background Glow", [960 + 1150, 560], "Background Deep", 2, "BG Gradient");

    // haze behind the orb (follows the orb)
    var bgHaze = shapeLayer(main, "BG - Orb Haze");
    addGroup(bgHaze, "Haze"); addEllipse(bgHaze, "Haze", [1200, 950]); addFill(bgHaze, "Haze", "Glow Blue", 100);
    addBlur(bgHaze, 220);
    bgHaze.blendingMode = BlendingMode.ADD;
    keys(tr(bgHaze, "op"), [[8.5, 0], [9.6, 55]], 70);

    // ---- footage placeholder (0 - 9.3s)
    var foot = main.layers.addSolid([0.16, 0.18, 0.2], "FOOTAGE - replace with your phone or office clip", W, H, 1, DUR);
    addRamp(foot, [960, 0], "Ice White", [960, 1080], "Background Deep", 1, "Placeholder Look");
    tr(foot, "op").setValue(100);
    keys(tr(foot, "scale"), [[0, [100, 100, 100]], [9.3, [110, 110, 100]]], "linear");
    keys(tr(foot, "op"), [[8.5, 100], [9.2, 0]], 70);
    addBlur(foot, 0);
    keys(blurProp(foot), [[8.4, 0], [9.1, 30]], 70);
    foot.outPoint = 9.3;

    var grade = main.layers.addSolid([1, 1, 1], "Footage Grade - Black and White", W, H, 1, DUR);
    grade.adjustmentLayer = true;
    var tint = addFx(grade, "ADBE Tint", "Black and White");
    setP(tint, 3, 100);
    keys(tr(grade, "op"), [[8.5, 100], [9.2, 0]], 70);
    grade.outPoint = 9.3;

    var guide = textLayer(main, "GUIDE - placeholder note (does not render)",
        "PLACEHOLDER: Alt-drag your footage onto the FOOTAGE layer", FONT_SEMI, 34, "Ice White", [960, 1000], 0);
    guide.guideLayer = true;
    guide.outPoint = 9.3;

    // ---- caption
    var cap = textLayer(main, "01 Caption", CAPTION, FONT_SEMI, 50, "Ice White", [960, 505], -10);
    try {
        var cd = cap.property("ADBE Text Properties").property("ADBE Text Document");
        var ctd = cd.value; ctd.fillColor = [1, 1, 1]; ctd.autoLeading = false; ctd.leading = 58; cd.setValue(ctd);
    } catch (eLead) {}
    var ds = addFx(cap, "ADBE Drop Shadow", "Shadow");
    setP(ds, 4, 3); setP(ds, 5, 24);
    addBlur(cap, 20);
    keys(tr(cap, "op"), [[1.3, 0], [2.1, 100], [8.2, 100], [8.9, 0]], 70);
    keys(blurProp(cap), [[1.3, 20], [2.1, 0], [8.2, 0], [8.9, 25]], 70);
    keys(tr(cap, "scale"), [[1.3, [100, 100, 100]], [8.9, [104, 104, 100]]], "linear");
    cap.outPoint = 9.0;

    // ---- floating glass UI cards (3D layers)
    function uiCard(name, w, h, pos, rotY, rotZ, tIn, pill) {
        var l = shapeLayer(main, name);
        var round = pill ? h / 2 : 18;
        // content first so the panel draws underneath (top group = drawn on top)
        addGroup(l, "Content");
        if (pill) {
            addEllipse(l, "Content", [h - 24, h - 24], [-w / 2 + h / 2, 0]);
            addEllipse(l, "Content", [h - 24, h - 24], [w / 2 - h / 2, 0]);
            addRect(l, "Content", [w - h * 2 - 20, 6], 3, [0, 0]);
        } else {
            addRect(l, "Content", [w * 0.42, 16], 8, [-w / 2 + 30 + w * 0.21, -h / 2 + 38]);
            var rows = Math.floor((h - 110) / 26);
            for (var k = 0; k < rows; k++) {
                var lw = w * (k % 3 === 2 ? 0.55 : 0.82);
                addRect(l, "Content", [lw, 8], 4, [-w / 2 + 30 + lw / 2, -h / 2 + 80 + k * 26]);
            }
            addEllipse(l, "Content", [36, 36], [-w / 2 + 48, h / 2 - 36]);
        }
        addFill(l, "Content", "Ice White", 55);
        addGroup(l, "Panel");
        addRect(l, "Panel", [w, h], round);
        addFill(l, "Panel", "Glow Blue", 28);
        addStroke(l, "Panel", "Cyan Highlight", 2, 85);
        addGlow(l, 24, 0.8);

        l.threeDLayer = true;
        l.motionBlur = true;
        tr(l, "ry").setValue(rotY);
        tr(l, "rot").setValue(rotZ);

        var dx = pos[0] - 960, dy = pos[1] - 540;
        var len = Math.sqrt(dx * dx + dy * dy); dx = dx / len; dy = dy / len;
        var start = [pos[0] + dx * 500, pos[1] + dy * 300, pos[2] - 900];
        var drift = [pos[0] - dx * 40, pos[1] - dy * 25, pos[2] - 60];
        var out = [pos[0] + dx * 700, pos[1] + dy * 400, pos[2] - 700];
        keys(tr(l, "pos"), [[tIn, start], [tIn + 1.0, pos], [14.2, drift], [15.1, out]], 70);
        keys(tr(l, "op"), [[tIn, 0], [tIn + 0.5, 100], [14.5, 100], [15.1, 0]], 60);
        l.inPoint = tIn;
        l.outPoint = 15.2;
        return l;
    }
    uiCard("UI Card 1 - Voice Pill (placeholder)", 430, 84, [330, 660, -100], 28, -4, 10.3, true);
    uiCard("UI Card 2 - Call Summary (placeholder)", 520, 340, [1560, 300, 100], -32, 8, 10.6, false);
    uiCard("UI Card 3 - Notes (placeholder)", 460, 300, [300, 280, 150], 30, -6, 11.0, false);
    uiCard("UI Card 4 - Sales Report (placeholder)", 560, 260, [1600, 820, -50], -28, -10, 11.3, false);
    uiCard("UI Card 5 - Contact (placeholder)", 380, 120, [540, 930, 0], 20, 3, 11.7, false);

    // ---- the orb
    var orbL = main.layers.add(orb);
    orbL.name = "Orb (double-click to edit logo)";
    orbL.motionBlur = true;
    keys(tr(orbL, "scale"), [[8.25, [460, 460, 100]], [9.6, [100, 100, 100]], [14.0, [100, 100, 100]], [15.4, [62, 62, 100]]], 80);
    keys(tr(orbL, "pos"), [[14.0, [960, 540]], [15.4, [960, 800]]], 80);
    tr(orbL, "pos").expression = "value + [0, Math.sin(time*1.3)*10]";
    keys(tr(orbL, "op"), [[8.25, 0], [8.55, 100]], 50);
    addGlow(orbL, 60, 1.0);
    orbL.inPoint = 8.25;

    tr(bgHaze, "pos").expression = 'thisComp.layer("' + orbL.name + '").transform.position';

    // ---- product screenshot placeholder rising at the end
    var screen = shapeLayer(main, "Screen Placeholder - put your product screenshot here");
    addGroup(screen, "Top Bar");
    addRect(screen, "Top Bar", [1160, 4], 2, [0, -230]);
    addRect(screen, "Top Bar", [120, 18], 9, [-500, -258]);
    addFill(screen, "Top Bar", "Ice White", 45);
    addGroup(screen, "Panel");
    addRect(screen, "Panel", [1200, 560], 22);
    addFill(screen, "Panel", "Glow Blue", 30);
    addStroke(screen, "Panel", "Cyan Highlight", 2, 90);
    addGlow(screen, 30, 0.8);
    keys(tr(screen, "pos"), [[15.0, [960, 1500]], [16.4, [960, 920]]], 80);
    keys(tr(screen, "op"), [[15.0, 0], [15.5, 100]], 60);
    screen.inPoint = 15.0;

    var screenTxt = textLayer(main, "Screen Placeholder - label", "Your product screenshot here", FONT_SEMI, 40, "Ice White", [960, 800], 0);
    screenTxt.parent = screen;
    tr(screenTxt, "pos").setValue([0, -130]);
    tr(screenTxt, "op").expression = 'thisComp.layer("' + screen.name + '").transform.opacity';
    screenTxt.inPoint = 15.0;

    // ---- headline
    var h1 = textLayer(main, "02 Headline - " + LINE1, LINE1, FONT_REG, 54, "Ice White", [960, 150], 0);
    revealWords(h1, 14.0, 14.8);
    h1.inPoint = 13.9;

    var h2 = textLayer(main, "03 Headline - " + LINE2, LINE2, FONT_BOLD, 124, "Headline Bottom", [960, 290], -10);
    addRamp(h2, [0, -100], "Headline Top", [0, 10], "Headline Bottom", 1, "Headline Gradient");
    addGlow(h2, 20, 0.6);
    revealWords(h2, 14.8, 15.6);
    h2.inPoint = 14.7;

    controls.moveToBeginning();
    main.openInViewer();
    app.endUndoGroup();

    alert("SPOKEN AI intro built.\n\n" +
          "- Comp: " + COMP_NAME + " (18 s, 1920x1080, 24 fps)\n" +
          "- Colours: select CONTROLS > Effect Controls\n" +
          "- Footage: Alt-drag your clip onto the FOOTAGE layer\n" +
          "- Logo: double-click the Orb layer\n\n" +
          "Now use File > Save As to keep the project.");
})();
