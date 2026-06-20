export const primaryButtonLayoutId = "primary-quote-action";

export const primaryButtonTransition = {
  layout: {
    type: "spring",
    stiffness: 620,
    damping: 28,
    mass: 0.42,
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
