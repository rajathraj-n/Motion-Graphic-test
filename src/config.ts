/**
 * Production configuration. Drop files into /public and point these at them.
 * Everything is optional so the video renders before final assets arrive.
 */
export const config = {
  /**
   * Official In Time Tec logo (SVG or high-res PNG) placed in /public, e.g. 'brand/intimetec-logo.svg'.
   * While null, a clearly-marked typeset placeholder is shown in the end card.
   * The logo is rendered with its native aspect ratio — never stretched or redrawn.
   */
  logoFile: null as string | null,
  /** Height of the logo on the end card in design px (×2 at 4K). */
  logoHeight: 120,

  audio: {
    /** Full-length music bed, e.g. 'audio/music.wav' (~118 BPM). */
    music: null as string | null,
    /** Full-length VO stem aligned to frame 0, e.g. 'audio/voiceover.wav'. */
    voiceover: null as string | null,
    /** Full-length SFX stem aligned to frame 0, e.g. 'audio/sfx.wav'. */
    sfx: null as string | null,
    musicVolume: 0.7,
    /** Ducking applied to music under narration (≈ -8 dB). */
    duckGain: 0.4,
  },

  /** Burn the VO lines in as subtitles (useful for muted autoplay on the homepage). */
  showCaptions: false,
};
