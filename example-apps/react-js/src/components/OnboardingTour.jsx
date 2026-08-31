import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "@global-styles/driverjs-theme.css";
import { useState, useEffect } from "react";
import LoadingHedgehog from "./LoadingHedgehog";
import Tooltip from "./Tooltip";

export const TOUR_KEY = "img2num-onboarding-tour";

export function hasCompletedTour() {
  return localStorage.getItem(TOUR_KEY) === 'true';
}

export function createTour() {

  const tips = [
    "Img2Num is primarily written in C++.",
    "The browser version runs through WebAssembly.",
    "GPU acceleration is provided through WebGPU when available.",
    "CPU fallback implementations are available for unsupported devices.",
    "Processing occurs locally on the user's device.",
    "No images are uploaded to external servers.",
    "The project is open source.",
    "SVG output can be edited after generation."
  ];

  function getRandomTip() {
    return tips[Math.floor(Math.random() * tips.length)];
  }

  const driverObj = driver({
    popoverClass: 'driverjs-theme',
    steps: [
      { popover: { 
          title: 'Welcome to Img2Num!', 
          description: `
          <p>Click \"Next\" to follow the tutorial or \"x\" to skip.<p>
          `
        },
      },

      /* Uploading an Image */
      { element: '#step-one',
        advanceOnClick: true,
        popover: { 
          title: 'Uploading an Image', 
          description: `
          Drag and drop an image here or click the page to upload a file.
          <br>Note: Processing works entirely in the browser.
          <br><b>Upload an image to proceed to the next step.</b>
          `,
          side: "left",
          align: "start",
        },
      },

      /* Image Processing Configuration */
      { element: '#settingsToggleButton',
        popover: {
          title: 'Image Processing Configuration',
          description: `
          This settings button opens the menu to adjust the output's:
          <ul>
            <li>output quality</li>
            <li>complexity</li>
            <li>performance</li>
          </ul>
          <br><b>Click on the settings button to proceed to the next step.</b>
          `,
          showButtons: ["previous"],
        },
        
        waitForElement: 50000,
        onHighlighted: (element) => {
          element.addEventListener('click', () => {
            driverObj.moveNext();
          }, { once:true });
        },
      },

      { element: '#configNotes',
        popover: {
          title: 'Image Processing Configuration',
          description: `

          K-means groups pixels into k clusters based on color distance in the chosen color space.
          <ul>
            <li>Adjust k to determine how many colors the output should contain.</li>
            <li>Note: k cannot force new colors and will max out at the amount of colors it has.</li>
            <li>Tip: Larger images benefit from more colors but too many will produce noisy contours.'</li>
          </ul>
          <br><b>Click "Next" to proceed.</b>
          `,
        },
      },

      { element: '#advancedToggle',
        popover: {
          title: 'Advanced Settings',
          description: `
          For more experienced users, adjust advanced settings here.
          <br>For this tutorial, the settings are already set.
          <br><b>Click "Next" to proceed.</b>
          `,
        },
      },      
      
      /* Start Processing */
      { element: '#okButton',
        popover: { 
          title: 'Confirm Upload', 
          description:`
          'Click here to submit your image and start converting. Processing time depends on:
          <ul>
            <li>image size</li>
            <li>selected settings</li>
            <li>device performance</li>
            <li>browser capabilities</li>
          </ul>
          <br><b>Click the "OK" button to proceed to the next step.</b>
          `,
          showButtons: ["previous"],
        },
        onHighlighted: (element) => {
          element.addEventListener('click', () => {
            driverObj.moveNext();
          }, { once:true });
        },
        
      },

      /* Processing Information */
      {
        popover: {
          title: 'Tip',
          description: getRandomTip()
        },
      },

      /* Editor Tour */

      /* Coloring Areas */
      {
        element: '#svgCanvas',
        popover: {
          title: 'Coloring Canvas',
          description:`
          Now, you can color your SVG!
          <ul>
            <li>The original colors of your image will be filled into corresponding shapes.</li>
            <li>To fill a region, simply click on it.</li>
            <li>To zoom in or out for a better coloring experience, use the scroll of your mouse.</li>
            <li>To move around the canvas, hold left click and drag.</li>
          </ul>
          <br><b>Click "Next" to proceed to the next step.</b>
          `
        }
      },

      /* Navigation Controls */

      /* Reprocessing the Image */
      {
        element: '#adjustSettingsButton',
        popover: {
          title: 'Adjust and Reprocess Image',
          description: `
          Settings for the output can be adjusted after processing including:
          <ul>
            <li>K-means</li>
            <li>outline details</li>
            <li>advanced settings</li>
          </ul>
          Intermediate pipeline stages are cached where possible meaning reprocessing may be significantly faster.
          <br><b>Click "Next" to proceed.</b>
          `,
        }
      },

      /* Fullscreen Mode */
      {
        element: '#fullscreenButton',
        popover: {
          title: 'Fullscreen',
          description:`
          Click here to enter fullscreen mode.
          <ul>
            <li>Coloring may be easier with a larger view.</li>
            <li>Press [Esc] to exit fullscreen</li>
          </ul>
          <b>Click "Next" to proceed.</b>
          `,
        }
      },

      /* Exporting Results */
      {
        element: '#exportButton',
        advanceOnClick: true,
        popover: {
          title: 'Save and Export',
          description: `
          Here you can view the save settings to download your generated SVG in various formats.
          <br><b>Click the "Save" button to proceed to the next step.</b>
          `,
          showButtons: ["previous"],
        },
        
      },

      {
        element: '#exportViewer',
        popover: {
          title: 'Save and Export',
          description:`
          Select any format to save your output
          <br>Tip: Saving as SVG allows for infinite scaling, vector editing, printing, and use in design software.
          <br><b>Click "Next" to proceed.</b>
          `,
        },
        waitForElement: 5000,
      },

      {
        element: '#save-image-close',
        advanceOnClick: true,
        popover: {
          title: 'Exit the Export window',
          description: `
          <b>Click X to return to the editor.</b>`,
          showButtons: ["previous"],
        },
        
      },
      
      /* Additonal Editor Features */
      {
        element: '#redoButton',
        popover: {
          title: 'Redo',
          description: `
          This button will redo your last change.
          <br>Shortcut: Ctrl + Y
          <br><b>Click "Next" to proceed.</b>
          `,
        },
        waitForElement: 5000,
      },

      {
        element: '#undoButton',
        popover: {
          title: 'Undo',
          description: `
          The button will undo your last change.
          <br>Shortcut: Ctrl + Z
          <br><b>Click "Next" to proceed.</b>
          `,
        }
      },

      {
        element: '#resetButton',
        popover: {
          title: 'Reset',
          description: `
          This button resets all colored regions.
          <br><b>Click "Next" to proceed.</b>
          `,
        }
      },
      
      {
        popover: { 
          title: 'Tutorial Complete!',
          description: `
          You have now completed the Img2Num raster to SVG tutorial. Happy coloring!
          <br><br>Tip: If you want to run the tutorial again, click "Run Interactive Tour" on the Home page.
          `,
        },
      }
    ],
    onDestroyed: () => {
      localStorage.setItem(TOUR_KEY, "true");
    },
  });

  return driverObj;
};

export function TourButton() {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!hasCompletedTour()) {
      setShowHint(true);
    }
  }, []);

  const handleClick = () => {
    setShowHint(false);
    createTour().drive();
  };

  return (
    <div>
      <Tooltip content="Start tutorial">
        {showHint && (
          <div class="tour-hint-popup">
            Need help? Start here:
          </div>
        )}
        <button class="button" onClick={handleClick}>
          Run Interactive Tour
        </button>
        
      </Tooltip>
    </div>
  )
}