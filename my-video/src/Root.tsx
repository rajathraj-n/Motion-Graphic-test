import {Composition} from 'remotion';
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
		</>
	);
};
