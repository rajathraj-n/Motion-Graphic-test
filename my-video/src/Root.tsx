import {Composition} from 'remotion';
import {SteamGlass} from './glass/SteamGlass';
import {SteamDemo} from './steam/SteamDemo';
import {WildIndia} from './WildIndia';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="WildIndia"
				component={WildIndia}
				durationInFrames={720}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{voiceover: ''}}
			/>
			<Composition
				id="SteamDemo"
				component={SteamDemo}
				durationInFrames={720}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{voiceover: '', logo: '', subtitles: true}}
			/>
			<Composition
				id="SteamGlass"
				component={SteamGlass}
				durationInFrames={720}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{voiceover: '', logo: '', subtitles: true}}
			/>
		</>
	);
};
