# After Effects project — v2 (dark, 3D cards)

`RackNap_Catalog_Marketplace_v2.jsx` builds an editable After Effects
project of the **v2** video: 3840×2160, 30 fps, 15 s. Every camera move, card
flight, cursor move and UI state comes from the same timeline that rendered the
MP4, so the project matches the video.

## Open it

1. Unzip `RackNap_Catalog_Marketplace_v2_AE.zip`. Keep the `.jsx` file next to `assets/`.
2. Install **Inter** and **Inter Display** (free, https://rsms.me/inter/).
3. In After Effects 2022 or later, choose **File → Scripts → Run Script File…** and pick
   `RackNap_Catalog_Marketplace_v2.jsx`. Then save the result as an `.aep` file.

## Structure

| Comp | What's inside |
| --- | --- |
| **RackNap Easy – Catalog & Marketplace v2 4K** | Main comp: background, glow, vignette, every headline (live text with matte reveals), the stat counters (`Count` slider), the vendor line, price callouts, logo, audio. |
| **3D Scene – RackNap Catalog v2** | **Camera Rig** null (the whole camera move), the **Browser** layer, the 3D card copies that fly in, lift away or lift out (`Card N 3D – …`, each with a soft shadow), and the **Cursor**. |
| **Browser UI – Catalog & marketplace v2** | The real page captured at 4×: static page, in-page cards and their hover/added states, filter chips, quote bar, the dimming layer, the glass sheen. |
| **World Matte v2** | Fades the 3D world into the background behind the headline column. |

## Editing tips

* **Text:** change it directly in the main comp. If a line gets wider, widen its `Matte – …` layer.
* **Timing:** the keyframes are linear and sampled from the master timeline, so the
  motion matches the video exactly. To retime a move, select its keyframes and scale
  them with Alt/Option-drag, or apply Easy Ease.
* **Tilt looks mirrored:** select `3D Scene` → **Rig Controls** and toggle the
  *Invert X/Y rotation* checkbox. Browsers and After Effects rotate 3D layers in
  opposite directions. The checkbox is on by default and corrects this.
* **Stats (6 products · 4 categories · 3 sources)** are read from the page itself.
  The numbers count up through the `Count` slider on each number layer.
* **Music:** replace `Music + SFX bed (placeholder)` with the licensed track or voiceover.

## Notes

* This script hasn't been opened in After Effects yet. It passes an ExtendScript (ES3)
  syntax check and a dry run against a mock of the After Effects scripting API.
  If After Effects reports an error, send the message and line number.
* Rebuild after changing `composition/index.html`:

```bash
node ae/v2/export-v2.js
```

```bash
node ae/v2/build-v2.js
```
