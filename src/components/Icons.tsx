import React from 'react';

const P: Record<string, string[]> = {
  spark: ['M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z', 'M19 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z'],
  shield: ['M12 3l7.5 3v5.2c0 4.6-3.1 8.4-7.5 9.8-4.4-1.4-7.5-5.2-7.5-9.8V6z', 'M8.8 12.2l2.3 2.3 4.3-4.6'],
  cloud: ['M7.5 18.5h9.8a4.2 4.2 0 0 0 .6-8.35A6 6 0 0 0 6.4 9.3a4.6 4.6 0 0 0 1.1 9.2z'],
  chart: ['M4 20h16', 'M7 20v-6', 'M12 20V8', 'M17 20v-10'],
  trend: ['M3 17l6-6 4 4 8-8', 'M15 7h6v6'],
  database: [
    'M4.5 6.5c0-1.7 3.4-3 7.5-3s7.5 1.3 7.5 3-3.4 3-7.5 3-7.5-1.3-7.5-3z',
    'M4.5 6.5v11c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-11',
    'M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3',
  ],
  flow: ['M6 4.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z', 'M18 4.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z', 'M12 14.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z', 'M8.5 7h7', 'M7.2 9.3l3.6 5.4', 'M16.8 9.3l-3.6 5.4'],
  bolt: ['M13 2.5L4.5 13.5h6.5l-1 8 8.5-11h-6.5z'],
  user: ['M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8z', 'M4.5 20.5c.6-3.8 3.7-6 7.5-6s6.9 2.2 7.5 6'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  lock: ['M6 11h12v9.5H6z', 'M8.5 11V8a3.5 3.5 0 0 1 7 0v3', 'M12 14.5v2.5'],
  grid: ['M4 4h7v7H4z', 'M13 4h7v7h-7z', 'M4 13h7v7H4z', 'M13 13h7v7h-7z'],
  tasks: ['M4 6.5l1.5 1.5L8 5.5', 'M11 7h9', 'M4 12.5l1.5 1.5L8 11.5', 'M11 13h9', 'M4.5 18h3', 'M11 19h9'],
  home: ['M4 11l8-7 8 7', 'M6 9.5V20h12V9.5'],
  search: ['M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z', 'M15.5 15.5L20 20'],
  bell: ['M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z', 'M10 20.5a2 2 0 0 0 4 0'],
  settings: ['M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z', 'M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1'],
  users: ['M9 5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z', 'M2.5 20c.5-3.4 3.1-5.5 6.5-5.5s6 2.1 6.5 5.5', 'M16 5.2a3.3 3.3 0 0 1 0 6.4', 'M18 14.8c2 .7 3.2 2.5 3.5 5.2'],
  server: ['M4 4.5h16v6H4z', 'M4 13.5h16v6H4z', 'M7.5 7.5h.01M7.5 16.5h.01'],
  gauge: ['M4 16a8 8 0 1 1 16 0', 'M12 16l4-5'],
  arrow: ['M4 12h15', 'M14 7l5 5-5 5'],
  folder: ['M3.5 6.5h6l2 2h9v10h-17z'],
};

export type IconName = keyof typeof P;

export const Icon: React.FC<{
  name: IconName;
  size?: number;
  color?: string;
  stroke?: number;
  draw?: number; // 0..1 line-draw progress
  style?: React.CSSProperties;
}> = ({name, size = 22, color = 'currentColor', stroke = 1.7, draw = 1, style}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{display: 'block', flexShrink: 0, ...style}}>
    {P[name].map((d, i) => (
      <path
        key={i}
        d={d}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={draw < 1 ? '1 1' : undefined}
        strokeDashoffset={draw < 1 ? 1 - draw : undefined}
      />
    ))}
  </svg>
);

/** Icon inside a soft rounded tile. */
export const IconTile: React.FC<{name: IconName; size?: number; active?: boolean; draw?: number}> = ({
  name,
  size = 44,
  active = true,
  draw,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: active ? 'linear-gradient(145deg, rgba(240,96,35,0.28), rgba(240,96,35,0.08))' : 'rgba(255,255,255,0.06)',
      border: `1px solid ${active ? 'rgba(240,96,35,0.55)' : 'rgba(255,255,255,0.12)'}`,
      boxShadow: active ? '0 0 22px rgba(240,96,35,0.25)' : undefined,
    }}
  >
    <Icon name={name} size={size * 0.5} color={active ? '#FF8A52' : 'rgba(255,255,255,0.7)'} draw={draw} />
  </div>
);
