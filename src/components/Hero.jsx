import styles from './Hero.module.css';
import GlassCard from '@components/GlassCard';

const Hero = () => (
	<GlassCard className="text-center">
		<h1>Img2Num</h1>
		<p className={styles.heroParagraph}>Convert images of numbers into actual digits instantly in your browser!</p>
	</GlassCard>
);

export default Hero;
