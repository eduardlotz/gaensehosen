import { motion } from "motion/react";
import type {
  AriaAttributes,
  ComponentProps,
  HTMLAttributes,
  ReactNode,
  RefObject,
} from "react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import arrowIcon from "../../../icons/back-arrow.svg?raw";
import { useFocusTrap } from "../../../hooks/useFocusTrap";
import { IconButton } from "../Button";
import { classNames } from "../classNames";
import { SvgIcon } from "../SvgIcon";
import styles from "./ModalSurface.module.css";

type FullScreenDialogProps = AriaAttributes & {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  id?: string;
  onClose: () => void;
  restoreFocusRef?: RefObject<HTMLElement | null>;
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
  restoreFocusRef,
  ...props
}: FullScreenDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const { handleKeyDown } = useFocusTrap({
    containerRef: dialogRef,
    onEscape: onClose,
    restoreFocusRef,
  });

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  return createPortal(
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
        onKeyDown={handleKeyDown}
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
    </motion.div>,
    document.body,
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
      <SvgIcon svg={arrowIcon} />
    </IconButton>
  );
}
