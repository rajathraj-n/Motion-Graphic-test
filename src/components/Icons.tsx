import React from "react";

type P = { size?: number; color?: string; stroke?: number; style?: React.CSSProperties };
const base = (size: number, style?: React.CSSProperties) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  style: { display: "block", ...style },
});

export const IconPlus: React.FC<P> = ({ size = 22, color = "#A1A1AA", stroke = 1.8, style }) => (
  <svg {...base(size, style)}><path d="M12 5v14M5 12h14" stroke={color} strokeWidth={stroke} strokeLinecap="round" /></svg>
);
export const IconArrowUp: React.FC<P> = ({ size = 22, color = "#0A0A0A", stroke = 2.2, style }) => (
  <svg {...base(size, style)}><path d="M12 19V5M6 11l6-6 6 6" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const IconMic: React.FC<P> = ({ size = 22, color = "#A1A1AA", stroke = 1.8, style }) => (
  <svg {...base(size, style)}>
    <rect x="9" y="3" width="6" height="11" rx="3" stroke={color} strokeWidth={stroke} />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
  </svg>
);
export const IconSpark: React.FC<P> = ({ size = 22, color = "#10A37F", style }) => (
  <svg {...base(size, style)}>
    <path d="M12 2.5l2.1 6.2 6.4 2.3-6.4 2.3L12 19.5l-2.1-6.2L3.5 11l6.4-2.3z" fill={color} />
    <circle cx="19" cy="4.5" r="1.4" fill={color} opacity={0.7} />
  </svg>
);
export const IconPen: React.FC<P> = ({ size = 22, color = "#fff", stroke = 1.7, style }) => (
  <svg {...base(size, style)}><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" stroke={color} strokeWidth={stroke} strokeLinejoin="round" /></svg>
);
export const IconBulb: React.FC<P> = ({ size = 22, color = "#fff", stroke = 1.7, style }) => (
  <svg {...base(size, style)}>
    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
  </svg>
);
export const IconChart: React.FC<P> = ({ size = 22, color = "#fff", stroke = 1.7, style }) => (
  <svg {...base(size, style)}><path d="M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3" stroke={color} strokeWidth={stroke} strokeLinecap="round" /></svg>
);
export const IconCode: React.FC<P> = ({ size = 22, color = "#fff", stroke = 1.7, style }) => (
  <svg {...base(size, style)}><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const IconImage: React.FC<P> = ({ size = 22, color = "#fff", stroke = 1.7, style }) => (
  <svg {...base(size, style)}>
    <rect x="3" y="4" width="18" height="16" rx="3" stroke={color} strokeWidth={stroke} />
    <circle cx="9" cy="10" r="2" stroke={color} strokeWidth={stroke} />
    <path d="M3 17l5-4 4 3 3-2 6 4" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
  </svg>
);
export const IconCheck: React.FC<P> = ({ size = 22, color = "#10A37F", stroke = 2.2, style }) => (
  <svg {...base(size, style)}><path d="M5 12.5l4.5 4.5L19 7.5" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const IconSheet: React.FC<P & { progress?: number }> = ({ size = 56, style }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 40 48" style={{ display: "block", ...style }}>
    <path d="M4 4a4 4 0 0 1 4-4h18l10 10v34a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#10A37F" />
    <path d="M26 0v8a2 2 0 0 0 2 2h8" fill="#0B7A5F" />
    <rect x="10" y="20" width="20" height="16" rx="1.5" fill="none" stroke="#fff" strokeWidth="2" />
    <path d="M10 26h20M10 31h20M17 20v16" stroke="#fff" strokeWidth="1.6" />
  </svg>
);
