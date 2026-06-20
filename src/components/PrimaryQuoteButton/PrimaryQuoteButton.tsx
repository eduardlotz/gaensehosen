import { AnimatePresence, motion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import type { CSSProperties } from "react";
import { match } from "ts-pattern";
import plusIcon from "../../icons/plus.svg?raw";
import {
  primaryButtonLayoutId,
  primaryButtonTransition,
} from "../motionTransitions";
import { useIsMobile } from "../../hooks/useIsMobile";
import { SvgIcon } from "../ui";
import { classNames } from "../ui/classNames";
import styles from "./PrimaryQuoteButton.module.css";

export type PrimaryQuoteButtonState =
  | { kind: "add"; position: "fixed"; label: string; onClick: () => void }
  | {
      kind: "closeLeftControls";
      position: "fixed";
      label: string;
      onClick: () => void;
    }
  | {
      kind: "closeRightControls";
      position: "fixed";
      label: string;
      onClick: () => void;
    }
  | {
      kind: "clearSearch";
      position: "fixed";
      label: string;
      onClick: () => void;
    }
  | { kind: "save"; position: "relative"; label: string; type: "submit" };

type PrimaryQuoteButtonProps = Omit<
  HTMLMotionProps<"button">,
  "aria-label" | "children" | "onClick" | "type"
> & {
  state: PrimaryQuoteButtonState;
  textSize?: CSSProperties["fontSize"];
};

const contentTransition = {
  duration: 0.14,
  ease: [0.2, 0.8, 0.2, 1],
} as const;

const blurredContentAnimation = {
  initial: { opacity: 0, filter: "blur(7px)", y: 2 },
  animate: { opacity: 1, filter: "blur(0px)", y: 0 },
  exit: { opacity: 0, filter: "blur(7px)", y: -2 },
} as const;

const cleanContentAnimation = {
  initial: { opacity: 0, filter: "blur(0px)", y: 0 },
  animate: { opacity: 1, filter: "blur(0px)", y: 0 },
  exit: { opacity: 0, filter: "blur(0px)", y: 0 },
} as const;

type ButtonLayoutStyle = Pick<
  CSSProperties,
  "borderRadius" | "height" | "maxWidth" | "width"
>;

const buttonRadius = 20;
const buttonHeight = 48;
const addButtonWidth = 64;
const fixedIconButtonWidth = 60;
const primaryIconSize = 24;
const primaryIconStyle = {
  height: primaryIconSize,
  width: primaryIconSize,
} satisfies CSSProperties;

export function PrimaryQuoteButton({
  className,
  state,
  style,
  textSize,
  ...props
}: PrimaryQuoteButtonProps) {
  const isMobile = useIsMobile();
  const contentAnimation = isMobile
    ? blurredContentAnimation
    : cleanContentAnimation;
  const buttonConfig = match(state)
    .with({ kind: "add" }, ({ label, onClick }) => ({
      ariaLabel: label,
      onClick,
      title: label,
      type: "button" as const,
      layoutStyle: {
        borderRadius: buttonRadius,
        height: buttonHeight,
        width: addButtonWidth,
      },
    }))
    .with({ kind: "closeLeftControls" }, ({ label, onClick }) => ({
      ariaLabel: label,
      onClick,
      title: label,
      type: "button" as const,
      layoutStyle: {
        borderRadius: buttonRadius,
        height: buttonHeight,
        width: fixedIconButtonWidth,
      },
    }))
    .with({ kind: "closeRightControls" }, ({ label, onClick }) => ({
      ariaLabel: label,
      onClick,
      title: label,
      type: "button" as const,
      layoutStyle: {
        borderRadius: buttonRadius,
        height: buttonHeight,
        width: fixedIconButtonWidth,
      },
    }))
    .with({ kind: "clearSearch" }, ({ label, onClick }) => ({
      ariaLabel: label,
      onClick,
      title: label,
      type: "button" as const,
      layoutStyle: {
        borderRadius: buttonRadius,
        height: buttonHeight,
        width: "fit-content",
      },
    }))
    .with({ kind: "save" }, ({ type }) => ({
      ariaLabel: undefined,
      onClick: undefined,
      title: undefined,
      type,
      layoutStyle: {
        borderRadius: buttonRadius,
        height: buttonHeight,
        maxWidth: "100%",
        width: "100%",
      },
    }))
    .exhaustive() satisfies {
    ariaLabel: string | undefined;
    layoutStyle: ButtonLayoutStyle;
    onClick: (() => void) | undefined;
    title: string | undefined;
    type: "button" | "submit";
  };

  const buttonStyle: HTMLMotionProps<"button">["style"] = {
    ...buttonConfig.layoutStyle,
    ...style,
    ...(textSize === undefined ? {} : { fontSize: textSize }),
  };

  return (
    <motion.button
      aria-label={buttonConfig.ariaLabel}
      className={classNames(
        styles.root,
        styles[state.position],
        styles[state.kind],
        className,
      )}
      data-kind={state.kind}
      layoutId={primaryButtonLayoutId}
      onClick={buttonConfig.onClick}
      style={buttonStyle}
      title={buttonConfig.title}
      transition={primaryButtonTransition}
      type={buttonConfig.type}
      {...props}
    >
      <motion.span
        aria-hidden="true"
        animate={{ borderRadius: buttonConfig.layoutStyle.borderRadius }}
        className={styles.surface}
        initial={false}
        layout="preserve-aspect"
        style={{
          borderRadius: buttonConfig.layoutStyle.borderRadius,
        }}
        transition={primaryButtonTransition}
      />
      <span className={styles.contentSlot}>
        <AnimatePresence mode="popLayout" initial={false}>
          {match(state)
            .with({ kind: "add" }, () => (
              <motion.span
                {...contentAnimation}
                className={styles.iconContent}
                key="add"
                transition={contentTransition}
              >
                <SvgIcon
                  className={styles.plusIcon}
                  style={primaryIconStyle}
                  svg={plusIcon}
                />
              </motion.span>
            ))
            .with({ kind: "closeLeftControls" }, () => (
              <motion.span
                {...contentAnimation}
                className={`${styles.iconContent} ${styles.closeIconContent}`}
                key="closeLeftControls"
                transition={contentTransition}
              >
                <SvgIcon
                  className={styles.plusIcon}
                  style={primaryIconStyle}
                  svg={plusIcon}
                />
              </motion.span>
            ))
            .with({ kind: "closeRightControls" }, () => (
              <motion.span
                {...contentAnimation}
                className={`${styles.iconContent} ${styles.closeIconContent}`}
                key="closeRightControls"
                transition={contentTransition}
              >
                <SvgIcon
                  className={styles.plusIcon}
                  style={primaryIconStyle}
                  svg={plusIcon}
                />
              </motion.span>
            ))
            .with({ kind: "clearSearch" }, ({ label }) => (
              <motion.span
                {...contentAnimation}
                className={styles.textContent}
                key="clearSearch"
                transition={contentTransition}
              >
                {label}
              </motion.span>
            ))
            .with({ kind: "save" }, ({ label }) => (
              <motion.span
                {...contentAnimation}
                className={styles.textContent}
                key="save"
                transition={contentTransition}
              >
                {label}
              </motion.span>
            ))
            .exhaustive()}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}
