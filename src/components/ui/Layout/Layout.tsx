import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { classNames } from "../classNames";
import styles from "./Layout.module.css";

type PageVariant = "app" | "welcome" | "legal";
type SectionSize = "narrow" | "content" | "wide";
type RowAlign = "start" | "center" | "end" | "stretch";
type RowJustify = "start" | "center" | "end" | "between";
type LayoutGap = "none" | "xs" | "sm" | "md" | "lg" | "xl";

type PageProps = HTMLAttributes<HTMLElement> & {
  as?: "main" | "section" | "article";
  variant?: PageVariant;
};

type SectionProps = HTMLAttributes<HTMLElement> & {
  as?: "section" | "article" | "div" | "header" | "footer";
  size?: SectionSize;
};

type RowProps = HTMLAttributes<HTMLDivElement> & {
  align?: RowAlign;
  children: ReactNode;
  gap?: LayoutGap;
  justify?: RowJustify;
  wrap?: boolean;
};

export function Page({
  as: Component = "main",
  className,
  variant = "app",
  ...props
}: PageProps) {
  return (
    <Component
      className={classNames(styles.page, styles[variant], className)}
      {...props}
    />
  );
}

export function Section({
  as: Component = "section",
  className,
  size = "content",
  ...props
}: SectionProps) {
  return (
    <Component
      className={classNames(styles.section, styles[size], className)}
      {...props}
    />
  );
}

export function HugRow({
  align = "center",
  className,
  gap = "sm",
  justify = "start",
  style,
  wrap = false,
  ...props
}: RowProps) {
  return (
    <div
      className={classNames(styles.hugRow, className)}
      data-align={align}
      data-gap={gap}
      data-justify={justify}
      data-wrap={wrap}
      style={style as CSSProperties}
      {...props}
    />
  );
}

export function FillRow({
  align = "center",
  className,
  gap = "sm",
  justify = "between",
  style,
  wrap = false,
  ...props
}: RowProps) {
  return (
    <div
      className={classNames(styles.fillRow, className)}
      data-align={align}
      data-gap={gap}
      data-justify={justify}
      data-wrap={wrap}
      style={style as CSSProperties}
      {...props}
    />
  );
}
