import React from "react";
import { Composition } from "remotion";
import { BeyondPossibilities, VideoProps } from "./Video";
import { FPS, OUTPUT_SCALE, STAGE_H, STAGE_W, TOTAL_FRAMES } from "./theme";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="BeyondPossibilities"
    component={BeyondPossibilities}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={STAGE_W * OUTPUT_SCALE}
    height={STAGE_H * OUTPUT_SCALE}
    defaultProps={{ music: true } satisfies VideoProps}
  />
);
