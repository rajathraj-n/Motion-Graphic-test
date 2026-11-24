# From Seed to Cup: one script, three styles

Three short motion films about the journey of a coffee bean, each built entirely in code with the Lemo-Opuscar style library. English on-screen text, no voice-over, original synthesized score and sound.

| Film | Style | Length | Story shape |
|---|---|---|---|
| [`coffee-swiss/coffee-swiss.mp4`](coffee-swiss/coffee-swiss.mp4) | Swiss Motion Graphics | 38 s | Seven numbered steps on a grid. One red dot (the bean) is the only thing off-grid, and it ends as the full stop in *coffee.* |
| [`coffee-watercolor/coffee-watercolor.mp4`](coffee-watercolor/coffee-watercolor.mp4) | Watercolor Brush | 44 s | A handwritten question, answered by painting down one tall journal page: branch, cut cherry, drying, roast swatches, cup. |
| [`coffee-blueprint/coffee-blueprint.mp4`](coffee-blueprint/coffee-blueprint.mp4) | Blueprint | 40 s | One centre line across a cyanotype sheet: cherry, drum roaster, burr grinder, cup. Stamped BREWED, then a coffee ring lands on the title block. |

The shared script (the same beats in every film):

1. A seed is planted.
2. About 3 years until the first fruit.
3. Each cherry holds 2 seeds: the beans.
4. Sun-dried for about 3 weeks.
5. Roasted at about 200 °C: green turns brown.
6. Ground fresh.
7. About 70 beans make one cup.

Each folder holds the film, `poster.jpg`, `TREATMENT.md` (structure, shot list, beat sheet, cue map, sound design), `CREDITS`, and the full source:

- `index.html`: the picture, as a function of time.
- `mix.py` and `synth.py`: the score and foley.
- `build.sh`: a one-command rebuild, which needs the Lemo-Opuscar library with its core packages.

Then run, for example:

```bash
LIB=~/lemo-opuscar sh coffee-swiss/build.sh
```
