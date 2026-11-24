import React from "react";
import { AbsoluteFill, Composition, OffthreadVideo, staticFile } from "remotion";
import { BeyondPossibilities, VideoProps } from "./Video";
import { DEFAULT_COPY } from "./copy";
import { FPS, OUTPUT_SCALE, STAGE_H, STAGE_W, TOTAL_FRAMES } from "./theme";

/** Plays the already-rendered preview file, so the finished video can be watched in Studio. */
const RenderedPreview: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <OffthreadVideo src={staticFile("renders/preview-1080p.mp4")} />
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="BeyondPossibilities"
    component={BeyondPossibilities}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={STAGE_W * OUTPUT_SCALE}
    height={STAGE_H * OUTPUT_SCALE}
    defaultProps={{ music: true, copy: DEFAULT_COPY } satisfies VideoProps}
  />
  <Composition
    id="RenderedPreview1080p"
    component={RenderedPreview}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
  </>
);
