import React from 'react';
import {Audio} from '@remotion/media';
import {Sequence, staticFile, Track} from 'remotion';
import {S1Hook} from './scenes/S1Hook';
import {S2Discover} from './scenes/S2Discover';
import {S3Wishlist} from './scenes/S3Wishlist';
import {S4Library} from './scenes/S4Library';
import {S5Friends} from './scenes/S5Friends';
import {S6Brand} from './scenes/S6Brand';

export type SteamDemoProps = {
	/** Optional narration file in public/, e.g. "steam/voiceover.mp3". */
	readonly voiceover: string;
	/** Optional official logo file in public/, e.g. "steam/logo.png". Empty shows a text logo. */
	readonly logo: string;
	/** Show the voiceover lines as subtitles. */
	readonly subtitles: boolean;
};

/*
 * 30 fps, 720 frames = 24 s. Six 4-second scenes. Each scene ends with its own
 * transition move (push-in, card expand, thumbnail fly, circular wipe, collapse),
 * and the next scene starts from that state.
 */
export const SteamDemo: React.FC<SteamDemoProps> = ({voiceover, logo, subtitles}) => {
	const logoSrc = logo ? staticFile(logo) : undefined;
	const sfx = (name: string) => staticFile(`steam/sfx/${name}.wav`);
	const scene = {subtitles, logoSrc};
	return (
		<>
			<Track name="Scenes">
				<Sequence name="01 Hook" durationInFrames={120}>
					<S1Hook {...scene} />
				</Sequence>
				<Sequence name="02 Discover games" from={120} durationInFrames={120}>
					<S2Discover {...scene} />
				</Sequence>
				<Sequence name="03 Explore & wishlist" from={240} durationInFrames={120}>
					<S3Wishlist {...scene} />
				</Sequence>
				<Sequence name="04 Game library" from={360} durationInFrames={120}>
					<S4Library {...scene} />
				</Sequence>
				<Sequence name="05 Friends & achievements" from={480} durationInFrames={120}>
					<S5Friends {...scene} />
				</Sequence>
				<Sequence name="06 Brand reveal" from={600} durationInFrames={120}>
					<S6Brand {...scene} />
				</Sequence>
			</Track>

			<Track name="Music">
				<Audio name="Soundtrack" src={staticFile('steam/music.wav')} volume={voiceover ? 0.35 : 0.65} />
			</Track>
			{voiceover ? (
				<Track name="Voiceover">
					<Audio name="Narration" src={staticFile(voiceover)} />
				</Track>
			) : null}
			<Track name="Whooshes">
				<Audio name="Line whoosh" src={sfx('whoosh')} from={6} volume={0.3} />
				<Audio name="Push-in whoosh" src={sfx('whoosh')} from={100} volume={0.4} />
				<Audio name="Card expand whoosh" src={sfx('whoosh')} from={216} volume={0.35} />
				<Audio name="Thumbnail whoosh" src={sfx('whoosh')} from={340} volume={0.3} />
				<Audio name="Collapse whoosh" src={sfx('whoosh')} from={580} volume={0.35} />
				<Audio name="Assemble whoosh" src={sfx('whoosh')} from={600} volume={0.35} />
			</Track>
			<Track name="UI clicks">
				<Audio name="Hover" src={sfx('hover')} from={192} volume={0.5} />
				<Audio name="Card click" src={sfx('click')} from={212} volume={0.5} />
				<Audio name="Wishlist click" src={sfx('click')} from={296} volume={0.5} />
				<Audio name="Play click" src={sfx('click')} from={458} volume={0.5} />
				<Audio name="Play punch" src={sfx('punch')} from={461} volume={0.45} />
			</Track>
			<Track name="Accents">
				<Audio name="Sale bass accent" src={sfx('bass')} from={266} volume={0.4} />
				<Audio name="Wishlist chime" src={sfx('chime')} from={298} volume={0.4} />
				<Audio name="Library sweep" src={sfx('sweep')} from={360} volume={0.3} />
				<Audio name="Download complete" src={sfx('complete')} from={438} volume={0.4} />
				<Audio name="Achievement chime" src={sfx('achievement')} from={540} volume={0.45} />
			</Track>
			<Track name="Risers">
				<Audio name="Synth rise" src={sfx('rise')} from={556} volume={0.25} />
			</Track>
		</>
	);
};
