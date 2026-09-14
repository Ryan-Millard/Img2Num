import styles from "./Hero.module.css";
import GlassCard from "@components/GlassCard";
import { TourButton } from "@components/OnboardingTour";
import { useLocation } from "react-router-dom";

const Hero = ({ header, description }) => {
  const { pathname } = useLocation();

  return (
    <GlassCard className="text-center">
      <h1>{header}</h1>
      <p className={styles.heroParagraph}>{description}</p>
      {pathname === "/" && <TourButton />}
    </GlassCard>
  );
};

export default Hero;
