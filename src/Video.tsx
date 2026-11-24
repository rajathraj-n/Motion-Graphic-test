import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { OUTPUT_SCALE, SCENES, STAGE_H, STAGE_W, TAIL, TOTAL_FRAMES } from "./theme";
import { Background, FilmGrain } from "./components/Atmosphere";
import { Scene01Hook } from "./scenes/Scene01Hook";
import { Scene02Meet } from "./scenes/Scene02Meet";
import { Scene03Create } from "./scenes/Scene03Create";
import { Scene04Think } from "./scenes/Scene04Think";
import { Scene05Imagine } from "./scenes/Scene05Imagine";
import { Scene06Workspace } from "./scenes/Scene06Workspace";
import { Scene07Payoff } from "./scenes/Scene07Payoff";
import { Scene08Brand } from "./scenes/Scene08Brand";

const COMPONENTS: Record<(typeof SCENES)[number]["id"], React.FC> = {
  hook: Scene01Hook,
  meet: Scene02Meet,
  create: Scene03Create,
  think: Scene04Think,
  imagine: Scene05Imagine,
  workspace: Scene06Workspace,
  payoff: Scene07Payoff,
  brand: Scene08Brand,
};

export type VideoProps = { music: boolean };

/**
 * Master timeline. Every scene is authored on a 1920x1080 stage and the whole
 * stage is scaled by OUTPUT_SCALE so text and vectors rasterise natively at 4K.
 * Each scene stays mounted for TAIL extra frames so the next one can cross it.
 */
export const BeyondPossibilities: React.FC<VideoProps> = ({ music }) => {
  return (
    <AbsoluteFill style={{ background: "#0A0A0A" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: STAGE_W, height: STAGE_H, transform: `scale(${OUTPUT_SCALE})`, transformOrigin: "0 0", overflow: "hidden" }}>
        <Background />
        {SCENES.map((s, i) => {
          const Comp = COMPONENTS[s.id];
          const last = i === SCENES.length - 1;
          const dur = last ? TOTAL_FRAMES - s.start : s.dur + TAIL;
          return (
            <Sequence key={s.id} from={s.start} durationInFrames={dur} name={`${String(i + 1).padStart(2, "0")} · ${s.id}`} layout="none">
              <AbsoluteFill style={{ width: STAGE_W, height: STAGE_H }}>
                <Comp />
              </AbsoluteFill>
            </Sequence>
          );
        })}
        <FilmGrain opacity={0.06} />
      </div>
      {music && <Audio src={staticFile("audio/soundtrack.wav")} />}
    </AbsoluteFill>
  );
};
