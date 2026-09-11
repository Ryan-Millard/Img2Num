import styles from "./Hero.module.css";
import GlassCard from "@components/GlassCard";
import { TourButton } from "@components/OnboardingTour";
import Tooltip from "./Tooltip";

const Hero = ({ header, description, button }) => (
  <GlassCard className="text-center">
    <h1>{header}</h1>
    <p className={styles.heroParagraph}>{description}</p>
    <TourButton />
    
  </GlassCard>
);

export default Hero;
