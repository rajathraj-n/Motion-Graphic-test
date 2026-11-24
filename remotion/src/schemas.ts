import { z } from 'zod';

const audio = {
  music: z.boolean().describe('Play the guide music track'),
  musicVolume: z.number().min(0).max(1).step(0.05).describe('Music volume'),
  voiceoverVolume: z.number().min(0).max(2).step(0.05).describe('Voiceover volume (files in public/voiceover/…)'),
};

export const inTimeTecSchema = z.object({
  text: z.object({
    hookFrom: z.string().describe('Scene 1 — word before the wipe'),
    hookTo: z.string().describe('Scene 1 — word after the wipe'),
    problems: z.array(z.string()).describe('Scene 2 — three problem labels'),
    connectedHeadline: z.string().describe('Scene 3 — headline'),
    pillars: z.array(z.object({ title: z.string(), subtitle: z.string() })).describe('Scene 3 — three cards'),
    aiHeadline: z.string().describe('Scene 4 — headline'),
    softwareKicker: z.string().describe('Scene 5 — small label'),
    softwareHeadline: z.array(z.string()).describe('Scene 5 — headline lines (max 3, last one orange)'),
    capabilitiesHeadline: z.string().describe('Scene 6 — headline'),
    outcomes: z.array(z.string()).describe('Scene 7 — three outcome cards'),
    wordmark: z.string().describe('Scene 8 — placeholder wordmark (hidden when a logo file is supplied)'),
    tagline: z.string(),
    cta: z.string(),
    website: z.string(),
  }),
  ...audio,
});

export const freedomSchema = z.object({
  text: z.object({
    title: z.string().describe('Opening title'),
    rani: z.array(z.string()).describe('Scene 2 — name, subtitle'),
    bhagat: z.array(z.string()).describe('Scene 3 — name, subtitle'),
    gandhi: z.array(z.string()).describe('Scene 4 — name, subtitle'),
    netaji: z.array(z.string()).describe('Scene 5 — name, subtitle'),
    medallions: z.array(z.string()).describe('Finale — portrait labels (use \\n for a line break)'),
    date: z.string(),
    finalTitle: z.string(),
    finalLine: z.string(),
  }),
  ...audio,
});
