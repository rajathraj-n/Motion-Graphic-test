// Global CLI / Studio render settings.
// See https://www.remotion.dev/docs/config
// Note: per-composition defaults (e.g. ProRes 4444 for transparent overlays)
// live in src/Root.tsx via calculateMetadata. CLI flags always win.
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg"); // fast default for opaque videos
Config.setOverwriteOutput(true);
