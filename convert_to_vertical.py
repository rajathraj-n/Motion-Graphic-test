#!/usr/bin/env python3
"""Convert a 16:9 motion-graphics video into a 9:16 (1080x1920) Reel/Short.

The layout is described per scene in a JSON file, so nothing is centre-cropped blindly:
every scene picks one or more source regions, scales them uniformly (never
stretched) and places them on a 1080x1920 canvas over a blurred copy of the frame.

Sub-commands
  analyze  INPUT                   ffprobe report, scene detection, start/mid/end frames
  render   INPUT --layout L.json   render the vertical video (use --preview N for N seconds)
  compare  INPUT OUTPUT --layout   side-by-side original vs vertical stills

Layout JSON (see layouts/fuel-pricing.json for a full example)
{
  "canvas": [1080, 1920],
  "safe": {"top": 250, "bottom": 400, "right": 120},
  "transition": 0.6,                     # seconds of cross-dissolve between scene layouts
  "logo": {"time": 78.6, "crop": [x,y,w,h], "width": 300, "y": 262,
           "hide": [[69.2, 79.0]]},       # optional persistent badge cut from the source
  "scenes": [
    {"start": 0, "end": 4.6, "label": "...", "bg_dim": 0.75,
     "regions": [{"crop": [x,y,w,h], "scale": 1.17, "x": 0, "y": 376,
                  "feather": [top, bottom, left, right]}],
     "masks": [{"type": "hinterp"|"plate", "rect": [x,y,w,h], "t": [t0,t1],
                "plate_t": 62.4}]}
  ]
}
Region "x"/"y" may be omitted (centred horizontally / in the content band);
"scale" may be omitted (fit to canvas width).
"""
import argparse
import json
import os
import subprocess
import sys

import cv2
import numpy as np

# ----------------------------------------------------------------------------- helpers


def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries",
         "format=duration,size,bit_rate:stream=index,codec_type,codec_name,profile,width,height,"
         "pix_fmt,r_frame_rate,nb_frames,sample_rate,channels,channel_layout,bit_rate,color_space",
         "-of", "json", path], check=True, capture_output=True, text=True).stdout
    return json.loads(out)


def video_info(path):
    info = probe(path)
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    num, den = map(int, v["r_frame_rate"].split("/"))
    return dict(w=int(v["width"]), h=int(v["height"]), fps=num / den, fps_str=v["r_frame_rate"],
                duration=float(info["format"]["duration"]),
                nb_frames=int(v.get("nb_frames", 0)) or None,
                has_audio=any(s["codec_type"] == "audio" for s in info["streams"]),
                color_space=v.get("color_space"))


def read_frame(path, t, w, h):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", path, "-frames:v", "1",
                          "-f", "rawvideo", "-pix_fmt", "bgr24", "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(h, w, 3).copy()


def smoothstep(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


def feather_alpha(h, w, top=0, bottom=0, left=0, right=0):
    """Alpha mask (h, w, 1) float32 with linear ramps on the given edges."""
    ay = np.ones(h, np.float32)
    ax = np.ones(w, np.float32)
    if top:
        ay[:top] = np.minimum(ay[:top], np.linspace(0, 1, top, endpoint=False))
    if bottom:
        ay[h - bottom:] = np.minimum(ay[h - bottom:], np.linspace(1, 0, bottom, endpoint=False))
    if left:
        ax[:left] = np.minimum(ax[:left], np.linspace(0, 1, left, endpoint=False))
    if right:
        ax[w - right:] = np.minimum(ax[w - right:], np.linspace(1, 0, right, endpoint=False))
    return (ay[:, None] * ax[None, :])[..., None]


def paste(canvas, img, x, y, alpha=None):
    """Alpha-composite img onto canvas at (x, y), clipping to the canvas."""
    H, W = canvas.shape[:2]
    h, w = img.shape[:2]
    x0, y0 = max(x, 0), max(y, 0)
    x1, y1 = min(x + w, W), min(y + h, H)
    if x0 >= x1 or y0 >= y1:
        return
    src = img[y0 - y:y1 - y, x0 - x:x1 - x].astype(np.float32)
    dst = canvas[y0:y1, x0:x1].astype(np.float32)
    if alpha is None:
        canvas[y0:y1, x0:x1] = src.astype(np.uint8)
    else:
        a = alpha[y0 - y:y1 - y, x0 - x:x1 - x]
        canvas[y0:y1, x0:x1] = (src * a + dst * (1 - a)).astype(np.uint8)


def resize(img, s):
    h, w = img.shape[:2]
    nw, nh = max(1, round(w * s)), max(1, round(h * s))
    interp = cv2.INTER_AREA if s < 1 else cv2.INTER_LANCZOS4
    return cv2.resize(img, (nw, nh), interpolation=interp)


# ----------------------------------------------------------------------------- layout engine


class Layout:
    def __init__(self, cfg, src_path, src_w, src_h):
        self.cfg = cfg
        self.W, self.H = cfg.get("canvas", [1080, 1920])
        self.safe = cfg.get("safe", {"top": 250, "bottom": 400, "right": 120})
        self.band = cfg.get("content_band", [self.safe["top"] + 125, self.H - self.safe["bottom"] - 20])
        self.scenes = sorted(cfg["scenes"], key=lambda s: s["start"])
        self.trans = cfg.get("transition", 0.6)
        self.src_w, self.src_h = src_w, src_h
        self.bg_rows = cfg.get("bg_rows", [0, src_h])
        self._plates = {}
        self._alpha_cache = {}
        self.src_path = src_path
        self.logo = None
        if cfg.get("logo"):
            self._build_logo(cfg["logo"])

    # -- logo badge ------------------------------------------------------------------
    def _build_logo(self, lc):
        f = read_frame(self.src_path, lc["time"], self.src_w, self.src_h)
        x, y, w, h = lc["crop"]
        crop = f[y:y + h, x:x + w]
        s = lc.get("width", 300) / w
        logo = resize(crop, s)
        lh, lw = logo.shape[:2]
        padx, pady = lc.get("pad", [22, 10])
        cw, ch = lw + 2 * padx, lh + 2 * pady
        border = np.concatenate([crop[0], crop[-1], crop[:, 0], crop[:, -1]])
        card_col = np.median(border, axis=0)
        r = lc.get("radius", 22)
        sh = 14  # shadow margin
        img = np.zeros((ch + 2 * sh, cw + 2 * sh, 3), np.uint8)
        img[:] = card_col
        mask = np.zeros((ch + 2 * sh, cw + 2 * sh), np.uint8)
        cv2.rectangle(mask, (sh + r, sh), (sh + cw - r, sh + ch), 255, -1)
        cv2.rectangle(mask, (sh, sh + r), (sh + cw, sh + ch - r), 255, -1)
        for cx, cy in [(sh + r, sh + r), (sh + cw - r, sh + r), (sh + r, sh + ch - r), (sh + cw - r, sh + ch - r)]:
            cv2.circle(mask, (cx, cy), r, 255, -1, cv2.LINE_AA)
        # soft blend of the logo crop edges into the card colour
        la = feather_alpha(lh, lw, 6, 6, 6, 6)
        sub = img[sh + pady:sh + pady + lh, sh + padx:sh + padx + lw].astype(np.float32)
        img[sh + pady:sh + pady + lh, sh + padx:sh + padx + lw] = (logo * la + sub * (1 - la)).astype(np.uint8)
        card_a = mask.astype(np.float32) / 255
        shadow = cv2.GaussianBlur(np.roll(mask, 4, axis=0), (0, 0), 7).astype(np.float32) / 255 * 0.28
        self.logo = dict(img=img, card_a=card_a[..., None], shadow=shadow[..., None],
                         x=(self.W - img.shape[1]) // 2 + lc.get("x_offset", 0),
                         y=lc.get("y", self.safe["top"] + 12) - sh,
                         hide=lc.get("hide", []), fade=lc.get("fade", 0.4))

    def logo_alpha(self, t):
        if not self.logo:
            return 0.0
        a = 1.0
        f = self.logo["fade"]
        for t0, t1 in self.logo["hide"]:
            if t0 - f / 2 <= t <= t1 + f / 2:
                a = min(a, 1 - smoothstep((t - (t0 - f / 2)) / f), smoothstep((t - (t1 - f / 2)) / f))
        return a

    def draw_logo(self, canvas, t):
        a = self.logo_alpha(t)
        if a <= 0.001:
            return
        L = self.logo
        x, y = L["x"], L["y"]
        h, w = L["img"].shape[:2]
        dst = canvas[y:y + h, x:x + w].astype(np.float32)
        dst = dst * (1 - L["shadow"] * a)  # drop shadow
        sa = L["card_a"] * a
        canvas[y:y + h, x:x + w] = (L["img"] * sa + dst * (1 - sa)).astype(np.uint8)

    # -- scenes ------------------------------------------------------------------------
    def scene_index(self, t):
        idx = 0
        for i, s in enumerate(self.scenes):
            if t >= s["start"]:
                idx = i
        return idx

    def weights(self, t):
        """[(scene_index, weight)] - two entries inside a transition window."""
        i = self.scene_index(t)
        d = self.scenes[i].get("transition_in", self.trans)
        b = self.scenes[i]["start"]
        if i > 0 and d > 0 and t < b + d / 2:
            a = smoothstep((t - (b - d / 2)) / d)
            return [(i - 1, 1 - a), (i, a)]
        if i + 1 < len(self.scenes):
            d2 = self.scenes[i + 1].get("transition_in", self.trans)
            b2 = self.scenes[i + 1]["start"]
            if d2 > 0 and t >= b2 - d2 / 2:
                a = smoothstep((t - (b2 - d2 / 2)) / d2)
                return [(i, 1 - a), (i + 1, a)]
        return [(i, 1.0)]

    def _plate(self, t):
        key = round(t, 3)
        if key not in self._plates:
            self._plates[key] = read_frame(self.src_path, t, self.src_w, self.src_h)
        return self._plates[key]

    def apply_masks(self, frame, scene, t):
        masks = [m for m in scene.get("masks", []) if m["t"][0] <= t < m["t"][1]]
        if not masks:
            return frame
        f = frame.copy()
        for m in masks:
            x, y, w, h = m["rect"]
            if m["type"] == "hinterp":   # per-row linear interpolation between the rect's side columns
                left = f[y:y + h, x - 2:x].mean(1).astype(np.float32)
                right = f[y:y + h, x + w:x + w + 2].mean(1).astype(np.float32)
                k = np.linspace(0, 1, w, dtype=np.float32)[None, :, None]
                f[y:y + h, x:x + w] = (left[:, None] * (1 - k) + right[:, None] * k).astype(np.uint8)
            elif m["type"] == "plate":   # copy a clean patch from another moment
                f[y:y + h, x:x + w] = self._plate(m["plate_t"])[y:y + h, x:x + w]
        return f

    def background(self, frame, scene):
        r0, r1 = self.bg_rows
        src = frame[r0:r1]
        sh, sw = src.shape[:2]
        # "cover" the canvas: take a centre slice of the right aspect ratio
        need_w = int(sh * self.W / self.H)
        x0 = (sw - need_w) // 2
        src = src[:, x0:x0 + need_w]
        small = cv2.resize(src, (self.W // 12, self.H // 12), interpolation=cv2.INTER_AREA)
        small = cv2.GaussianBlur(small, (0, 0), 6.0)
        bg = cv2.resize(small, (self.W, self.H), interpolation=cv2.INTER_CUBIC)
        dim = scene.get("bg_dim", 0.75)
        if dim != 1:
            bg = (bg.astype(np.float32) * dim).astype(np.uint8)
        return bg

    def region_geometry(self, r):
        x, y, w, h = r["crop"]
        s = r.get("scale", self.W / w)
        ow, oh = round(w * s), round(h * s)
        ox = r.get("x", (self.W - ow) // 2)
        oy = r.get("y", self.band[0] + (self.band[1] - self.band[0] - oh) // 2)
        return s, ox, oy, ow, oh

    def compose_scene(self, frame, si, t):
        scene = self.scenes[si]
        f = self.apply_masks(frame, scene, t)
        canvas = self.background(f, scene)
        for ri, r in enumerate(scene["regions"]):
            x, y, w, h = r["crop"]
            s, ox, oy, ow, oh = self.region_geometry(r)
            img = resize(f[y:y + h, x:x + w], s)
            fe = r.get("feather")
            alpha = None
            if fe:
                key = (si, ri, img.shape)
                if key not in self._alpha_cache:
                    self._alpha_cache[key] = feather_alpha(img.shape[0], img.shape[1], *fe)
                alpha = self._alpha_cache[key]
            paste(canvas, img, ox, oy, alpha)
        return canvas

    def compose(self, frame, t):
        ws = self.weights(t)
        if len(ws) == 1:
            out = self.compose_scene(frame, ws[0][0], t)
        else:
            (ia, wa), (ib, wb) = ws
            a = self.compose_scene(frame, ia, t).astype(np.float32)
            b = self.compose_scene(frame, ib, t).astype(np.float32)
            out = (a * wa + b * wb).astype(np.uint8)
        self.draw_logo(out, t)
        return out


# ----------------------------------------------------------------------------- commands


def cmd_analyze(a):
    os.makedirs(os.path.join(a.analysis_dir, "frames"), exist_ok=True)
    info = probe(a.input)
    print(json.dumps(info, indent=1))
    vi = video_info(a.input)
    from scenedetect import detect, ContentDetector
    scenes = detect(a.input, ContentDetector(threshold=a.threshold))
    if not scenes:
        scenes = [(None, None)]
    out = []
    for i, (s, e) in enumerate(scenes, 1):
        t0 = s.get_seconds() if s else 0.0
        t1 = e.get_seconds() if e else vi["duration"]
        out.append({"id": i, "start": round(t0, 3), "end": round(t1, 3)})
        L = t1 - t0
        for k, t in {"start": t0 + min(0.4, L * .15), "mid": (t0 + t1) / 2, "end": t1 - min(0.4, L * .15)}.items():
            p = os.path.join(a.analysis_dir, "frames", f"s{i:02d}_{k}_{t:06.2f}.png")
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", a.input, "-frames:v", "1", p],
                           check=True)
    with open(os.path.join(a.analysis_dir, "scenes_detected.json"), "w") as fh:
        json.dump(out, fh, indent=1)
    for s in out:
        print(f"scene {s['id']:2d}: {s['start']:7.2f} - {s['end']:7.2f}")


def output_path(a):
    if a.output:
        return a.output
    name = os.path.splitext(os.path.basename(a.input))[0]
    suffix = f"_preview{int(a.preview)}s" if a.preview else ""
    return os.path.join("output", f"{name}_9x16{suffix}.mp4")


def cmd_render(a):
    vi = video_info(a.input)
    cfg = json.load(open(a.layout))
    lay = Layout(cfg, a.input, vi["w"], vi["h"])
    W, H = lay.W, lay.H
    out = output_path(a)
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    if os.path.abspath(out) == os.path.abspath(a.input):
        sys.exit("refusing to overwrite the source")
    start = a.start
    dur = a.preview if a.preview else vi["duration"] - start
    nframes = round(dur * vi["fps"])

    dec = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", f"{start:.3f}", "-i", a.input, "-t", f"{dur:.3f}",
                            "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
    enc_cmd = ["ffmpeg", "-v", "error", "-y",
               "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", vi["fps_str"], "-i", "-"]
    if vi["has_audio"]:
        enc_cmd += ["-ss", f"{start:.3f}", "-t", f"{dur:.3f}", "-i", a.input, "-map", "0:v:0", "-map", "1:a:0",
                    "-c:a", "aac", "-b:a", "192k"]
    enc_cmd += ["-vf", "scale=out_color_matrix=bt601:out_range=tv,format=yuv420p",
                "-c:v", "libx264", "-preset", a.preset, "-crf", str(a.crf), "-pix_fmt", "yuv420p",
                "-colorspace", "bt470bg", "-color_primaries", "bt470bg", "-color_trc", "smpte170m",
                "-r", vi["fps_str"], "-movflags", "+faststart", "-t", f"{dur:.3f}", out]
    enc = subprocess.Popen(enc_cmd, stdin=subprocess.PIPE)
    fsize = vi["w"] * vi["h"] * 3
    n = 0
    while True:
        buf = dec.stdout.read(fsize)
        if len(buf) < fsize:
            break
        frame = np.frombuffer(buf, np.uint8).reshape(vi["h"], vi["w"], 3)
        t = start + n / vi["fps"]
        enc.stdin.write(lay.compose(frame, t).tobytes())
        n += 1
        if n % 150 == 0:
            print(f"  {n}/{nframes} frames ({t:.1f}s)", flush=True)
    enc.stdin.close()
    enc.wait()
    dec.wait()
    if enc.returncode:
        sys.exit("encoder failed")
    print(f"wrote {out} ({n} frames)")


def cmd_compare(a):
    vi = video_info(a.input)
    vo = video_info(a.output)
    cfg = json.load(open(a.layout))
    safe = cfg.get("safe", {"top": 250, "bottom": 400, "right": 120})
    os.makedirs(a.compare_dir, exist_ok=True)
    frames_dir = os.path.join(a.analysis_dir, "frames")
    stamps = sorted({float(os.path.splitext(f)[0].split("_")[-1]) for f in os.listdir(frames_dir)
                     if f.endswith(".png")})
    for t in stamps:
        src = read_frame(a.input, t, vi["w"], vi["h"])
        out = read_frame(a.output, t, vo["w"], vo["h"])
        guide = out.copy()
        ov = guide.copy()
        Wv, Hv = vo["w"], vo["h"]
        cv2.rectangle(ov, (0, 0), (Wv, safe["top"]), (0, 0, 255), -1)
        cv2.rectangle(ov, (0, Hv - safe["bottom"]), (Wv, Hv), (0, 0, 255), -1)
        cv2.rectangle(ov, (Wv - safe["right"], Hv // 2), (Wv, Hv - safe["bottom"]), (0, 0, 255), -1)
        guide = cv2.addWeighted(ov, 0.25, guide, 0.75, 0)
        Ht = 1280
        s_src = cv2.resize(src, (round(vi["w"] * 720 / vi["h"]), 720), interpolation=cv2.INTER_AREA)
        s_out = cv2.resize(out, (round(Wv * Ht / Hv), Ht), interpolation=cv2.INTER_AREA)
        s_gd = cv2.resize(guide, (round(Wv * Ht / Hv), Ht), interpolation=cv2.INTER_AREA)
        pad = 20
        W = s_src.shape[1] + s_out.shape[1] * 2 + pad * 4
        canvas = np.full((Ht + 60, W, 3), 40, np.uint8)
        y_src = 60 + (Ht - 720) // 2
        canvas[y_src:y_src + 720, pad:pad + s_src.shape[1]] = s_src
        x2 = pad * 2 + s_src.shape[1]
        canvas[60:60 + Ht, x2:x2 + s_out.shape[1]] = s_out
        x3 = x2 + s_out.shape[1] + pad
        canvas[60:60 + Ht, x3:x3 + s_gd.shape[1]] = s_gd
        cv2.putText(canvas, f"t={t:.2f}s  original 16:9", (pad, 40), 0, 1.0, (255, 255, 255), 2)
        cv2.putText(canvas, "vertical 9:16", (x2, 40), 0, 1.0, (255, 255, 255), 2)
        cv2.putText(canvas, "safe-zone overlay", (x3, 40), 0, 1.0, (120, 120, 255), 2)
        p = os.path.join(a.compare_dir, f"compare_{t:06.2f}.jpg")
        cv2.imwrite(p, canvas, [cv2.IMWRITE_JPEG_QUALITY, 88])
        print("wrote", p)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("analyze")
    p.add_argument("input")
    p.add_argument("--analysis-dir", default="analysis")
    p.add_argument("--threshold", type=float, default=12)
    p.set_defaults(func=cmd_analyze)
    p = sub.add_parser("render")
    p.add_argument("input")
    p.add_argument("--layout", required=True)
    p.add_argument("--output")
    p.add_argument("--preview", type=float, default=0, help="render only N seconds")
    p.add_argument("--start", type=float, default=0.0)
    p.add_argument("--crf", type=int, default=18)
    p.add_argument("--preset", default="slow")
    p.set_defaults(func=cmd_render)
    p = sub.add_parser("compare")
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--layout", required=True)
    p.add_argument("--analysis-dir", default="analysis")
    p.add_argument("--compare-dir", default="analysis/compare")
    p.set_defaults(func=cmd_compare)
    a = ap.parse_args()
    a.func(a)


if __name__ == "__main__":
    main()
