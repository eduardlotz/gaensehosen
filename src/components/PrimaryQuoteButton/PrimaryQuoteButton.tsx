import { AnimatePresence, motion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import type { CSSProperties } from "react";
import { match } from "ts-pattern";
import plusIcon from "../../icons/plus.svg?raw";
import type { KeyboardShortcutItem } from "../../utils/keyboardShortcuts";
import {
  primaryButtonLayoutId,
  primaryButtonTransition,
} from "../motionTransitions";
import { SvgIcon } from "../ui";
import { classNames } from "../ui/classNames";
import styles from "./PrimaryQuoteButton.module.css";

export type PrimaryQuoteButtonState =
  | { kind: "add"; position: "fixed"; label: string; onClick: () => void }
  | { kind: "save"; position: "relative"; label: string; type: "submit" };

type PrimaryQuoteButtonProps = Omit<
  HTMLMotionProps<"button">,
  "aria-label" | "children" | "onClick" | "type"
> & {
  shortcut?: KeyboardShortcutItem;
  state: PrimaryQuoteButtonState;
  textSize?: CSSProperties["fontSize"];
};

const contentTransition = {
  duration: 0.14,
  ease: [0.2, 0.8, 0.2, 1],
} as const;

const iconContentAnimation = {
  initial: { opacity: 0, filter: "blur(7px)", rotate: -45, scale: 0.92, y: 2 },
  animate: { opacity: 1, filter: "blur(0px)", rotate: 0, scale: 1, y: 0 },
  exit: { opacity: 0, filter: "blur(7px)", rotate: 45, scale: 0.92, y: -2 },
} as const;

const textContentAnimation = {
  initial: { opacity: 0, filter: "blur(7px)", scale: 0.98, y: 3 },
  animate: { opacity: 1, filter: "blur(0px)", scale: 1, y: 0 },
  exit: { opacity: 0, filter: "blur(7px)", scale: 0.98, y: -3 },
} as const;

type ButtonLayoutStyle = Pick<
  CSSProperties,
  "borderRadius" | "height" | "maxWidth" | "padding" | "width"
>;

const buttonRadius = 20;
const addButtonHeight = 44;
const addButtonWidth = 59;
const saveButtonHeight = 48;
const primaryIconSize = 20;
const primaryIconStyle = {
  height: primaryIconSize,
  width: primaryIconSize,
} satisfies CSSProperties;

export function PrimaryQuoteButton({
  className,
  shortcut: _shortcut,
  state,
  style,
  textSize,
  ...props
}: PrimaryQuoteButtonProps) {
  const buttonConfig = match(state)
    .with({ kind: "add" }, ({ label, onClick }) => ({
      ariaLabel: label,
      onClick,
      title: label,
      type: "button" as const,
      layoutStyle: {
        borderRadius: buttonRadius,
        height: addButtonHeight,
        padding: "12px 18px",
        width: addButtonWidth,
      },
    }))
    .with({ kind: "save" }, ({ type }) => ({
      ariaLabel: undefined,
      onClick: undefined,
      title: undefined,
      type,
      layoutStyle: {
        borderRadius: buttonRadius,
        height: saveButtonHeight,
        maxWidth: "100%",
        padding: 0,
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
    ...style,
    ...buttonConfig.layoutStyle,
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
      whileHover={{
        scale: 1.007,
        transition: {
          type: "spring",
          duration: 0.05,
        },
      }}
      whileTap={{
        scale: 0.997,
        transition: {
          type: "spring",
          duration: 0.1,
        },
      }}
      type={buttonConfig.type}
      {...props}
    >
      <motion.span
        className={styles.contentSlot}
        layout="position"
        transition={primaryButtonTransition}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {match(state)
            .with({ kind: "add" }, () => (
              <motion.span
                {...iconContentAnimation}
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
            .with({ kind: "save" }, ({ label }) => (
              <motion.span
                {...textContentAnimation}
                className={styles.textContent}
                key="save"
                transition={contentTransition}
              >
                {label}
              </motion.span>
            ))
            .exhaustive()}
        </AnimatePresence>
      </motion.span>
    </motion.button>
  );
}
