# RackNap Easy — 90-second product launch film

A 90-second film for the US market (3840×2160, 60 fps, 16:9). Every frame is
rendered from a deterministic HTML/JavaScript composition (`index.html`, `js/`),
so a change to any scene re-renders exactly.

| File | What it is |
| --- | --- |
| `out/racknap-easy-launch-90s-4k60-web.mp4` | 4K60 copy for the repo: H.264 at about 8 Mbps, AAC stereo, under GitHub's 100 MB file limit |
| `out/racknap-easy-launch-90s-1080p60.mp4` | 1920×1080 web copy |
| `out/racknap-easy-launch-90s-4k60.mp4` (not committed, 169 MB) | Full-quality master: H.264 CRF 14, AAC stereo at about −14.8 LUFS, true peak −1.3 dBTP. Delivered directly; rebuild with the commands below |
| `out/audio/` | Stems: `vo.wav`, `music.wav`, `sfx.wav`, `mix.wav` |
| `index.html`, `js/` | The composition: `data.js` (records), `ui.js` (interface), `core.js` (camera, easing, cursor), `scenes.js` (timeline) |
| `audio/vo.py`, `audio/score.py` | Voice-over generation, plus the original score, sound design and mix |
| `render.js`, `merge_frames.py` | Parallel frame renderer with adaptive motion blur, and the encoder |

## Scenes

| Time | Scene | On-screen message |
| --- | --- | --- |
| 0:00–0:07 | Fragmented spreadsheets, supplier portal, backup console, billing system and invoices drift in 3D. Data paths are broken. | Spreadsheets. · Vendor portals. · Disconnected billing. · There's a better way. |
| 0:07–0:13 | Everything snaps magnetically into one core, then an orange light sweep, the masked logo reveal, and the dashboard reveal (beat drop at 0:08.65). | One platform for cloud quote-to-cash. |
| 0:13–0:20 | Overview KPIs count up. A revenue-by-customer donut, revenue vs cost bars and subscription metrics lift out as floating panels. | Your business, in view. |
| 0:20–0:26 | **Customer 360** for Harborstone Systems: subscription, quote, invoice and billing-check cards linked to the customer card, with a camera focus tour. | Every customer, connected. |
| 0:26–0:34 | Catalog: a staggered 3D grid reveal, the Productivity filter, Microsoft 365 Business Premium lifted, *Add to quote +*, and the card flying into the quote chip. | Every vendor. One catalog. |
| 0:34–0:40 | **Storefront builder (concept, see below):** components dragged in with magnetic snapping, then a desktop → tablet → mobile reflow. | Drag. Drop. Publish. |
| 0:40–0:47 | Quote builder: customer selected, quantity 1 → 30, totals and 21.4% margin, saved as **Q-1025 · $840**. | Accurate quotes, priced instantly. |
| 0:47–0:54 | The quote morphs into the workflow: Q-1025 → **ORD-1026** → fulfillment → **SUB-1027** (renews Nov 28, 2026), with progress rings and pulses. | From quote to active service. |
| 0:54–1:01 | Subscriptions: 4 active, $2,560/month, renewal timeline, then the *Manage* panel (quantity and suspension). | Recurring revenue, under control. |
| 1:01–1:08 | Subscription rows fly into invoice **INV-2603** (two lines, **$1,140**), then *Export invoice data ↓*, which downloads `INV-2603.csv`. | Invoices from real subscriptions. |
| 1:08–1:15 | Supplier vs customer billing side by side. Cedarline is **52 vs 48 (+4 seats, $60 unbilled)**; the review and correction step turns it green. | Catch every billing gap. |
| 1:15–1:23 | Profitability interpolates from the opening month ($1,660 revenue, 20.8% margin) to the closed-out month (**$2,560, $586 gross profit, 22.9%**). Then a pull-back to the connected module ecosystem. | See margin, not just revenue. |
| 1:23–1:30 | The modules converge, the logo is revealed with a light sweep, then the tagline and CTA. | Sell smarter. Operate simpler. Grow faster. · **Discover RackNap Easy** |

## Data accuracy

- **Source of every record:** the RackNap Easy reference workspace: Nimbus Cloud Partners, its customers Cedarline Solutions, Solace Digital and Harborstone Systems, and the six catalog products with their USD prices.
- **Source of every downstream number:** I ran the reference app's own logic for the whole journey: create the quote, accept it, fulfil the order, generate the invoice, apply the reconciliation correction. The output is in `assets/app-flow-reference.json`, and `js/data.js` checks its totals against that output.
- **Dates:** US format (Oct 28, 2026; Nov 28, 2026).
- **What the numbers mean:** they are the reference workspace's sample values, shown as a walkthrough of the workflow. They are not presented as customer results.
- **Removed labels:** prototype banners, "sample/demo" labels and simulation notes are removed from the interface. A render-time check fails the build if any of them is visible.
- **Not real-world claims:** product names and prices are the prototype's values. Before public release, confirm the price list and get approval to use Microsoft and Acronis product names.

### Functionality not in the reference app

- **Storefront builder (0:34–0:40).** The reference app has no drag-and-drop page builder. This scene was built as a concept at your request. Remove or replace it if RackNap Easy doesn't ship this feature.
- **Customer 360 (0:20–0:26).** This view is composed from the app's real per-customer records: subscription, quote, invoice and reconciliation status. The app itself has no single screen with this name.
- **"Revenue by customer" donut (0:13–0:20).** This is a presentation of the real invoice totals. The app shows the same data as bars.

## Audio

- **Voice-over:** neural text-to-speech (Piper, voice `en_US-john-medium`, trained on public-domain LibriVox recordings; see `assets/VOICE_MODEL_CARD.txt`). It's a natural-sounding American male placeholder. Replace it with a professional voice talent for the final campaign; the script and timings are in `audio/vo.py`.
- **Music:** an original 118 BPM score synthesised in `audio/score.py`. It has a tense intro, a beat drop on the logo reveal, energetic feature sections, a build into a breakdown and an uplifting brand chord at the end. There are no third-party samples.
- **Sound effects:** UI clicks on every cursor press, magnetic snaps, data pulses on counters, chimes when steps complete, whooshes on transitions, and impacts on the logo reveals.
- **Mix:** the music ducks about 7 dB under the voice. The master measures about −14.8 LUFS integrated, with true peak at −1.3 dBTP.

## Rebuilding

```bash
pip install piper-tts onnxruntime scipy
```

Get the `en_US-john-medium` voice from https://huggingface.co/rhasspy/piper-voices, then:

```bash
python3 audio/vo.py en_US-john-medium.onnx audio/build/vo.wav
```

```bash
python3 audio/score.py assets/cues.json audio/build/vo.wav audio/build/
```

Render the picture (about 1 hour on 4 cores):

```bash
node render.js --scale 2 --fps 60 --workers 3 --step 2 --maxn 4 --out out/racknap-easy-launch-90s-4k60-silent.mp4
```

For a quick preview, add `--stills 12,30,45 --scale 1`, or open `index.html?play` in a browser.
