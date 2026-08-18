import WasmImageProcessor from "@components/WasmImageProcessor";
import Hero from "@components/Hero";
import GlassCard from "@components/GlassCard";
import Tooltip from "@components/Tooltip";
import styles from "./Home.module.css";
import HomeHelmet from "./HomeHelmet";

import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect } from "react";

const TOUR_KEY = "img2num-onboarding-tour";

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

export function createTour() {
  let isNavigating = false;

  const driverObj = driver({
    advanceOnClick: true,
    showProgress: true,
    steps: [
      { popover: { 
          title: 'Welcome to the tutorial!', 
          description: 'Click next to continue or X to skip.'
        },
      },

      { element: '#step-one', 
        popover: { 
          title: 'Uploading an Image', 
          description: 'Drag and drop an image or click the page to upload a file. <br>Supported image formats: .jpg, .png, .bmp <br>Processing works entirely in the browser.', 
          showButtons: ["next", "close"]
        }
      },

      { element: "#okButton", 
        popover: { 
          title: 'Confirm Upload', 
          description: "Click here to submit your image."
        }, 
          waitForElement: 10000
      },
    ],
  });

  return driverObj;
};

export default Home;
