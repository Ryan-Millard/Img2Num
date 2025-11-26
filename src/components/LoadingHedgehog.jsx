import { useRef, useState, useEffect } from 'react';
import styles from './LoadingHedgehog.module.css';

import hedgeMove from '@assets/pixel_art_hedgehog/move/move.gif';
//import hedgeIdle from '@assets/pixel_art_hedgehog/idle/idle.gif';
import hedgeSleep from '@assets/pixel_art_hedgehog/sleep/sleep.gif';
import hedgeSleepTransition from '@assets/pixel_art_hedgehog/sleep_transition/hedgehog.gif';

const clamp = (v, a = 0, b = 100) => Math.min(b, Math.max(a, v));

// configuration
const STALL_MS = 700; // how long without progress before we start sleeping
const TRANSITION_MS = 900; // transition GIF duration (before switching to looped sleep)
const POSITION_LERP = 0.12; // how quickly the hedgehog position eases toward target

const LoadingHedgehog = ({ progress = 0, text = 'Processing image...' }) => {
  // animation sources + visual states
  const [src, setSrc] = useState(hedgeMove);
  const [isSleeping, setIsSleeping] = useState(false);

  // displayedProgress is what determines the hedgehog's left position.
  // It is interpolated smoothly and *frozen* while the hedgehog is asleep.
  const [displayedProgress, setDisplayedProgress] = useState(clamp(progress));

  // refs for timers / flags / last change detection
  const stallTimer = useRef(null);
  const transitionTimer = useRef(null);
  const rafRef = useRef(null);
  const transitioningRef = useRef(false);

  // track last observed progress and last change timestamp
  const lastProgressRef = useRef(clamp(progress));
  const lastChangeAtRef = useRef(Date.now());

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (stallTimer.current) clearTimeout(stallTimer.current);
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Smooth position updater (requestAnimationFrame) - only moves when not sleeping
  useEffect(() => {
    const step = () => {
      // target is the latest prop progress (we always clamp)
      const target = clamp(progress);
      setDisplayedProgress((prev) => {
        // If sleeping - do not move the hedgehog
        if (isSleeping) return prev;

        // If very close, snap to target to avoid endless tiny changes
        if (Math.abs(prev - target) < 0.15) return target;

        // lerp towards target
        return prev + (target - prev) * POSITION_LERP;
      });

      rafRef.current = requestAnimationFrame(step);
    };

    // start the loop
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(step);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isSleeping, progress]); // restart loop if sleeping state changes or new target

  // helpers to start/clear timers safely
  const clearStallTimer = () => {
    if (stallTimer.current) {
      clearTimeout(stallTimer.current);
      stallTimer.current = null;
    }
  };
  const clearTransitionTimer = () => {
    if (transitionTimer.current) {
      clearTimeout(transitionTimer.current);
      transitionTimer.current = null;
    }
  };

  // Sleep transition (triggered after STALL_MS of inactivity)
  const startSleepTransition = () => {
    // already transitioning or asleep -> no-op
    if (transitioningRef.current || isSleeping) return;

    transitioningRef.current = true;
    setSrc(hedgeSleepTransition);

    // after the transition GIF finishes, switch to the looping sleep animation and mark sleeping
    transitionTimer.current = setTimeout(() => {
      setSrc(hedgeSleep);
      setIsSleeping(true);
      transitioningRef.current = false;
      transitionTimer.current = null;
    }, TRANSITION_MS);
  };

  // Wake transition (when progress resumes after sleep)
  const startWakeTransition = () => {
    if (transitioningRef.current || !isSleeping) return;

    transitioningRef.current = true;
    // play the transition GIF (we reuse the same asset). If you have a dedicated "wake" GIF, use it here.
    setSrc(hedgeSleepTransition);

    // after the transition, set moving animation and stop being sleeping
    transitionTimer.current = setTimeout(() => {
      setIsSleeping(false);
      setSrc(hedgeMove);
      transitioningRef.current = false;
      transitionTimer.current = null;
      // when waking, ensure position animation is allowed again by starting the RAF loop (it will run via effect)
    }, TRANSITION_MS);
  };

  // React to progress prop changes (no hard-coded thresholds)
  useEffect(() => {
    const now = Date.now();
    const newProg = clamp(progress);
    const lastProg = lastProgressRef.current;

    // If the numeric progress changed at all, record change time
    if (newProg !== lastProg) {
      lastChangeAtRef.current = now;
      lastProgressRef.current = newProg;

      // Clear any stall timer (we're active)
      clearStallTimer();

      // If we were sleeping, start wake transition
      if (isSleeping) {
        startWakeTransition();
      } else {
        // If not sleeping, show moving animation while updates are happening
        // Keep it simple: show move while updates are ongoing.
        // If you want an "idle" when updates are very sparse, you can detect rate and set hedgeIdle instead.
        setSrc(hedgeMove);
      }

      // Start (or restart) a stall timer that will put the hedgehog to sleep after inactivity
      stallTimer.current = setTimeout(() => {
        startSleepTransition();
      }, STALL_MS);
    } else {
      // No numeric change this render; if not yet sleeping and no stall timer scheduled, schedule one
      // This handles a case where progress stops updating externally.
      if (!isSleeping && !stallTimer.current && !transitioningRef.current) {
        stallTimer.current = setTimeout(() => {
          startSleepTransition();
        }, STALL_MS);
      }
      // otherwise do nothing
    }

    // always clear any pending transition timer if progress changed and a transition was pending
    // (e.g., progress resumed mid-transition)
    if (transitioningRef.current && !isSleeping) {
      // if we were transitioning to sleep but activity resumed, cancel the pending sleep finish
      clearTransitionTimer();
      transitioningRef.current = false;
      // pick a moving state
      setSrc(hedgeMove);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  // ensure timers are cleaned up if sleeping state flips externally
  useEffect(() => {
    if (isSleeping) {
      clearStallTimer();
    }
  }, [isSleeping]);

  return (
    <div className={styles.container} aria-live="polite" role="status">
      <div className={styles.header}>{text}</div>

      <div className={styles.barWrap}>
        <div className={styles.grass} aria-hidden="true">
          {/* progress fill is inside the grass */}
          <div
            className={styles.fill}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(clamp(progress))}
            style={{ width: `${clamp(progress)}%` }}
          />
        </div>

        {/* hedgehog is a sibling overlay positioned on top of the grass (not inside) */}
        <div className={styles.hedgehogWrap} aria-hidden="true">
          <img
            src={src}
            alt="hedgehog"
            className={`${styles.hedgehog} ${isSleeping ? styles.sleeping : ''}`}
            // use displayedProgress for hedgehog position so it can be frozen while sleeping
            style={{ left: `${clamp(displayedProgress)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingHedgehog;
