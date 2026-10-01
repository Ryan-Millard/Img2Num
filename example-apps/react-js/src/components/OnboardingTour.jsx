import { driver } from "driver.js";
import "@global-styles/driverjs-theme.css";
import { useState, useEffect } from "react";
import Tooltip from "./Tooltip";

export const TOUR_KEY = "img2num-onboarding-tour";

/**
 * Integration events.
 *
 * WasmImageProcessor dispatches:
 *   TOUR_EVENTS.imageLoaded   -> a file was accepted (drop, picker, or paste)
 *   TOUR_EVENTS.imageCleared  -> image cleared / back to the dropzone
 * and listens for:
 *   TOUR_EVENTS.requestReset  -> tour asks the app to clear the current image
 *
 * The EDITOR page dispatches (in a mount effect, once #svgCanvas exists):
 *   TOUR_EVENTS.processingComplete
 */
export const TOUR_EVENTS = {
  imageLoaded: "img2num:image-loaded",
  processingComplete: "img2num:processing-complete",
  imageCleared: "img2num:image-cleared",
  requestReset: "img2num:request-reset",
};

// Read the truth from the DOM instead of tracking it in a module variable:
// WasmImageProcessor already exposes data-image-loaded on its root card, so
// this can never go stale across remounts, route changes, or paste-uploads.
export const isImageLoaded = () => typeof document !== "undefined" && !!document.querySelector('[data-image-loaded="true"]');

// localStorage can throw (private browsing, blocked storage) -- never let the
// tour crash the page over it.
export function hasCompletedTour() {
  try {
    return localStorage.getItem(TOUR_KEY) === "true";
  } catch {
    return true; // if we can't persist, don't nag either
  }
}

function markTourCompleted() {
  try {
    localStorage.setItem(TOUR_KEY, "true");
  } catch {
    /* non-fatal */
  }
}

const TIPS = [
  "Img2Num is primarily written in C++.",
  "The browser version runs through WebAssembly.",
  "GPU acceleration is provided through WebGPU when available.",
  "CPU fallback implementations are available for unsupported devices.",
  "Processing occurs locally on your device.",
  "No images are uploaded to external servers.",
  "The project is open source.",
  "SVG output can be edited after generation.",
];

const getRandomTip = () => TIPS[Math.floor(Math.random() * TIPS.length)];

/**
 * Creates the onboarding tour.
 *
 * @param {Object}  options
 * @param {boolean} options.hasImage  When true, the welcome + upload steps are
 *                                    skipped and the tour continues from the
 *                                    configuration steps (the image preview is
 *                                    already on screen).
 */
export function createTour({ hasImage = false } = {}) {
  let driverObj;

  // Every listener the tour attaches registers a cleanup here, and all of
  // them run in onDestroyed -- closing the tour mid-way can never leave a
  // stray listener behind.
  const cleanups = new Set();
  const runAllCleanups = () => {
    for (const fn of [...cleanups]) fn();
  };

  // Advance when the highlighted element itself is clicked.
  const advanceOnTargetClick = () => {
    let cleanup = null;
    return {
      onHighlighted: (el) => {
        if (!el) return;
        const handler = () => driverObj.moveNext();
        el.addEventListener("click", handler);
        cleanup = () => {
          el.removeEventListener("click", handler);
          cleanups.delete(cleanup);
          cleanup = null;
        };
        cleanups.add(cleanup);
      },
      onDeselected: () => cleanup?.(),
    };
  };

  // Advance when the APP says something happened. This is how the tour
  // waits for the user: it does nothing until the event is dispatched.
  const advanceOnEvent = (eventName) => {
    let cleanup = null;
    return {
      onHighlightStarted: () => {
        const handler = () => driverObj.moveNext();
        window.addEventListener(eventName, handler);
        cleanup = () => {
          window.removeEventListener(eventName, handler);
          cleanups.delete(cleanup);
          cleanup = null;
        };
        cleanups.add(cleanup);
      },
      onDeselected: () => cleanup?.(),
    };
  };

  /* ------------------------------ Steps ---------------------------------- */

  const welcomeStep = {
    popover: {
      title: "Welcome to Img2Num!",
      description: `<p>Click "Next" to follow the tutorial or "x" to skip.</p>`,
    },
  };

  // Only shown when starting with an image already loaded: the dropzone is
  // gone, so the tour picks up from configuration instead of asking for an
  // upload that can't happen.
  const hasImageIntro = {
    popover: {
      title: "Welcome to Img2Num!",
      description: `
        <p>You already have an image loaded, so the tour will continue from the configuration steps.</p>
        <p>Click "Next" to follow the tutorial or "x" to skip.</p>
      `,
    },
  };

  const uploadStep = {
    element: "#step-one",
    popover: {
      title: "Uploading an Image",
      description: `
        Drag and drop an image here, or click to choose a file.
        <br><b>The tour will continue automatically once your image is loaded.</b>
      `,
      side: "left",
      align: "center",
      showButtons: ["close"], // no Next: the image-loaded event advances
    },
    ...advanceOnEvent(TOUR_EVENTS.imageLoaded),
  };

  // Everything between "an image is loaded" and "processing is done".
  const configSteps = [
    {
      element: "#settingsToggleButton",
      popover: {
        title: "Image Processing Configuration",
        description: `
          This settings button opens the menu to adjust the output's:
          <ul>
            <li>output quality</li>
            <li>complexity</li>
            <li>performance</li>
          </ul>
        `,
        showButtons: ["close"],
      },
      ...advanceOnTargetClick(),
    },

    {
      element: "#configNotes",
      popover: {
        title: "Image Processing Configuration",
        description: `
          K-means groups pixels into k clusters based on color distance in the chosen color space.
          <ul>
            <li>Adjust k to determine how many colors the output should contain.</li>
            <li>Note: k cannot force new colors and will max out at the amount of colors the image has.</li>
            <li>Tip: Larger images benefit from more colors, but too many will produce noisy contours.</li>
          </ul>
        `,
        showButtons: ["next"],
      },
    },

    {
      element: "#advancedToggle",
      popover: {
        title: "Advanced Settings",
        description: `
          For more experienced users, adjust advanced settings here.
          <br>For this tutorial, the settings are already set.
          <br><b>Click "Next" to proceed.</b>
        `,
        side: "left",
        align: "center",
      },
    },

    {
      element: "#okButton",
      popover: {
        title: "Confirm Upload",
        description: `
          Click the "OK" button to submit your image and start converting.
          Processing times depend on:
          <ul>
            <li>image size</li>
            <li>selected settings</li>
            <li>device performance</li>
            <li>browser capabilities</li>
          </ul>
        `,
        showButtons: ["previous", "close"],
      },
      ...advanceOnTargetClick(),
    },

    // Shown WHILE processing runs. The editor page dispatches
    // processingComplete from a mount effect, so by the time this advances,
    // the /editor route has rendered and #svgCanvas exists.
    {
      popover: {
        title: "Processing your image...",
        description: `
          <p>While you wait, a tip:</p>
          <p>${getRandomTip()}</p>
          <p><b>The tour will continue automatically when processing finishes.</b></p>
        `,
        showButtons: ["close"],
      },
      ...advanceOnEvent(TOUR_EVENTS.processingComplete),
    },
  ];

  const editorSteps = [
    {
      element: "#svgCanvas",
      popover: {
        title: "Coloring Canvas",
        description: `Now, you can color in your image!
          <ul>
            <li>The original colors of your image will be filled into corresponding shapes.</li>
            <li>To fill a region, simply click on it.</li>
            <li>To zoom in or out for a better coloring experience.</li>
            <li>To move around the canvas, hold left click and drag.</li>
          </ul>`,
        showButtons: ["next"],
      },
    },

    {
      element: "#editorControls_colorPreviewModeSwitch",
      popover: {
        title: "Switch between coloring-in and preview mode",
        description: "Flip the switch to see what the image will look like once you've finished coloring it in.",
        showButtons: ["previous", "close"],
      },
      ...advanceOnTargetClick(),
    },

    {
      element: "#editorControls_colorPreviewModeSwitch",
      popover: {
        title: "Switch between coloring-in and preview mode",
        description: "Flip the switch to return to coloring-in mode.",
        showButtons: ["close"],
      },
      ...advanceOnTargetClick(),
    },

    {
      element: "#adjustSettingsButton",
      popover: {
        title: "Adjust and Reprocess Image",
        description: `Settings for the output can be adjusted after processing, including:
          <ul>
            <li>K-means</li>
            <li>outline details</li>
            <li>advanced settings</li>
          </ul>
          Intermediate pipeline stages are cached where possible, meaning reprocessing may be significantly faster.`,
        showButtons: ["previous", "close"],
      },
      ...advanceOnTargetClick(),
    },

    {
      element: "#configNotes",
      popover: {
        title: "Image Processing Configuration",
        description: `You can edit the image and re-run the processing here.`,
        showButtons: ["next"],
      },
    },

    {
      element: "#configPanel_closeButton",
      popover: {
        title: "Close the Configuration Panel",
        showButtons: ["previous", "close"],
      },
      ...advanceOnTargetClick(),
    },

    {
      element: "#fullscreenButton",
      popover: {
        title: "Fullscreen",
        description: "Click here to enter fullscreen mode.",
      },
    },

    {
      element: "#exportButton",
      popover: {
        title: "Save and Export",
        description: "Here you can view the save settings to download your generated SVG in various formats.",
        showButtons: ["previous"],
      },
      ...advanceOnTargetClick(),
    },

    {
      element: "#exportViewer",
      popover: {
        title: "Save and Export",
        description: `Select any format to save your output.

          Tip: Saving as SVG allows for infinite scaling, vector editing, printing, and use in design software.`,
      },
    },

    {
      element: "#save-image-close",
      popover: {
        title: "Exit the Export Window",
        description: `<b>Click X to return to the editor.</b>`,
        showButtons: ["previous", "close"],
      },
      ...advanceOnTargetClick(),
    },

    /* Additional editor features */
    {
      element: "#redoButton",
      popover: {
        title: "Redo",
        description: `
          This button will redo your last change.
          <br>Shortcut: Ctrl + Y
          <br><b>Click "Next" to proceed.</b>
        `,
      },
    },

    {
      element: "#undoButton",
      popover: {
        title: "Undo",
        description: `
          This button will undo your last change.
          <br>Shortcut: Ctrl + Z
          <br><b>Click "Next" to proceed.</b>
        `,
      },
    },

    {
      element: "#resetButton",
      popover: {
        title: "Reset",
        description: `
          This button resets all colored regions.
          <br><b>Click "Next" to proceed.</b>
        `,
      },
    },

    {
      popover: {
        title: "Tutorial Complete!",
        description: `
          You have now completed the Img2Num raster to SVG tutorial. Happy coloring!
          <br><br>Tip: If you want to run the tutorial again, click "Run Interactive Tour" on the Home page.
        `,
      },
    },
  ];

  // Both variants live on the Home page and cross into /editor after
  // processing. The hasImage variant only skips what can't happen (the
  // upload) -- it does NOT jump to editor steps, because on the Home page
  // none of the editor elements exist yet.
  const steps = hasImage ? [hasImageIntro, ...configSteps, ...editorSteps] : [welcomeStep, uploadStep, ...configSteps, ...editorSteps];

  driverObj = driver({
    popoverClass: "driverjs-theme",
    steps,
    onDestroyed: () => {
      runAllCleanups();
      markTourCompleted();
    },
  });

  return driverObj;
}

export function TourButton() {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!hasCompletedTour()) {
      setShowHint(true);
    }
  }, []);

  const handleClick = () => {
    setShowHint(false);

    if (isImageLoaded()) {
      // Ask the app to clear the current image so the full tour can run
      // from the upload step.
      window.dispatchEvent(new Event(TOUR_EVENTS.requestReset));
    }

    // Give React a frame to re-render the dropzone after the reset. If the
    // reset didn't happen for any reason, isImageLoaded() is still true and
    // we run the continue-from-configuration variant instead of pointing at
    // a dropzone that isn't there.
    requestAnimationFrame(() => {
      createTour({ hasImage: isImageLoaded() }).drive();
    });
  };

  return (
    <Tooltip content="Start tutorial">
      {showHint && <div className="tour-hint-popup">Need help? Start here:</div>}
      <button className="button" onClick={handleClick}>
        Run Interactive Tour
      </button>
    </Tooltip>
  );
}
