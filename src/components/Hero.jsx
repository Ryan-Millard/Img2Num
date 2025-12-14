import styles from './Hero.module.css';
import GlassCard from '@components/GlassCard';

const Hero = ({ header, description }) => (
  <GlassCard className={styles.heroContainer}>
    <h1>{header}</h1>
    <p className={styles.heroParagraph}>{description}</p>
  </GlassCard>
);

export default Hero;
