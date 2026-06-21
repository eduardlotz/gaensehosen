import { arc } from "motion/react";

export const primaryButtonLayoutId = "primary-quote-action";

const primaryButtonPath = arc();

export const primaryButtonTransition = {
  layout: {
    type: "spring",
    stiffness: 620,
    damping: 28,
    mass: 0.42,
    path: primaryButtonPath,
  },

  opacity: {
    duration: 0.07,
  },
  filter: {
    duration: 0.09,
  },
} as const;

export const controlIndicatorTransition = {
  layout: {
    type: "spring",
    visualDuration: 0.22,
    bounce: 0.18,
  },
} as const;
