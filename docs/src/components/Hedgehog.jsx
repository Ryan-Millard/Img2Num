import Link from '@docusaurus/Link';
import React, { useEffect, useState } from "react";
import idle from "@site/static/img/pixel_art_hedgehog/idle/idle.gif";
import run from "@site/static/img/pixel_art_hedgehog/move/move.gif";
import transition from "@site/static/img/pixel_art_hedgehog/sleep_transition/hedgehog.gif";
import sleep from "@site/static/img/pixel_art_hedgehog/sleep/sleep.gif";

const STATES = {
  IDLE: "idle",
  RUN: "run",
  TRANSITION: "transition",
  SLEEP: "sleep",
};

const GIFS = {
  idle,
  run,
  transition,
  sleep,
};

// state manager with next state and delay function
const STATE_MACHINE = {
  [STATES.IDLE]: {
    next: STATES.RUN,
    delay: () => rand(1000, 3000),
  },
  [STATES.RUN]: {
    next: STATES.TRANSITION,
    delay: () => rand(4000, 9000),
  },
  [STATES.TRANSITION]: {
    next: STATES.SLEEP,
    delay: () => 800,
  },
  [STATES.SLEEP]: {
    next: STATES.IDLE,
    delay: () => rand(3000, 7000),
  },
};

export default function Hedgehog() {
  const [key, setKey] = useState(0);
  const [state, setState] = useState(STATES.IDLE);

  useEffect(() => {
    const delay = STATE_MACHINE[state].delay();

    const timer = setTimeout(() => {
      setState(STATE_MACHINE[state].next);
      setKey(k => k + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [state]);

  return (
    <Link to="/credits/#pixel-art-hedgehog">
      <img
        key={key}
        src={GIFS[state]}
        alt="hedgehog"
        style={{
          width: 128,
          height: 128,
          imageRendering: "pixelated",
        }}
      />
    </Link>
  );
}

function rand(a, b) {
  return Math.floor(Math.random() * (b - a) + a);
}
