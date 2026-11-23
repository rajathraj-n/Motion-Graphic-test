import React from 'react';
import {Audio} from '@remotion/media';
import {Sequence, staticFile, Track} from 'remotion';
import {G1Reveal} from './scenes/G1Reveal';
import {G2Discover} from './scenes/G2Discover';
import {G3Wishlist} from './scenes/G3Wishlist';
import {G4Library} from './scenes/G4Library';
import {G5Community} from './scenes/G5Community';
import {G6Logo} from './scenes/G6Logo';

export type SteamGlassProps = {
	/** Optional narration file in public/, e.g. "steam/voiceover.mp3". */
	readonly voiceover: string;
	/** Optional official logo file in public/, e.g. "steam/logo.png". Empty shows a text logo. */
	readonly logo: string;
	/** Show the voiceover lines as subtitles. */
	readonly subtitles: boolean;
};

/*
 * "The Future of Gaming, Beautifully Connected." 30 fps, 720 frames = 24 s.
 * Six 4-second scenes on a shared 3D glass stage. Each scene ends in the state
 * the next one starts from (push-through, card morph, cover fly, ring pass-through,
 * collapse to a line, line sweep).
 */
export const SteamGlass: React.FC<SteamGlassProps> = ({voiceover, logo, subtitles}) => {
	const logoSrc = logo ? staticFile(logo) : undefined;
	const sfx = (name: string) => staticFile(`steam/sfx/${name}.wav`);
	const scene = {subtitles, logoSrc};
	return (
		<>
			<Track name="Scenes">
				<Sequence name="01 Glass interface reveal" durationInFrames={120}>
					<G1Reveal {...scene} />
				</Sequence>
				<Sequence name="02 Floating discovery panels" from={120} durationInFrames={120}>
					<G2Discover {...scene} />
				</Sequence>
				<Sequence name="03 Glass wishlist" from={240} durationInFrames={120}>
					<G3Wishlist {...scene} />
				</Sequence>
				<Sequence name="04 Immersive library" from={360} durationInFrames={120}>
					<G4Library {...scene} />
				</Sequence>
				<Sequence name="05 Connected community" from={480} durationInFrames={120}>
					<G5Community {...scene} />
				</Sequence>
				<Sequence name="06 Logo reveal" from={600} durationInFrames={120}>
					<G6Logo {...scene} />
				</Sequence>
			</Track>

			<Track name="Music">
				<Audio name="Soundtrack" src={staticFile('steam/music.wav')} volume={voiceover ? 0.32 : 0.56} />
			</Track>
			{voiceover ? (
				<Track name="Voiceover">
					<Audio name="Narration" src={staticFile(voiceover)} />
				</Track>
			) : null}
			<Track name="Whooshes">
				<Audio name="Beam whoosh" src={sfx('whoosh')} from={2} volume={0.3} />
				<Audio name="Push-through whoosh" src={sfx('glass')} from={100} volume={0.4} />
				<Audio name="Pull-back whoosh" src={sfx('whoosh')} from={120} volume={0.25} />
				<Audio name="Morph glass whoosh" src={sfx('glass')} from={212} volume={0.4} />
				<Audio name="Library glide" src={sfx('whoosh')} from={360} volume={0.3} />
				<Audio name="Collapse glass sweep" src={sfx('glass')} from={578} volume={0.35} />
				<Audio name="Light sweep" src={sfx('sweep')} from={600} volume={0.3} />
			</Track>
			<Track name="Glass shimmer">
				<Audio name="Panels emerge shimmer" src={sfx('shimmer')} from={10} volume={0.35} />
				<Audio name="Reflection shimmer" src={sfx('shimmer')} from={70} volume={0.25} />
			</Track>
			<Track name="UI clicks">
				<Audio name="Category ACTION" src={sfx('hover')} from={154} volume={0.45} />
				<Audio name="Category RPG" src={sfx('hover')} from={166} volume={0.45} />
				<Audio name="Category STRATEGY" src={sfx('hover')} from={176} volume={0.45} />
				<Audio name="Select click" src={sfx('click')} from={182} volume={0.5} />
				<Audio name="Wishlist click" src={sfx('click')} from={312} volume={0.5} />
				<Audio name="Play hover" src={sfx('hover')} from={444} volume={0.45} />
				<Audio name="Play click" src={sfx('click')} from={450} volume={0.5} />
			</Track>
			<Track name="Accents">
				<Audio name="Price bass accent" src={sfx('bass')} from={274} volume={0.4} />
				<Audio name="Wishlist chime" src={sfx('chime')} from={313} volume={0.4} />
				<Audio name="Activation" src={sfx('activate')} from={451} volume={0.4} />
				<Audio name="Achievement chime" src={sfx('achievement')} from={530} volume={0.45} />
			</Track>
			<Track name="Impacts & risers">
				<Audio name="Electronic sweep" src={sfx('sweep')} from={340} volume={0.3} />
				<Audio name="Tight bass impact" src={sfx('punch')} from={450} volume={0.35} />
				<Audio name="Transition rise" src={sfx('rise')} from={466} volume={0.22} />
				<Audio name="Synth rise" src={sfx('rise')} from={556} volume={0.25} />
			</Track>
		</>
	);
};
