import React from 'react';
import {Audio} from '@remotion/media';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {staticFile, Track} from 'remotion';
import {circleReveal} from './CircleReveal';
import {FinaleScene} from './scenes/FinaleScene';
import {GirScene} from './scenes/GirScene';
import {HimalayaScene} from './scenes/HimalayaScene';
import {JungleScene} from './scenes/JungleScene';
import {MapScene} from './scenes/MapScene';
import {WetlandScene} from './scenes/WetlandScene';

export type WildIndiaProps = {
	/** Optional narration file in public/, e.g. "voiceover.mp3". Leave empty for none. */
	readonly voiceover: string;
};

/*
 * Timeline (30 fps, 720 frames = 24 s). Six scenes joined by 12-frame circle
 * reveals, so each cut lands on a 4-second mark from the script:
 * 0-4 map, 4-8 tiger & elephant, 8-12 rhino, 12-16 lion, 16-20 snow leopard, 20-24 peacock & title.
 */
export const WildIndia: React.FC<WildIndiaProps> = ({voiceover}) => {
	const sfx = (name: string) => staticFile(`sfx/${name}.wav`);
	return (
		<>
			<TransitionSeries name="Scenes">
				<TransitionSeries.Sequence name="Map of India" durationInFrames={126}>
					<MapScene />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={circleReveal()} timing={linearTiming({durationInFrames: 12})} />
				<TransitionSeries.Sequence name="Tiger & elephant" durationInFrames={132}>
					<JungleScene />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={circleReveal()} timing={linearTiming({durationInFrames: 12})} />
				<TransitionSeries.Sequence name="Rhino in Assam" durationInFrames={132}>
					<WetlandScene />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={circleReveal()} timing={linearTiming({durationInFrames: 12})} />
				<TransitionSeries.Sequence name="Lion of Gir" durationInFrames={132}>
					<GirScene />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={circleReveal()} timing={linearTiming({durationInFrames: 12})} />
				<TransitionSeries.Sequence name="Snow leopard" durationInFrames={132}>
					<HimalayaScene />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={circleReveal()} timing={linearTiming({durationInFrames: 12})} />
				<TransitionSeries.Sequence name="Peacock & title" durationInFrames={126}>
					<FinaleScene />
				</TransitionSeries.Sequence>
			</TransitionSeries>

			<Track name="Music">
				<Audio name="Background music" src={staticFile('music.wav')} volume={voiceover ? 0.32 : 0.6} />
			</Track>
			{voiceover ? (
				<Track name="Voiceover">
					<Audio name="Narration" src={staticFile(voiceover)} volume={1} />
				</Track>
			) : null}
			<Track name="Transition whooshes">
				<Audio name="Whoosh 1" src={sfx('whoosh')} from={106} volume={0.35} />
				<Audio name="Whoosh 2" src={sfx('whoosh')} from={226} volume={0.35} />
				<Audio name="Whoosh 3" src={sfx('whoosh')} from={346} volume={0.35} />
				<Audio name="Whoosh 4" src={sfx('whoosh')} from={466} volume={0.35} />
				<Audio name="Whoosh 5" src={sfx('whoosh')} from={586} volume={0.35} />
			</Track>
			<Track name="Pops">
				<Audio name="Map pop" src={sfx('pop')} from={2} volume={0.45} />
				<Audio name="Mountain pop" src={sfx('pop')} from={18} volume={0.3} />
				<Audio name="Tree pop 1" src={sfx('pop')} from={28} volume={0.3} />
				<Audio name="Tree pop 2" src={sfx('pop')} from={38} volume={0.3} />
				<Audio name="Tree pop 3" src={sfx('pop')} from={48} volume={0.3} />
				<Audio name="Badge pop 1" src={sfx('pop')} from={654} volume={0.3} />
				<Audio name="Badge pop 2" src={sfx('pop')} from={660} volume={0.3} />
				<Audio name="Badge pop 3" src={sfx('pop')} from={666} volume={0.3} />
			</Track>
			<Track name="Animal sounds">
				<Audio name="Tiger growl" src={sfx('growl')} from={150} volume={0.4} />
				<Audio name="Elephant trumpet" src={sfx('trumpet')} from={212} volume={0.35} />
				<Audio name="Rhino footsteps" src={sfx('footsteps')} from={244} volume={0.4} />
				<Audio name="Grass swoosh" src={sfx('swoosh')} from={296} volume={0.25} />
				<Audio name="Lion roar" src={sfx('roar')} from={404} volume={0.5} />
				<Audio name="Rising notes" src={sfx('rising')} from={510} volume={0.3} />
				<Audio name="Peacock sparkle" src={sfx('sparkle')} from={604} volume={0.3} />
			</Track>
			<Track name="Accents">
				<Audio name="Drum accent" src={sfx('drum')} from={398} volume={0.45} />
				<Audio name="Mountain wind" src={sfx('wind')} from={474} volume={0.3} />
				<Audio name="Title sparkle" src={sfx('sparkle')} from={672} volume={0.3} />
			</Track>
		</>
	);
};
