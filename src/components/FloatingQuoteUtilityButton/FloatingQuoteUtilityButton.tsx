import { motion, type HTMLMotionProps } from "motion/react";
import plusIcon from "../../icons/plus.svg?raw";
import { SvgIcon } from "../ui";
import { classNames } from "../ui/classNames";
import styles from "./FloatingQuoteUtilityButton.module.css";

export type FloatingQuoteUtilityButtonState =
  | { kind: "clearSearch"; label: string; onClick: () => void }
  | {
      kind: "closeControls";
      label: string;
      onClick: () => void;
      side: "left" | "right";
    };

type FloatingQuoteUtilityButtonProps = Omit<
  HTMLMotionProps<"button">,
  "aria-label" | "children" | "onClick" | "type"
> & {
  state: FloatingQuoteUtilityButtonState;
};

export function FloatingQuoteUtilityButton({
  className,
  state,
  ...props
}: FloatingQuoteUtilityButtonProps) {
  const positionClassName =
    state.kind === "closeControls"
      ? state.side === "left"
        ? styles.left
        : styles.right
      : styles.center;
  const closeControlsAnimation =
    state.kind === "closeControls"
      ? {
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.86 },
          initial: { opacity: 0, scale: 0.42 },
          transition: {
            opacity: { duration: 0.12 },
            scale: {
              type: "spring",
              stiffness: 720,
              damping: 21,
              mass: 0.52,
            },
          } as const,
        }
      : {};

  return (
    <motion.button
      aria-label={state.label}
      className={classNames(
        styles.root,
        styles[state.kind],
        positionClassName,
        className,
      )}
      data-kind={state.kind}
      onClick={state.onClick}
      title={state.label}
      type="button"
      {...closeControlsAnimation}
      {...props}
    >
      <span aria-hidden="true" className={styles.surface} />
      <span className={styles.contentSlot}>
        {state.kind === "closeControls" ? (
          <SvgIcon className={styles.closeIcon} svg={plusIcon} />
        ) : (
          <span className={styles.textContent}>{state.label}</span>
        )}
      </span>
    </motion.button>
  );
}
