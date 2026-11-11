# Phase 1 – Analysis: fuel-pricing-1080p.mp4 → 9:16

## Source (ffprobe)
| | |
|---|---|
| Container | MP4, 171.2 MB, 17.3 Mb/s |
| Video | H.264 High, 1920x1080, yuv420p (bt470bg matrix), progressive, **30 fps CFR**, 2370 frames |
| Duration | **79.000 s** (video and audio both 79.000 s) |
| Audio | AAC-LC, 48 kHz, **mono**, ~183 kb/s |

## Scenes
PySceneDetect `detect-adaptive` found one hard cut (62.8 s). Most transitions are cross-dissolves or
wipes, so I added `detect-content -t 12` and a windowed (15-frame) difference pass. Result: 11 scenes
(`analysis/scenes.json`). Frames: `analysis/frames/sNN_{start,mid,end}_<t>.png`.

Global observations
* **Burned-in captions on every scene**: a white pill centred at x=960, y≈975–1045, widest ≈ x 505–1415.
* **Logo**: "in time tec / CREATING ABUNDANCE" appears **only on the end card** (69.5 s+, x 375–1000, y 180–320).
  No persistent logo bug exists in the source.
* Centre 608 px window (x 656–1264) cuts something important in **every** scene. A plain crop is ruled out.

| # | Time (s) | On screen | Fits 608px? |
|---|---|---|---|
| 1 | 0.0–4.6 | Woman at door; "06:00" clock badge top-left (x105–410, y90–190) | No (badge far left) |
| 2 | 4.6–10.9 | E10 2.309 sign (x430–1310); chips "Competitor −2c / Promotion day / Yesterday: low volume" (x1185–1617, y150–420) | No |
| 3 | 10.9–13.1 | Sign close-up 2.289 (x160–1090) + big "?" (x1150–1800) | No |
| 4 | 13.1–19.5 | Woman at POS; "Gut feel" title (x690–1170, y80–180); chips (x520–1400, y840–905); POS shows 2.309 (x1340–1860) | No |
| 5 | 19.5–20.8 | Wipe: "Gut feel" photo left / "Data" bar-chart card right | No |
| 6 | 20.8–57.8 | Explainer slides Steps 1–5: title top-left (x145–1450), full-width diagrams/line charts (x140–1760), "Illustrative example" (x1600–1830, y925) | No |
| 7 | 57.8–59.7 | Tablet "Today's prices… Approve" (x150–950) + E10 2.289 pump sign (x660–1020) | Nearly (1080 px wide) |
| 8 | 59.7–62.8 | "Price changes delivered straight to the pump" title; Approved card (x180–630); pump (x1340–1620); "Live at the pump" chip (x1305–1830, y920–985) | No |
| 9 | 62.8–64.5 | Silhouette pump sign (x820–990) + chip "E10 now €2.289" (x1035–1380) | Nearly |
| 10 | 64.5–69.5 | Aerial map, pins full width; title "Every station · Every fuel · Every day" (x335–1585); chips "No Hardware./No Maintenance." (x1360–1830, y750–880) | No |
| 11 | 69.5–79.0 | End card: logo + tagline + pill + "Book a demo" + URL (x225–1150) and QR card (x1310–1765) | No |

## Proposed vertical layout (1080x1920)
Vertical bands (all inside the safe zone y 250–1520):
* 0–250: blurred, zoomed copy of the same frame (no text)
* 265–340: **persistent logo badge**, cropped from the end card, on a white rounded card, centred
* 360–1310: **foreground band** (1080x950): per-scene crop, uniform scale only
* 1330–1454: **lifted caption strip**: source x480–1440 / y955–1065, scaled 0.95 → 912 px wide, centred at x=520 so the widest pill ends at x≈935 (clear of the right-hand buttons), edges feathered
* 1454–1920: blurred background
Scene changes: the two vertical layouts cross-dissolve over the source's own transition window (≈0.6 s), so text is never cut mid-fade. Crops are static per scene (content doesn't drift), so there's no pan jitter.

| # | Time (s) | Strategy | Source crop (x,y,w,h) → scale → placed |
|---|---|---|---|
| 1 | 0.0–4.6 | A (wide smart crop) | 80,60,920,809 → 1.174 → 1080x950 @y360 |
| 2 | 4.6–10.9 | A (wide smart crop) | 400,0,1280,960 → 0.844 → 1080x810 @y430 |
| 3 | 10.9–13.1 | B (fit content box) | 120,150,1720,780 → 0.628 → 1080x490 @y590 |
| 4 | 13.1–19.5 | A (wide smart crop) | 420,0,1280,960 → 0.844 → 1080x810 @y430 |
| 5 | 19.5–20.8 | B (same as 6) | 110,60,1700,900 → 0.635 → 1080x572 @y549 |
| 6 | 20.8–57.8 | B (fit content box) | 110,60,1700,900 → 0.635 → 1080x572 @y549 |
| 7 | 57.8–59.7 | A (smart crop) | 100,0,1080,960 → 0.99 → 1069x950 @y360 |
| 8 | 59.7–62.8 | B (fit, caption kept in place*) | 160,80,1680,980 → 0.643 → 1080x630 @y520 |
| 9 | 62.8–64.5 | A (smart crop) | 560,0,1080,960 → 0.99 → 1069x950 @y360 |
| 10 | 64.5–69.5 | B (full-frame fit) | 0,50,1920,910 → 0.5625 → 1080x512 @y579 |
| 11 | 69.5–79.0 | C (stack) | left column 200,160,980,740 → 0.90 → 882x666 @y270; QR card 1310,215,455,575 → 0.62 → 282x357 @y950; logo badge hidden |

\* The "Live at the pump" chip in scene 8 overlaps the caption band, so that scene keeps its caption inside the foreground.

Compromises
* Scenes 3, 5, 6, 8 and 10 have full-width graphics. They can only be ~0.56–0.64x of the source, so the small chart labels
  ("€2.249", "STEP 1") end up ~13–17 px tall. Titles stay 40 px+, and the lifted captions are ~1.7x larger than a plain fit.
* The persistent logo badge adds branding that isn't on screen in the source before 69.5 s. It needs your approval.
