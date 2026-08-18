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
          showButtons: ["close"],
          onNextClick: () => {
            driverObj.moveNext();
          },
        },
      },

      // TO-DO: Fix lightbox after button is clicked, suggest looking into tooltip interactions with driver.js
      { element: '#settingsToggleButton',
        popover: {
          title: 'Image Processing Configuration',
          description: 'Click here to adjust output quality, complexity, and performance of the output.',
          showButtons: ["next", "close"],
          onDeselected: () => {
          // .. remove element
          document.querySelector("#settingsToggleButton")?.remove();
          },
        },
        waitForElement: 5000,
        
      },

      { element: '#configNotes',
        popover: {
          title: 'Image Processing Configuration',
          description: 'K-means groups pixels into k clusters based on color distance in the chosen color space.<br>Adjust k to determine how many colors the output should contain.<br>Note: k cannot force new colors and will max out at the amount of colors it has.<br>Tip: Larger images benefit from more colors but too many will produce noisy contours.'
        },
      },

      // TO-DO: Figure out what to do with lightbox if user clicks on advanced settings -> if they dont just click next
      { element: '#advancedToggle',
        popover: {
          title: 'Advanced Settings',
          description: 'For more experienced users, adjust advanced settings here.'
        },
      },      
      
      // TO-DO: Fix lightbox after upload is clicked, same tooltip issue
      { element: '#okButton', 
        popover: { 
          title: 'Confirm Upload', 
          description: 'Click here to submit your image.<br> Processing depends on image size, selected settings, device performance, and browser capabilities.'
        },
      },

      // TO-DO: Figure out rotating tip popup during loading screen
      { element: '#loading',
        popover: {
          title: 'Tip',
          description: 'Add tips here'
        },
      },
      
      {
        popover: { 
          title: 'Tutorial Complete!',
          description: 'You have now completed the Img2Num raster to SVG tutorial. Happy converting!'
        },
        waitForElement: 10000,
      }
    ],
  });

  return driverObj;
};

export default Home;
