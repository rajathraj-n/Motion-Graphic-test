import React from "react";
import { CalculateMetadataFunction, Composition, Folder } from "remotion";
import { sec, VIDEO } from "./config/video";
import {
  KINETIC_TEXT_DURATION_SEC,
  KineticText,
  kineticTextSchema,
} from "./compositions/KineticText";
import {
  LOWER_THIRD_DURATION_SEC,
  LowerThird,
  lowerThirdSchema,
} from "./compositions/LowerThird";
import {
  OVERLAY_BADGE_DURATION_SEC,
  OverlayBadge,
  overlayBadgeSchema,
} from "./compositions/OverlayBadge";
import {
  TITLE_CARD_DURATION_SEC,
  TitleCard,
  titleCardSchema,
} from "./compositions/TitleCard";

/**
 * Makes "Render" (Studio button or CLI without flags) default to a
 * transparent ProRes 4444 .mov for overlay compositions.
 * CLI flags such as --codec=h264 still override these.
 */
const transparentDefaults: CalculateMetadataFunction<any> = () => ({
  defaultCodec: "prores",
  defaultProResProfile: "4444",
  defaultPixelFormat: "yuva444p10le",
  defaultVideoImageFormat: "png",
});

/**
 * Register every graphic here. Each <Composition> needs:
 *   id               — used in render commands (letters, numbers, dashes only)
 *   component        — the React component
 *   width/height/fps — from src/config/video.ts (override per composition if needed)
 *   durationInFrames — use sec() so timing survives fps changes
 *   schema           — zod schema → editable props panel in the Studio
 *   defaultProps     — starting values, written INLINE so the Studio can save
 *                      prop edits back into this file
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Fullscreen">
        <Composition
          id="TitleCard"
          component={TitleCard}
          width={VIDEO.width}
          height={VIDEO.height}
          fps={VIDEO.fps}
          durationInFrames={sec(TITLE_CARD_DURATION_SEC)}
          schema={titleCardSchema}
          defaultProps={{
            title: "Your Title Here",
            subtitle: "A short supporting line",
            backgroundColor: "#111111",
            textColor: "#ffffff",
            accentColor: "#ffffff",
            showSafeGuide: false,
          }}
        />
        <Composition
          id="KineticText"
          component={KineticText}
          width={VIDEO.width}
          height={VIDEO.height}
          fps={VIDEO.fps}
          durationInFrames={sec(KINETIC_TEXT_DURATION_SEC)}
          schema={kineticTextSchema}
          defaultProps={{
            text: "Make every word move with purpose",
            staggerSec: 0.08,
            fontSize: 96,
            backgroundColor: "#111111",
            textColor: "#ffffff",
            showSafeGuide: false,
          }}
        />
      </Folder>

      <Folder name="Overlays-transparent">
        <Composition
          id="LowerThird"
          component={LowerThird}
          width={VIDEO.width}
          height={VIDEO.height}
          fps={VIDEO.fps}
          durationInFrames={sec(LOWER_THIRD_DURATION_SEC)}
          schema={lowerThirdSchema}
          defaultProps={{
            name: "Jane Doe",
            role: "Job Title, Company",
            panelColor: "#ffffff",
            nameColor: "#111111",
            roleColor: "#555555",
            showSafeGuide: false,
          }}
          calculateMetadata={transparentDefaults}
        />
        <Composition
          id="OverlayBadge"
          component={OverlayBadge}
          width={VIDEO.width}
          height={VIDEO.height}
          fps={VIDEO.fps}
          durationInFrames={sec(OVERLAY_BADGE_DURATION_SEC)}
          schema={overlayBadgeSchema}
          defaultProps={{
            label: "LIVE",
            position: "top-right",
            badgeColor: "#ffffff",
            textColor: "#111111",
            dotColor: "#e5484d",
            playSound: true,
            showSafeGuide: false,
          }}
          calculateMetadata={transparentDefaults}
        />
      </Folder>
    </>
  );
};
