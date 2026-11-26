# RackNap Easy — Catalog & Marketplace (15 s, 4K)

A 15-second, 3840×2160, 30 fps feature video built from the **live RackNap Easy
Catalog & marketplace screen**
(`racknap-easy-us-experience…/demo#catalog`). Every product card, vendor,
category, unit and USD amount on screen comes from that page's own DOM. Nothing
is redrawn or mocked up.

| File | What it is |
| --- | --- |
| `out/racknap-easy-catalog-marketplace-4k.mp4` | Master: H.264, 4K UHD, 30 fps, with the music and sound-effects bed |
| `out/racknap-easy-catalog-marketplace-1080p.mp4` | 1920×1080 web and review copy, with audio |
| `out/racknap-easy-catalog-marketplace-4k-silent.mp4` | The same picture with no audio, for adding a licensed track or voiceover |
| `out/sfx_music.wav` | The synthesised music and SFX bed on its own (48 kHz stereo) |
| `composition/index.html` | The animation: camera, cursor, UI states and headlines, driven by `seek(t)` |
| `app/` | A local copy of the Catalog & marketplace page (`demo.html`, `demo.css`, `demo.js`, logo) |
| `render.js` | Renders the composition frame by frame with Playwright, then encodes with ffmpeg |
| `audio.py` | Generates the music and SFX bed |

## Storyboard as built

| Time | Picture | Headline |
| --- | --- | --- |
| 0–3 s | The browser window swings from a 2.5D angle to nearly frontal. The page loads and the product cards rise in a stagger as the camera pushes in. | Your Entire Portfolio. **One Place.** |
| 3–6 s | The cursor clicks the real **Productivity** filter chip. Non-matching cards drop out and the grid refreshes. The camera pans across the Microsoft 365 row. | One Unified **Catalog** |
| 6–9 s | Hover on **Microsoft 365 Business Premium**: the card lifts and the other cards dim (a spotlight made only with contrast). The camera zooms to **$28 / seat / month · Cost: $22 · 21% margin**. A click on **Add to quote +** changes the label to *Add another +* and slides in the app's real quote bar (*1 unit in your quote · $28 / billing cycle · Build quote →*). | Manage Products **& Pricing** |
| 9–12 s | The cursor clicks **All products**. The Acronis, Services and Consumption cards return in a stagger, the quote bar follows the layout, and the camera tracks horizontally to a hover on **Acronis Cloud Backup ($10 / workload / month)**. | Discover & **Sell More** |
| 12–15 s | The camera pulls back to the whole page in a floating, perspective browser frame. The official RackNap Easy logo comes from the app's own asset. | Catalog & Marketplace — *One Connected Experience.* |

Production details: cubic-bezier camera easing with zoom in log space, 2.5D
perspective, parallax between the background, browser and copy layers,
masked headline reveals, cursor paths that arc slightly and switch to a pointer
over clickable controls, and a 180° shutter motion blur (two sub-frames per
frame).

## What was changed on the source screen, and why

The brief says no prototype indicators should appear on screen. These are the
only edits. Prices, names, vendors, categories, units, costs and margins are untouched.

* **Hidden:** the "Interactive simulation" banner, the *DEMO* tag, the *Sample data*
  chip, "ⓘ All prices are illustrative", the guided-journey and sample-data links in the
  sidebar, the footer disclaimer, the price-list disclaimer and the toast.
* **Text trimmed:** "United States · Sample workspace" → "United States";
  "A sample mix of…" → "A mix of…"; " Illustrative monthly billing." removed;
  "A sample backup offering" → "A backup offering"; "Azure Plan — Sample Usage" →
  "Azure Plan"; "…for this simulation." removed; "Sample cost:" → "Cost:";
  "in your sample quote" → "in your quote"; "1 units" → "1 unit".
* **Style fix:** the quote bar's *Clear* button rendered white text on a white
  button, so it was invisible. It now has a transparent background.
* `render.js` aborts if any visible text still contains
  *sample / demo / illustrative / simulation / fictional / concept*.

The address bar reads `racknap.com/catalog`. Change `ADDRESS_HOST` and
`ADDRESS_PATH` at the top of `composition/index.html` to the production URL.

## ⚠️ Before publishing

The source page itself says its catalog uses **illustrative offers, fictional data
and sample USD prices, and is not an official Microsoft, Acronis or RackNap price
list**. This video removes those labels as the brief asks, but the amounts shown
($8, $15, $28, $10, $85, $10) are still the prototype's values. Get product and
legal sign-off on the prices, and on showing Microsoft and Acronis product names,
before using the video in a public campaign.

The audio bed is synthesised as a placeholder. Swap in a licensed 115–120 BPM
track and the voiceover for final delivery. The silent master is included for this.

## Re-rendering

```bash
cd catalog-marketplace
npm i playwright            # only if `require('playwright')` is not already available
node render.js              # → out/racknap-easy-catalog-marketplace-4k.mp4 (video only, ~30 min)
node render.js --stills 3.5,7.4,14.9 --scale 1   # quick preview stills in out/stills/
python3 audio.py out/sfx_music.wav
ffmpeg -i out/racknap-easy-catalog-marketplace-4k.mp4 -i out/sfx_music.wav \
  -map 0:v -map 1:a -c:v copy -af loudnorm=I=-16:TP=-1.5:LRA=7 -c:a aac -b:a 256k -shortest out/final.mp4
```

To watch it live in a browser, serve the `catalog-marketplace/` folder and open
`composition/index.html?play`. Fonts: Inter and Inter Display must be installed.

## After Effects (editable project)

`out/RackNap_Catalog_Marketplace_AE.zip` contains `RackNap_Catalog_Marketplace.jsx`
and its assets. Run the script in After Effects to build the project with
live text, the 3D camera, cursor and card-state layers. See `ae/README.md`.
