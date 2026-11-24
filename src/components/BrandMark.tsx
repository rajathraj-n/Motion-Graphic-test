import React from "react";
import { Img } from "remotion";
import { asset } from "../assets";

/**
 * BRAND LOGO SLOT
 * ---------------------------------------------------------------
 * The spec calls for the *authentic* ChatGPT logo. Trademarked logos are
 * not redrawn here. Drop the official asset (from OpenAI's brand
 * guidelines, with the necessary permission) into
 *   public/brand/logo.svg
 * and set BRAND_LOGO_FILE to "brand/logo.svg". Until then a neutral
 * placeholder glyph is rendered so the animation can be reviewed.
 */
export const BRAND_LOGO_FILE: string | null = null;

export const BrandMark: React.FC<{ size: number; draw?: number; color?: string }> = ({
  size,
  draw = 1,
  color = "#FFFFFF",
}) => {
  if (BRAND_LOGO_FILE) {
    return <Img src={asset(BRAND_LOGO_FILE)} style={{ width: size, height: size, objectFit: "contain" }} />;
  }
  // Placeholder: a neutral "conversation spark" glyph (not the official mark).
  const len = 260;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", overflow: "visible" }}>
      <path
        d="M50 12c21 0 38 15 38 34S71 80 50 80c-4 0-8-.5-11.6-1.6L22 88l3.6-15C17 66 12 57 12 46 12 27 29 12 50 12z"
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - draw)}
      />
      <path
        d="M50 30l4.2 11.8L66 46l-11.8 4.2L50 62l-4.2-11.8L34 46l11.8-4.2z"
        fill={color}
        opacity={Math.max(0, (draw - 0.55) / 0.45)}
        transform={`rotate(${(1 - draw) * 90} 50 46)`}
      />
    </svg>
  );
};
