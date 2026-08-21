import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const TOUR_KEY = "img2num-onboarding-tour";

export function createTour() {
  let isNavigating = false;

  const driverObj = driver({
    showProgress: true,
    steps: [
      { popover: { 
          title: 'Welcome to Img2Num!', 
          description: 'Click \"Next\" to follow the tutorial or \"x\" to skip.'
        },
      },

      { element: '#step-one',
        advanceOnClick: true,
        popover: { 
          title: 'Uploading an Image', 
          description: 'Drag and drop an image or click the page to upload a file. <br>Supported image formats: .jpg, .png, .bmp <br>Processing works entirely in the browser.', 
        },
        showButtons: ["close"],
      },

      { element: '#settingsToggleButton',
        popover: {
          title: 'Image Processing Configuration',
          description: 'Click here to adjust output quality, complexity, and performance of the output.',
          showButtons: ["close"],
        },
        waitForElement: 5000,
        onHighlighted: (element) => {
          element.addEventListener('click', () => {
            driverObj.moveNext();
          }, { once:true });
        },
      },

      { element: '#configNotes',
        popover: {
          title: 'Image Processing Configuration',
          description: 'K-means groups pixels into k clusters based on color distance in the chosen color space.<br>Adjust k to determine how many colors the output should contain.<br>Note: k cannot force new colors and will max out at the amount of colors it has.<br>Tip: Larger images benefit from more colors but too many will produce noisy contours.'
        },
      },

      { element: '#advancedToggle',
        popover: {
          title: 'Advanced Settings',
          description: 'For more experienced users, adjust advanced settings here.'
        },
      },      
      
      { element: '#okButton',
        popover: { 
          title: 'Confirm Upload', 
          description: 'Click here to submit your image.<br> Processing depends on image size, selected settings, device performance, and browser capabilities.'
        },
        onHighlighted: (element) => {
          element.addEventListener('click', () => {
            driverObj.moveNext();
          }, { once:true });
        },
      },

      // TO-DO: Figure out rotating tip popup during loading screen
      {
        popover: {
          title: 'Tip',
          description: 'Add tips here'
        },
      },
      
      {
        popover: { 
          title: 'Tutorial Complete!',
          description: 'You have now completed the Img2Num raster to SVG tutorial. Happy coloring!'
        },
        waitForElement: 10000,
      }
    ],
    onDestroyed: () => {
      if (!isNavigating) {
        localStorage.removeItem(TOUR_KEY);
      }
    },
  });

  return driverObj;
};