import type { HTMLAttributes } from "react";
import { classNames } from "../classNames";
import styles from "./Typography.module.css";

type TextTone = "default" | "muted" | "subtle" | "brand";
type TextVariant =
  | "display"
  | "title"
  | "body"
  | "bodyLarge"
  | "label"
  | "quote"
  | "quoteSource"
  | "empty";

type TextProps = HTMLAttributes<HTMLElement> & {
  as?: "h1" | "h2" | "h3" | "p" | "span" | "strong" | "cite";
  tone?: TextTone;
  variant?: TextVariant;
};

export function Text({
  as: Component = "p",
  className,
  tone = "default",
  variant = "body",
  ...props
}: TextProps) {
  return (
    <Component
      className={classNames(styles.text, styles[variant], className)}
      data-tone={tone}
      {...props}
    />
  );
}

export function SrOnly(props: HTMLAttributes<HTMLSpanElement>) {
  return <span className={styles.srOnly} {...props} />;
}
