import React from "react";

type GlassProps = {
  style?: React.CSSProperties;
  radius?: number;
  /** 0..1 position of the travelling edge highlight; undefined = no sweep. */
  sweep?: number;
  /** Fill opacity (spec: 8–15%). */
  fill?: number;
  blur?: number;
  children?: React.ReactNode;
  shadow?: boolean;
  tint?: string;
};

/** Frosted-glass surface: translucent fill, backdrop blur, hairline border, edge light, soft shadow. */
export const Glass: React.FC<GlassProps> = ({
  style,
  radius = 22,
  sweep,
  fill = 0.1,
  blur = 30,
  children,
  shadow = true,
  tint = "255,255,255",
}) => {
  const angle = sweep === undefined ? 0 : sweep * 360;
  return (
    <div
      style={{
        position: "absolute",
        borderRadius: radius,
        background: `linear-gradient(160deg, rgba(${tint},${fill + 0.04}) 0%, rgba(${tint},${fill * 0.55}) 45%, rgba(${tint},${fill * 0.35}) 100%)`,
        backdropFilter: `blur(${blur}px) saturate(140%)`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(140%)`,
        boxShadow: shadow
          ? "0 40px 80px -20px rgba(0,0,0,0.75), 0 12px 24px -8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.14)"
          : "inset 0 1px 0 rgba(255,255,255,0.14)",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* hairline border */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          border: "1px solid rgba(255,255,255,0.10)",
          pointerEvents: "none",
        }}
      />
      {/* travelling edge highlight (gradient border via mask-composite) */}
      {sweep !== undefined && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            padding: 1.2,
            background: `conic-gradient(from ${angle}deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.0) 20deg, rgba(255,255,255,0.85) 48deg, rgba(16,163,127,0.6) 62deg, transparent 95deg, transparent 360deg)`,
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            pointerEvents: "none",
          }}
        />
      )}
      {/* top sheen */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: "40%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.05), transparent)",
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
};
