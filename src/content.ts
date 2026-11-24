import {createContext, useContext} from 'react';
import {VO} from './timeline';

/**
 * Every piece of on-screen copy, in one place.
 * Edit here (or in Remotion Studio's props panel / the browser editor) — scenes read from this.
 */
export const defaultContent = {
  s1: {left: 'COMPLEXITY', right: 'OPPORTUNITY'},
  s2: {kicker: 'THE CHALLENGE', chip1: 'SCATTERED DATA', chip2: 'SLOW HANDOFFS', chip3: 'DISCONNECTED TOOLS'},
  s3: {kicker: 'IN TIME TEC', headline: 'CONNECTED BY DESIGN'},
  s4: {
    kicker: 'CUSTOM AI',
    line1: 'AI-POWERED',
    line2: 'INTELLIGENCE',
    sub1: 'From information overload',
    sub2: 'to intelligent action.',
  },
  s5: {headline: 'CUSTOM SOFTWARE', sub: 'INTUITIVE EXPERIENCES'},
  s6: {kicker: 'DATA  •  AUTOMATION  •  VISIBILITY', headline: 'FROM DATA TO ACTION'},
  s7: {word1: 'SECURE', word2: 'SCALABLE', word3: 'RESULTS-DRIVEN'},
  s8: {
    tagline: 'CREATING ABUNDANCE',
    cta: "Let's Build What's Next.",
    url: 'intimetec.com',
    /** null → config.logoFile / placeholder. Accepts a /public path or a data: URL. */
    logo: null as string | null,
  },
  showCaptions: false,
  vo: VO.map((l) => l.text),
};

export type Content = typeof defaultContent;

export const ContentContext = createContext<Content>(defaultContent);
export const useContent = () => useContext(ContentContext);
