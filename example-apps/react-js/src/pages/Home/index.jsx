import WasmImageProcessor from "@components/WasmImageProcessor";
import Hero from "@components/Hero";
import GlassCard from "@components/GlassCard";
import Tooltip from "@components/Tooltip";
import styles from "./Home.module.css";
import HomeHelmet from "./HomeHelmet";
import { useEffect } from "react";
import { createTour } from "@utils/onboardingTour"

{/* Onboarding tour initialized */}
const tour = createTour();
tour.drive();

const Home = () => (
  <>
    <HomeHelmet />

    <div className="flex-column gap-md">
      <Hero header="Img2Num" description="Upload an image to convert it into a color-by-number template to color in directly in your browser!" />

      <div id="step-one">
        <WasmImageProcessor />
      </div>
      

      <div className={styles.featureContainer}>
        <GlassCard>
          <Tooltip content="Performance feature" position="top">
            <h3>⚡ Fast & Lightweight</h3>
          </Tooltip>
          <p>Compiled C++ runs in your browser via WebAssembly with near-native speed.</p>
        </GlassCard>

        <GlassCard>
          <Tooltip content="Integration feature" position="top">
            <h3>🛠️ Easy to Integrate</h3>
          </Tooltip>
          <p>Minimal dependencies, works with any project or workflow.</p>
        </GlassCard>
      </div>
    </div>
  </>
);

export default Home;
