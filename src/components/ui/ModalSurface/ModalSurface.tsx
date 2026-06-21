import { motion } from "motion/react";
import type {
  AriaAttributes,
  ComponentProps,
  HTMLAttributes,
  KeyboardEvent,
  ReactNode,
} from "react";
import { useEffect, useRef } from "react";
import plusIcon from "../../../icons/plus.svg?raw";
import { IconButton } from "../Button";
import { classNames } from "../classNames";
import { SvgIcon } from "../SvgIcon";
import styles from "./ModalSurface.module.css";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

type FullScreenDialogProps = AriaAttributes & {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  id?: string;
  onClose: () => void;
};

export function ModalBackdrop({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classNames(styles.backdrop, className)}
      role="presentation"
      {...props}
    />
  );
}

export function FullScreenDialog({
  className,
  children,
  contentClassName,
  onClose,
  ...props
}: FullScreenDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocusedElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      focusFirstDialogControl();
    }, 0);

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    function keepFocusInDialog(event: globalThis.FocusEvent) {
      const dialog = dialogRef.current;

      if (!dialog) {
        return;
      }

      if (event.target instanceof Node && dialog.contains(event.target)) {
        return;
      }

      focusFirstDialogControl();
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", keepFocusInDialog);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", keepFocusInDialog);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;

      if (previouslyFocusedElementRef.current?.isConnected) {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [onClose]);

  function getFocusableElements() {
    const dialog = dialogRef.current;

    if (!dialog) {
      return [];
    }

    return Array.from(
      dialog.querySelectorAll<HTMLElement>(focusableSelector),
    ).filter(
      (element) =>
        element.tabIndex !== -1 &&
        !element.hasAttribute("disabled") &&
        element.getAttribute("aria-hidden") !== "true",
    );
  }

  function focusFirstDialogControl() {
    const firstFocusableElement = getFocusableElements()[0];

    if (firstFocusableElement) {
      firstFocusableElement.focus();
      return;
    }

    dialogRef.current?.focus();
  }

  function trapFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") {
      return;
    }

    const dialog = dialogRef.current;
    const focusableElements = getFocusableElements();

    if (!dialog || focusableElements.length === 0) {
      event.preventDefault();
      dialog?.focus();
      return;
    }

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement =
      focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (
      event.shiftKey &&
      (activeElement === firstFocusableElement ||
        !(activeElement instanceof Node && dialog.contains(activeElement)))
    ) {
      event.preventDefault();
      lastFocusableElement.focus();
      return;
    }

    if (!event.shiftKey && activeElement === lastFocusableElement) {
      event.preventDefault();
      firstFocusableElement.focus();
    }
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className={classNames(styles.backdrop, className)}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      onMouseDown={onClose}
      role="presentation"
      transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <motion.div
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={classNames(styles.fullScreenDialog, contentClassName)}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        onKeyDown={trapFocus}
        onMouseDown={(event) => event.stopPropagation()}
        ref={dialogRef}
        aria-modal="true"
        role="dialog"
        tabIndex={-1}
        transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
        {...props}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function ModalSurface({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={classNames(styles.surface, className)} {...props} />;
}

export function ModalCloseButton({
  className,
  title,
  ...props
}: ComponentProps<typeof IconButton>) {
  return (
    <IconButton
      className={classNames(styles.closeButton, className)}
      title={title}
      {...props}
    >
      <SvgIcon className={styles.closeIcon} svg={plusIcon} />
    </IconButton>
  );
}
