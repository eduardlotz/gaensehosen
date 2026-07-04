import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from "@floating-ui/react-dom";
import type { ReactElement } from "react";
import { cloneElement, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { KeyboardShortcutItem } from "../../utils/keyboardShortcuts";
import { KeyboardShortcutKeys } from "../KeyboardShortcut";
import styles from "./ShortcutTooltip.module.css";

type TooltipChildProps = {
  "aria-describedby"?: string;
};

type ShortcutTooltipProps = {
  children: ReactElement<TooltipChildProps>;
  label: string;
  shortcut: KeyboardShortcutItem;
};

export function ShortcutTooltip({
  children,
  label,
  shortcut,
}: ShortcutTooltipProps) {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const { floatingStyles, refs, update } = useFloating({
    middleware: [offset(8), flip(), shift({ padding: 12 })],
    open,
    placement: "top",
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    const anchor = anchorRef.current;

    if (!anchor) {
      return;
    }

    refs.setReference(anchor);

    function updatePosition() {
      window.requestAnimationFrame(() => {
        void update();
      });
    }

    function handleFocusIn() {
      setOpen(true);
      updatePosition();
    }

    function handleFocusOut() {
      setOpen(false);
    }

    function handleMouseEnter() {
      setOpen(true);
      updatePosition();
    }

    function handleMouseLeave() {
      setOpen(false);
    }

    anchor.addEventListener("focusin", handleFocusIn);
    anchor.addEventListener("focusout", handleFocusOut);
    anchor.addEventListener("mouseenter", handleMouseEnter);
    anchor.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      anchor.removeEventListener("focusin", handleFocusIn);
      anchor.removeEventListener("focusout", handleFocusOut);
      anchor.removeEventListener("mouseenter", handleMouseEnter);
      anchor.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [refs, update]);

  const describedBy = open
    ? [children.props["aria-describedby"], tooltipId]
        .filter(Boolean)
        .join(" ")
    : children.props["aria-describedby"];

  return (
    <>
      <span
        className={styles.anchor}
        ref={anchorRef}
      >
        {cloneElement(children, {
          "aria-describedby": describedBy,
        })}
      </span>

      {open
        ? createPortal(
            <div
              className={styles.tooltip}
              id={tooltipId}
              ref={refs.setFloating}
              role="tooltip"
              style={floatingStyles}
            >
              <span className={styles.label}>{label}</span>
              <KeyboardShortcutKeys
                className={styles.shortcut}
                decorative
                shortcut={shortcut}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
