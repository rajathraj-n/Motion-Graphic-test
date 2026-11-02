import React from "react";
import { AbsoluteFill } from "remotion";
import { TITLE_SAFE } from "../config/video";

/**
 * Lays children out inside the title-safe area.
 * Set showGuide to draw the safe box while designing (it is never needed in renders).
 */
export const TitleSafe: React.FC<{
  children: React.ReactNode;
  showGuide?: boolean;
  style?: React.CSSProperties;
}> = ({ children, showGuide = false, style }) => {
  const inset = `${TITLE_SAFE * 100}%`;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: inset,
          right: inset,
          bottom: inset,
          left: inset,
          display: "flex",
          outline: showGuide ? "2px dashed rgba(255,0,128,0.8)" : undefined,
          ...style,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
