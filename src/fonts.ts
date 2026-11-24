import { continueRender, delayRender, staticFile } from "remotion";

/** Inter (SIL OFL 1.1) + JetBrains Mono, bundled locally so renders never depend on the network. */
const FACES: Array<[family: string, file: string, weight: string]> = [
  ["Inter", "fonts/Inter-Light.otf", "300"],
  ["Inter", "fonts/Inter-Regular.otf", "400"],
  ["Inter", "fonts/Inter-Medium.otf", "500"],
  ["Inter", "fonts/Inter-SemiBold.otf", "600"],
  ["Inter", "fonts/Inter-Bold.otf", "700"],
  ["JetBrains Mono", "fonts/JetBrainsMono-Regular.ttf", "400"],
];

let loaded = false;
export const ensureFonts = () => {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  const handle = delayRender("Loading bundled fonts");
  Promise.all(
    FACES.map(([family, file, weight]) => {
      const face = new FontFace(family, `url(${staticFile(file)})`, { weight, style: "normal" });
      return face.load().then((f) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(f));
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
