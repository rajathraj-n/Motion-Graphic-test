import React from 'react';
import { Composition } from 'remotion';
import { z } from 'zod';
import { EngineFilm } from './EngineFilm';
import { freedomSchema, inTimeTecSchema } from './schemas';

const InTimeTec: React.FC<z.infer<typeof inTimeTecSchema>> = (p) => (
  <EngineFilm {...p} film="intimetec" musicFile="audio/intimetec_score.mp3" voOffsets={[0.3, 5.4, 11.4, 18.5, 26.5, 34.5, 41.4, 46.9]} />
);
const Freedom: React.FC<z.infer<typeof freedomSchema>> = (p) => (
  <EngineFilm {...p} film="freedom" musicFile="audio/freedom_score.mp3" voOffsets={[0.35, 4.45, 9.45, 14.45, 19.45, 24.4]} />
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="InTimeTec"
      component={InTimeTec}
      schema={inTimeTecSchema}
      durationInFrames={1500}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        text: {
          "hookFrom": "COMPLEXITY",
          "hookTo": "OPPORTUNITY",
          "problems": [
            "DISCONNECTED TOOLS",
            "SCATTERED DATA",
            "MANUAL HANDOFFS"
          ],
          "connectedHeadline": "BUILDING CONNECTED SOLUTIONS",
          "pillars": [
            {
              "title": "PEOPLE",
              "subtitle": "Teams and expertise"
            },
            {
              "title": "PROCESS",
              "subtitle": "Connected workflows"
            },
            {
              "title": "TECHNOLOGY",
              "subtitle": "Modern platforms"
            }
          ],
          "aiHeadline": "INTELLIGENT AUTOMATION",
          "softwareKicker": "CUSTOM SOFTWARE",
          "softwareHeadline": [
            "SOFTWARE",
            "BUILT AROUND",
            "YOU."
          ],
          "capabilitiesHeadline": "DATA. CLOUD. SECURITY.",
          "outcomes": [
            "CLARITY",
            "CONFIDENCE",
            "GROWTH"
          ],
          "wordmark": "IN TIME TEC",
          "tagline": "CREATING ABUNDANCE",
          "cta": "LET'S BUILD WHAT'S NEXT",
          "website": "www.intimetec.com"
        },
        music: true,
        musicVolume: 0.8,
        voiceoverVolume: 1,
      }}
    />
    <Composition
      id="Freedom"
      component={Freedom}
      schema={freedomSchema}
      durationInFrames={720}
      fps={24}
      width={1920}
      height={1080}
      defaultProps={{
        text: {
          "title": "THE COLORS OF COURAGE",
          "rani": [
            "RANI LAKSHMIBAI",
            "— 1857 —"
          ],
          "bhagat": [
            "BHAGAT SINGH",
            "THE REVOLUTIONARY SPIRIT"
          ],
          "gandhi": [
            "MAHATMA GANDHI",
            "THE POWER OF PEACE"
          ],
          "netaji": [
            "NETAJI",
            "SUBHAS CHANDRA BOSE"
          ],
          "medallions": [
            "RANI LAKSHMIBAI",
            "BHAGAT SINGH",
            "MAHATMA GANDHI",
            "NETAJI SUBHAS\nCHANDRA BOSE"
          ],
          "date": "15 AUGUST 1947",
          "finalTitle": "THEIR COURAGE. OUR FREEDOM.",
          "finalLine": "A TRIBUTE TO INDIA'S FREEDOM FIGHTERS"
        },
        music: true,
        musicVolume: 0.8,
        voiceoverVolume: 1,
      }}
    />
  </>
);
