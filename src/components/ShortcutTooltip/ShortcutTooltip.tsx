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

    const anchorElement = anchor;

    function setInteractionReference(event: Event) {
      refs.setReference(
        event.target instanceof Element ? event.target : anchorElement,
      );
    }

    function updatePosition() {
      window.requestAnimationFrame(() => {
        void update();
      });
    }

    function handleFocusIn(event: Event) {
      setInteractionReference(event);
      setOpen(true);
      updatePosition();
    }

    function handleFocusOut() {
      setOpen(false);
    }

    function handleMouseOver(event: Event) {
      setInteractionReference(event);
      setOpen(true);
      updatePosition();
    }

    function handleMouseOut(event: MouseEvent) {
      if (
        event.relatedTarget instanceof Node &&
        anchorElement.contains(event.relatedTarget)
      ) {
        return;
      }

      setOpen(false);
    }

    anchorElement.addEventListener("focusin", handleFocusIn);
    anchorElement.addEventListener("focusout", handleFocusOut);
    anchorElement.addEventListener("mouseover", handleMouseOver);
    anchorElement.addEventListener("mouseout", handleMouseOut);

    return () => {
      anchorElement.removeEventListener("focusin", handleFocusIn);
      anchorElement.removeEventListener("focusout", handleFocusOut);
      anchorElement.removeEventListener("mouseover", handleMouseOver);
      anchorElement.removeEventListener("mouseout", handleMouseOut);
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
