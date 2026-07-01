import type { ReactNode, RefObject } from "react";
import { FullScreenDialog, ModalCloseButton, Text } from "../ui";
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
