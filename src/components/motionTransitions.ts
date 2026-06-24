import { arc } from "motion/react";

export const primaryButtonLayoutId = "primary-quote-action";

const primaryButtonPath = arc({ strength: 0.2, peak: 0.5 });

export const primaryButtonTransition = {
  layout: {
    type: "spring",
    stiffness: 600,
    damping: 30,
    mass: 0.5,
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
