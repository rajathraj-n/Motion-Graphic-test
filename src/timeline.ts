import {FPS} from './theme';

export const DURATION = 50 * FPS; // 1500 frames
/** Frames that adjacent scenes overlap on each side of a cut (≈0.5 s total transition). */
export const OVERLAP = 8;

export type SceneId = 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7' | 's8';

/** Nominal scene boundaries in seconds — matches the storyboard. */
export const SCENES: {id: SceneId; start: number; end: number; title: string}[] = [
  {id: 's1', start: 0, end: 5, title: 'The Hook — Complexity to Opportunity'},
  {id: 's2', start: 5, end: 11, title: 'The Challenge — Disconnected Systems'},
  {id: 's3', start: 11, end: 17, title: 'The Solution — In Time Tec'},
  {id: 's4', start: 17, end: 24, title: 'AI-Powered Intelligence'},
  {id: 's5', start: 24, end: 31, title: 'Custom Software and UX/UI'},
  {id: 's6', start: 31, end: 38, title: 'Data and Workflow Automation'},
  {id: 's7', start: 38, end: 44, title: 'Secure, Scalable, Built for Results'},
  {id: 's8', start: 44, end: 50, title: 'Brand Reveal — Creating Abundance'},
];

/** Voiceover script with target in/out points (seconds). */
export const VO: {start: number; end: number; text: string}[] = [
  {start: 0.4, end: 4.4, text: 'What if complexity could become your competitive advantage?'},
  {start: 5.3, end: 10.6, text: 'Disconnected systems, scattered data, and slow handoffs hold businesses back.'},
  {start: 11.4, end: 16.2, text: 'In Time Tec connects the pieces and turns ideas into impact.'},
  {start: 17.4, end: 23.2, text: 'With custom AI, teams move from information overload to intelligent action.'},
  {start: 24.4, end: 30.4, text: 'We design software and intuitive experiences around how people really work.'},
  {start: 31.4, end: 37.4, text: 'We bring data, automation, and real-time visibility into one seamless workflow.'},
  {start: 38.4, end: 43.4, text: 'Built for security, scale, and results that matter to your business.'},
  {start: 44.6, end: 49.2, text: "In Time Tec. Creating Abundance. Let's build what's next."},
];
