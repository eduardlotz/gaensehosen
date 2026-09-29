import { arc } from "motion/react";

export const primaryButtonLayoutId = "primary-quote-action";

const primaryButtonPath = arc({ strength: 0.2, peak: 0.5 });

export const primaryButtonTransition = {
  layout: {
    type: "spring",
    // stiffness: 600,
    stiffness: 500,
    damping: 25,
    mass: 0.5,
    // visualDuration: 0.8,
    // path: primaryButtonPath,
  },

  // opacity: {
  //   duration: 0.07,
  // },
  // filter: {
  //   duration: 0.09,
  // },
} as const;

export const controlIndicatorTransition = {
  layout: {
    type: "spring",
    visualDuration: 0.22,
    bounce: 0.18,
  },
} as const;

export const quickScaleFade = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: {
    opacity: { duration: 0.12 },
    scale: {
      type: "spring",
      stiffness: 720,
      damping: 21,
      mass: 0.52,
    },
  },
} as const;
