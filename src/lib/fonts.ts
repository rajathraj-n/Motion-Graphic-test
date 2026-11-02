/**
 * Google Font loaded via @remotion/google-fonts.
 * Remotion waits for the font before rendering any frame, so there is no
 * flash of fallback text in renders.
 *
 * To swap fonts: change the import (e.g. "@remotion/google-fonts/Roboto")
 * and the weights. Only load the weights/subsets you use — it keeps renders fast.
 *
 * For a local font file instead, put it in public/fonts/ and use
 * @remotion/fonts' loadFont({ family, url: staticFile("fonts/MyFont.woff2") }).
 */
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});

export const FONT_FAMILY = fontFamily;
