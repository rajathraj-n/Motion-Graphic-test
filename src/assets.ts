import { staticFile } from "remotion";

declare global {
  interface Window {
    /** Set by the web player page so assets load relative to that page instead of Remotion's public dir. */
    __ASSET_BASE__?: string;
  }
}

export const asset = (path: string) =>
  typeof window !== "undefined" && window.__ASSET_BASE__ !== undefined ? `${window.__ASSET_BASE__}${path}` : staticFile(path);
