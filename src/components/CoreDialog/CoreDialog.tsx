import type { ReactNode, RefObject } from "react";
import { useId } from "react";
import { Button, FullScreenDialog, ModalCloseButton, Text } from "../ui";
import { classNames } from "../ui/classNames";
import styles from "./CoreDialog.module.css";

type CoreDialogProps = {
  bodyClassName?: string;
  children: ReactNode;
  className?: string;
  closeLabel: string;
  contentClassName?: string;
  onClose: () => void;
  restoreFocusRef?: RefObject<HTMLElement | null>;
  title: string;
  titleId: string;
};

type ConfirmationDialogVariant = "default" | "destructive";

type ConfirmationDialogProps = {
  cancelLabel: string;
  confirmLabel: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  restoreFocusRef?: RefObject<HTMLElement | null>;
  title: string;
  variant?: ConfirmationDialogVariant;
};

export function CoreDialog({
  bodyClassName,
  children,
  className,
  closeLabel,
  contentClassName,
  onClose,
  restoreFocusRef,
  title,
  titleId,
}: CoreDialogProps) {
  return (
    <FullScreenDialog
      aria-labelledby={titleId}
      className={classNames(styles.backdrop, className)}
      contentClassName={classNames(styles.dialog, contentClassName)}
      onClose={onClose}
      restoreFocusRef={restoreFocusRef}
    >
      <div className={styles.stickyHeader}>
        <Text as="h1" className={styles.title} id={titleId} variant="title">
          <span className={styles.quoteMark}>„</span>
          {title}
          <span className={styles.quoteMark}>“</span>
        </Text>

        <ModalCloseButton
          aria-label={closeLabel}
          className={styles.closeButton}
          onClick={onClose}
          title={closeLabel}
        />
      </div>

      <div className={classNames(styles.scrollContent, bodyClassName)}>
        {children}
      </div>
    </FullScreenDialog>
  );
}

function confirmationButtonVariant(variant: ConfirmationDialogVariant) {
  if (variant === "destructive") {
    return "danger";
  }

  return "default";
}

export function ConfirmationDialog({
  cancelLabel,
  confirmLabel,
  description,
  onCancel,
  onConfirm,
  restoreFocusRef,
  title,
  variant = "default",
}: ConfirmationDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <FullScreenDialog
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      contentClassName={styles.confirmationDialog}
      onClose={onCancel}
      restoreFocusRef={restoreFocusRef}
    >
      <Text
        as="h2"
        className={styles.confirmationTitle}
        id={titleId}
        variant="title"
      >
        <span className={styles.quoteMark}>„</span>
        {title}
        <span className={styles.quoteMark}>“</span>
      </Text>
      <Text
        as="p"
        className={styles.confirmationDescription}
        id={descriptionId}
      >
        {description}
      </Text>

      <div className={styles.confirmationActions}>
        <Button onClick={onCancel} type="button" variant="default">
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          type="button"
          variant={confirmationButtonVariant(variant)}
        >
          {confirmLabel}
        </Button>
      </div>
    </FullScreenDialog>
  );
}
