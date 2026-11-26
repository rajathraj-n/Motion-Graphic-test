# After Effects project — RackNap Easy Catalog & Marketplace

`RackNap_Catalog_Marketplace.jsx` builds a native, fully editable After Effects
project that matches the rendered video: 3840×2160, 30 fps, 15 s.

## Open it

1. Unzip `RackNap_Catalog_Marketplace_AE.zip`, or use this `ae/` folder. Keep
   the `.jsx` file next to the `assets/` folder.
2. Install the free fonts **Inter** and **Inter Display** from https://rsms.me/inter/.
   The headlines use Inter Display SemiBold. The eyebrow labels and the supporting line use Inter.
3. In After Effects 2022 or later, choose **File → Scripts → Run Script File…** and pick
   `RackNap_Catalog_Marketplace.jsx`.
4. The project opens on the final hero frame. Save it as a `.aep` file.

## What you get

```
RackNap Easy – Catalog & Marketplace
├─ RackNap Easy – Catalog & Marketplace 4K   ← main comp: edit headlines here
├─ Precomps
│  ├─ 3D Scene – RackNap Catalog              ← camera, plus the browser as a 3D layer
│  └─ Browser UI – Catalog & marketplace      ← UI layers, cursor, card states
└─ Assets                                     ← PNGs captured from the real screen at 4x
```

| To change… | Do this |
| --- | --- |
| **Headline wording or colour** | Main comp → `S1 Headline 1 – …` and the other headline layers are live text layers. Each sits under a `Matte – …` layer (an alpha track matte) that creates the masked reveal. If a line gets wider, widen its matte. |
| **Headline timing** | Slide the position keyframes on the text layers. Each line rises in on an expo-out ease and leaves upward on an ease-in. |
| **Camera move** | `3D Scene` → **Browser** layer. Its Anchor Point is what the camera looks at, Position is where that point sits on screen, and Scale is the zoom. X/Y/Z Rotation give the 2.5D tilt. Every keyframe matches a beat in the storyboard. |
| **Tilt looks mirrored** | `3D Scene` → **Rig Controls** → turn the *Invert X/Y rotation* checkbox off or on. The keyframes store the browser-version angles, and the checkbox converts them to After Effects' rotation direction. It is on by default. |
| **Cursor path or clicks** | `Browser UI` → **Cursor** null. Position keys are the path, with curved motion paths. The *Hand* checkbox switches to the pointer, and the Scale keys make the press. |
| **Card animations** | `Browser UI` → `Card 1` … `Card 6` nulls. Position gives the rise and lift, and the *Opacity* slider drives all state layers parented to the null. Card 3 (Premium) and Card 4 (Cloud Backup) have their hover, button-hover and "Add another +" states as separate layers. |
| **Quote bar** | `Browser UI` → `Quote bar (1 unit · $28)`. |
| **Music** | Main comp → replace `Music + SFX bed (placeholder)` with the licensed track and the voiceover. |
| **Logo** | Main comp → `RackNap Easy logo`. This is the app's own asset. Swap in the official vector logo if you have it. |

Motion blur is on: 180° shutter, enabled on the moving layers.

## Notes

* This script hasn't been opened in After Effects yet. It was checked for
  ExtendScript (ES3) syntax and dry-run against a mock of the After Effects
  scripting API, with no errors. If After Effects reports an error, send the
  message and line number.
* The UI PNGs are captures of the real Catalog & marketplace screen. The only
  changes are the prototype labels removed for the video (see `../README.md`).
  Prices are the prototype's values and need sign-off before public use.
* Zoom is interpolated linearly in After Effects. The browser render interpolated it
  logarithmically, so the longest push-ins are very slightly different in feel.
* To rebuild the assets and the script after changing `composition/index.html`:

```bash
node ae/export-assets.js
```

```bash
node ae/build-jsx.js
```
