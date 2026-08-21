import styles from "./Hero.module.css";
import GlassCard from "@components/GlassCard";
import { useEffect } from "react";
import { createTour } from "@utils/onboardingTour"

{/* Onboarding tour initialized */}

const Hero = ({ header, description, button }) => (
  <GlassCard className="text-center">
    <h1>{header}</h1>
    <p className={styles.heroParagraph}>{description}</p>
    <button className={`button`} onClick={(e) => {
      const tour = createTour();
      tour.drive();}}>
      {button}
    </button>
  </GlassCard>
);

export default Hero;
