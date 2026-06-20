import { motion } from "motion/react";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { forwardRef } from "react";
import { classNames } from "../classNames";
import styles from "./Button.module.css";

type ButtonVariant =
  | "default"
  | "flat"
  | "highlight"
  | "brand"
  | "danger"
  | "primary"
  | "soft"
  | "icon";
type ButtonSize = "small" | "big";
type IconPosition = "left" | "right";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: IconPosition;
  textSize?: CSSProperties["fontSize"];
};

function variantClassName(variant: ButtonVariant) {
  if (variant === "primary") {
    return styles.brand;
  }

  if (variant === "soft") {
    return styles.default;
  }

  return styles[variant];
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className,
    icon,
    iconPosition = "left",
    size = "big",
    style,
    textSize,
    type = "button",
    variant = "default",
    ...props
  },
  ref,
) {
  const buttonStyle = {
    ...style,
    "--button-text-size":
      typeof textSize === "number" ? `${textSize}px` : textSize,
  } as CSSProperties;
  const hasIcon = Boolean(icon);
  const hasText = Boolean(children);

  return (
    <button
      className={classNames(
        styles.button,
        variantClassName(variant),
        styles[size],
        hasIcon && styles.hasIcon,
        hasIcon && hasText && styles[`${iconPosition}Icon`],
        className,
      )}
      ref={ref}
      style={buttonStyle}
      type={type}
      {...props}
    >
      {hasIcon && iconPosition === "left" ? (
        <span className={styles.iconWrap}>{icon}</span>
      ) : null}
      {hasText ? <span className={styles.text}>{children}</span> : null}
      {hasIcon && iconPosition === "right" ? (
        <span className={styles.iconWrap}>{icon}</span>
      ) : null}
    </button>
  );
});

export const MotionButton = motion.create(Button);

export function IconButton(props: Omit<ButtonProps, "variant">) {
  return <Button variant="icon" {...props} />;
}

export function PrimaryButton(props: Omit<ButtonProps, "variant">) {
  return <Button variant="brand" {...props} />;
}
