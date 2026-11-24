// Remotion configuration — https://www.remotion.dev/docs/config
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
// Both films use canvas; the In Time Tec film also uses WebGL2.
Config.setChromiumOpenGlRenderer('angle');

// The films' engine files (../intimetec/src, ../src) are imported as plain
// text with a `?raw` suffix and run in a sandbox, so editing them hot-reloads
// the Studio while each film keeps its own isolated `window.FC`.
Config.overrideWebpackConfig((config) => ({
  ...config,
  module: {
    ...config.module,
    rules: [
      { resourceQuery: /raw/, type: 'asset/source' },
      ...(config.module?.rules ?? []).map((rule) =>
        rule && typeof rule === 'object' && !('resourceQuery' in rule) ? { ...rule, resourceQuery: { not: [/raw/] } } : rule,
      ),
    ],
  },
}));
