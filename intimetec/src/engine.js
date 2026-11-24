/*
 * engine.js — 2.5D compositor for floating glass UI panels.
 *
 * World space is measured in logical pixels (1920×1080 frame): x right,
 * y down, z away from the camera. With the default camera, the z = 0 plane
 * maps 1:1 onto the frame. The virtual lens is a 35 mm equivalent.
 *
 * Each frame is built in three layers:
 *   1. a 2D background canvas (gradients, grid, "under" connection lines)
 *   2. WebGL glass panels: perspective-correct textured rounded quads with
 *      soft shadows, orange rim light, halo and a moving specular sweep
 *   3. a 2D overlay (kinetic typography, "over" lines, cursor, wipes)
 * Every value is a pure function of time, so preview and export match.
 */
(function () {
  const W = 1920, H = 1080;
  const FC = (window.FC = window.FC || {});
  Object.assign(FC, { W, H });

  // ------------------------------------------------------------ easing ----
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);
  const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const easeIn = (t) => t * t * t;
  const easeInOutQuint = (t) => (t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2);
  const backOut = (t, k = 1.3) => 1 + (k + 1) * Math.pow(t - 1, 3) + k * Math.pow(t - 1, 2);
  /** Animate from a→b over [t0,t1] with easing fn. */
  const anim = (t, t0, t1, a, b, fn = ease) => lerp(a, b, fn(seg(t, t0, t1)));
  Object.assign(FC, { clamp, lerp, seg, ease, easeOut, easeOutQuint, easeOutExpo, easeIn, easeInOutQuint, backOut, anim });

  const ORANGE = [240, 96, 35], YELLOW = [255, 214, 0], CHAR = [23, 23, 23], GREY = [245, 246, 248];
  FC.COL = { ORANGE, YELLOW, CHAR, GREY, orange: '#F06023', yellow: '#FFD600', char: '#171717', grey: '#F5F6F8', white: '#FFFFFF', green: '#1FA971' };
  FC.rgba = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  // ------------------------------------------------------------ camera ----
  const FOCAL = 540 / Math.tan((32.3 / 2) * Math.PI / 180); // 35 mm equivalent → ≈1866
  FC.FOCAL = FOCAL;
  /** cam: { tx, ty, tz (target), dist (×FOCAL), yaw, pitch, roll } */
  function camBasis(cam) {
    const dist = (cam.dist ?? 1) * FOCAL;
    const cy = Math.cos(cam.yaw || 0), sy = Math.sin(cam.yaw || 0), cp = Math.cos(cam.pitch || 0), sp = Math.sin(cam.pitch || 0);
    const fwd = [sy * cp, -sp, cy * cp];
    const pos = [(cam.tx ?? 960) - fwd[0] * dist, (cam.ty ?? 540) - fwd[1] * dist, (cam.tz ?? 0) - fwd[2] * dist];
    return { pos, cy, sy, cp, sp, roll: cam.roll || 0 };
  }
  /** World → camera space. */
  function toCam(b, p) {
    let x = p[0] - b.pos[0], y = p[1] - b.pos[1], z = p[2] - b.pos[2];
    // inverse yaw (about y)
    let x1 = b.cy * x - b.sy * z, z1 = b.sy * x + b.cy * z;
    // inverse pitch (about x)
    let y2 = b.cp * y - b.sp * z1, z2 = b.sp * y + b.cp * z1;
    if (b.roll) { const cr = Math.cos(-b.roll), sr = Math.sin(-b.roll); const xr = cr * x1 - sr * y2; y2 = sr * x1 + cr * y2; x1 = xr; }
    return [x1, y2, z2];
  }
  function project(b, p) {
    const c = toCam(b, p);
    const z = Math.max(c[2], 1);
    return { x: W / 2 + (FOCAL * c[0]) / z, y: H / 2 + (FOCAL * c[1]) / z, z: c[2], s: FOCAL / z };
  }
  FC.camBasis = camBasis; FC.project = project;

  // Model transform of a panel: local (x,y,0) → world.
  function panelPoint(pn, lx, ly) {
    const s = pn.s ?? 1;
    let x = lx * s, y = ly * s, z = 0;
    const rx = pn.rx || 0, ry = pn.ry || 0, rz = pn.rz || 0;
    if (rz) { const c = Math.cos(rz), si = Math.sin(rz); [x, y] = [c * x - si * y, si * x + c * y]; }
    if (rx) { const c = Math.cos(rx), si = Math.sin(rx); [y, z] = [c * y - si * z, si * y + c * z]; }
    if (ry) { const c = Math.cos(ry), si = Math.sin(ry); [x, z] = [c * x + si * z, -si * x + c * z]; }
    return [pn.x + x, pn.y + y, (pn.z || 0) + z];
  }
  FC.panelPoint = panelPoint;
  /** Screen position of a point given in a panel's UI coordinates (0..w, 0..h). */
  FC.panelToScreen = (b, pn, ux, uy) => project(b, panelPoint(pn, ux - pn.w / 2, uy - pn.h / 2));

  // --------------------------------------------------------------- GL -----
  const VS = `#version 300 es
  in vec2 aPos;
  uniform vec4 uC0, uC1, uC2, uC3;   // MVP columns
  uniform vec2 uSize; uniform float uExpand;
  out vec2 vP;
  void main(){
    vec2 sz = uSize + 2.0 * uExpand;
    vP = (aPos - 0.5) * sz;
    mat4 m = mat4(uC0, uC1, uC2, uC3);
    gl_Position = m * vec4(vP, 0.0, 1.0);
  }`;
  const FS = `#version 300 es
  precision highp float;
  in vec2 vP;
  uniform sampler2D uTex;
  uniform vec2 uSize; uniform float uRadius, uOpacity, uGlow, uSweep, uGlass, uBlur, uShadow, uContent, uHasTex;
  uniform int uMode;
  out vec4 o;
  float sdRound(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
  void main(){
    float d = sdRound(vP, uSize * 0.5, uRadius);
    if (uMode == 1) {                       // soft drop shadow
      float a = 1.0 - smoothstep(-uBlur * 0.6, uBlur, d);
      o = vec4(0.09, 0.07, 0.06, 1.0) * a * uShadow * uOpacity; return;
    }
    if (uMode == 2) {                       // outer orange halo (additive)
      float a = exp(-max(d, 0.0) / 16.0) * step(0.0, d) * 0.26 * uGlow;
      o = vec4(vec3(0.941, 0.376, 0.137) * a * uOpacity, 0.0); return;
    }
    float aa = max(fwidth(d), 0.001);
    float inside = 1.0 - smoothstep(-aa, aa, d);
    vec2 uv = vP / uSize + 0.5;
    vec4 tex = uHasTex > 0.5 ? texture(uTex, uv) * uContent : vec4(0.0);
    // frosted glass base: translucent white with a cool top-to-bottom sheen
    vec3 glass = mix(vec3(1.0), vec3(0.965, 0.97, 0.98), uv.y);
    float ga = uGlass;
    vec3 col = glass * ga * (1.0 - tex.a) + tex.rgb;        // premultiplied
    float a = ga * (1.0 - tex.a) + tex.a;
    // inner rim: crisp 1.5px white bevel + orange edge light
    float rimW = exp(-abs(d + 1.0) / 0.9);
    col += vec3(1.0) * rimW * 0.35 * a;
    float rimO = exp(-abs(d + 0.8) / 1.1) * uGlow;
    float inner = exp(-max(-d, 0.0) / 14.0) * 0.18 * uGlow;
    vec3 org = vec3(0.941, 0.376, 0.137);
    col = mix(col, org * max(a, 0.6), clamp(rimO, 0.0, 1.0));
    a = max(a, clamp(rimO, 0.0, 1.0) * 0.9);
    col += org * inner * a;
    // specular sweep travelling diagonally across the surface
    float s = (uv.x + (1.0 - uv.y) * 0.45) - uSweep;
    float band = exp(-s * s * 140.0) * 0.38 + exp(-s * s * 18.0) * 0.06;
    col += vec3(1.0, 0.98, 0.95) * band * a;
    o = vec4(col, a) * inside * uOpacity;
  }`;

  let gl, prog, loc, quad, glCanvas;
  function initGL(w, h) {
    glCanvas = document.createElement('canvas');
    glCanvas.width = w; glCanvas.height = h;
    gl = glCanvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: true, preserveDrawingBuffer: true });
    if (!gl) throw new Error('WebGL2 unavailable');
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    loc = {};
    for (const n of ['uC0', 'uC1', 'uC2', 'uC3', 'uSize', 'uExpand', 'uTex', 'uRadius', 'uOpacity', 'uGlow', 'uSweep', 'uGlass', 'uBlur', 'uShadow', 'uContent', 'uHasTex', 'uMode']) loc[n] = gl.getUniformLocation(prog, n);
    quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    const ap = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(ap);
    gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.uniform1i(loc.uTex, 0);
    FC.anisoExt = gl.getExtension('EXT_texture_filter_anisotropic');
  }

  /** MVP as 4 columns for a panel. Clip = P·V·M applied to (lx, ly, 0, 1). */
  function mvp(b, pn) {
    // Columns of the affine model→camera map, built by projecting basis points.
    const o = toCam(b, panelPoint(pn, 0, 0));
    const ex = toCam(b, panelPoint(pn, 1, 0)), ey = toCam(b, panelPoint(pn, 0, 1));
    const X = [ex[0] - o[0], ex[1] - o[1], ex[2] - o[2]], Y = [ey[0] - o[0], ey[1] - o[1], ey[2] - o[2]];
    const near = 10, far = 20000, A = (far + near) / (far - near), B = (-2 * far * near) / (far - near);
    const fx = FOCAL / (W / 2), fy = -FOCAL / (H / 2);
    const col = (v, wv) => [fx * v[0], fy * v[1], A * v[2] + B * wv, v[2]];
    return [col(X, 0), col(Y, 0), [0, 0, 0, 0], col(o, 1)];
  }

  // ---------------------------------------------------------- textures ----
  let SCALE = 1;
  FC.getScale = () => SCALE;
  /**
   * A panel's UI texture. draw(ctx, t, w, h) paints in panel pixels.
   * Static textures are drawn once; dynamic ones whenever their key changes.
   */
  function makeTex(def) {
    const res = Math.min(4096 / Math.max(def.w, def.h), SCALE * (def.res || 1.35));
    const c = document.createElement('canvas');
    c.width = Math.round(def.w * res); c.height = Math.round(def.h * res);
    const ctx = c.getContext('2d');
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (FC.anisoExt) gl.texParameterf(gl.TEXTURE_2D, FC.anisoExt.TEXTURE_MAX_ANISOTROPY_EXT, 8);
    return { def, c, ctx, res, tex, key: undefined };
  }
  function updateTex(T, t) {
    const key = (T.def.dynamic ? (T.def.key ? T.def.key(t) : Math.round(t * 30)) : 'static') + '|' + (FC.TEXT_KEY || '');
    if (key === T.key) return;
    T.key = key;
    const ctx = T.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, T.c.width, T.c.height);
    ctx.setTransform(T.res, 0, 0, T.res, 0, 0);
    T.def.draw(ctx, t, T.def.w, T.def.h);
    gl.bindTexture(gl.TEXTURE_2D, T.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, T.c);
    gl.generateMipmap(gl.TEXTURE_2D);
  }
  const texCache = new Map();
  FC.tex = (def) => { if (!texCache.has(def)) texCache.set(def, makeTex(def)); return texCache.get(def); };

  // ------------------------------------------------------------ panels ----
  function setU(b, pn, mode, expand) {
    const m = mvp(b, pn);
    gl.uniform4fv(loc.uC0, m[0]); gl.uniform4fv(loc.uC1, m[1]); gl.uniform4fv(loc.uC2, m[2]); gl.uniform4fv(loc.uC3, m[3]);
    gl.uniform2f(loc.uSize, pn.w, pn.h);
    gl.uniform1f(loc.uExpand, expand);
    gl.uniform1i(loc.uMode, mode);
  }
  /**
   * Panel: { ui (texture def), x,y,z, w,h, rx,ry,rz, s, opacity, glow, glass,
   *          radius, sweep, shadow, content }
   */
  function drawPanels(b, panels, t) {
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const list = panels.filter((p) => (p.opacity ?? 1) > 0.002).map((p) => ({ p, z: toCam(b, panelPoint(p, 0, 0))[2] }))
      .filter((e) => e.z > 30).sort((a, c) => c.z - a.z || (a.p.order || 0) - (c.p.order || 0));
    for (const { p } of list) {
      const op = p.opacity ?? 1;
      gl.uniform1f(loc.uRadius, p.radius ?? 24);
      gl.uniform1f(loc.uOpacity, op);
      gl.uniform1f(loc.uGlow, p.glow ?? 0.35);
      gl.uniform1f(loc.uSweep, p.sweep ?? -2);
      gl.uniform1f(loc.uGlass, p.glass ?? 0.72);
      gl.uniform1f(loc.uContent, p.content ?? 1);
      // shadow, cast down and behind onto the backdrop
      if ((p.shadow ?? 0.16) > 0) {
        const sp = { ...p, y: p.y + 34 * (p.s ?? 1), z: (p.z || 0) + 70 };
        setU(b, sp, 1, 70);
        gl.uniform1f(loc.uBlur, 56);
        gl.uniform1f(loc.uShadow, p.shadow ?? 0.16);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      if ((p.glow ?? 0.35) > 0.01) { setU(b, p, 2, 48); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
      if (p.ui) {
        const T = FC.tex(p.ui);
        updateTex(T, t);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, T.tex);
        gl.uniform1f(loc.uHasTex, 1);
      } else gl.uniform1f(loc.uHasTex, 0);
      setU(b, p, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }

  // ---------------------------------------------------------- compositor --
  let out, octx;
  FC.init = async function (canvas, scale) {
    SCALE = scale;
    out = canvas; octx = canvas.getContext('2d');
    canvas.width = Math.round(W * scale); canvas.height = Math.round(H * scale);
    initGL(canvas.width, canvas.height);
    texCache.clear();
    try {
      await Promise.all(['400', '500', '600', '700'].map((w) => document.fonts.load(`${w} 40px Poppins`)));
      await document.fonts.ready;
    } catch (e) { /* fall back to system sans */ }
    await FC.loadLogo?.();
    FC.buildScenes();
  };

  /**
   * Render time t. A scene returns { cam, panels, bg(ctx,b), over(ctx,b) }.
   */
  FC.renderFrame = function (t) {
    const f = FC.frameAt(t);
    const b = camBasis(f.cam);
    const c = octx;
    c.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    c.fillStyle = '#FFFFFF';
    c.fillRect(0, 0, W, H);
    f.bg && f.bg(c, b);
    drawPanels(b, f.panels || [], t);
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(glCanvas, 0, 0); c.restore();
    f.over && f.over(c, b);
    return out;
  };
})();
