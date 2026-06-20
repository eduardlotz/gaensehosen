import type { HTMLAttributes } from "react";
import { classNames } from "../classNames";
import styles from "./ModalSurface.module.css";

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
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={classNames(styles.fullScreenDialog, className)} {...props} />;
}

export function ModalSurface({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={classNames(styles.surface, className)} {...props} />;
}
