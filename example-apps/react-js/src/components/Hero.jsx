import styles from "./Hero.module.css";
import GlassCard from "@components/GlassCard";
import { TourButton } from "./onboardingTour";

const Hero = ({ header, description, button }) => (
  <GlassCard className="text-center">
    <h1>{header}</h1>
    <p className={styles.heroParagraph}>{description}</p>
    <TourButton className="button" label={button} />
  </GlassCard>
);

export default Hero;
