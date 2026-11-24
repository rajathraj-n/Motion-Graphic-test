import React from 'react';
import {Img, staticFile} from 'remotion';
import {config} from '../config';
import {C, FONT} from '../theme';

/**
 * Brand logo slot.
 * - With `config.logoFile` set, the official asset is rendered at a fixed height with its
 *   native aspect ratio (width: auto) — never stretched, recoloured or redrawn.
 * - Without it, a plainly-typeset PLACEHOLDER wordmark is shown so layout and timing can be
 *   approved. It is NOT the In Time Tec logo and must be replaced before release.
 */
export const Logo: React.FC<{height?: number; src?: string | null}> = ({height = config.logoHeight, src}) => {
  const file = src ?? config.logoFile;
  if (file) {
    const url = /^(data:|blob:|https?:)/.test(file) ? file : staticFile(file);
    return <Img src={url} style={{height, width: 'auto', display: 'block'}} />;
  }
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: height * 0.62,
          letterSpacing: '0.04em',
          color: C.graphite,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        In Time <span style={{color: C.orange}}>Tec</span>
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 11,
          letterSpacing: '0.2em',
          color: 'rgba(17,19,24,0.35)',
          border: '1px dashed rgba(17,19,24,0.25)',
          borderRadius: 4,
          padding: '3px 8px',
        }}
      >
        LOGO PLACEHOLDER — REPLACE WITH OFFICIAL ASSET
      </div>
    </div>
  );
};
