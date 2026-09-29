import type { ReactNode } from "react";
import { classNames } from "../classNames";
import styles from "./SegmentedControl.module.css";

type Segment<Value extends string | number> = {
  value: Value;
  label: ReactNode;
  ariaLabel?: string;
  iconOnly?: boolean;
};

type SegmentedControlProps<Value extends string | number> = {
  label: string;
  options: readonly Segment<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  disabled?: boolean;
  className?: string;
};

export function SegmentedControlRoot({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <div aria-label={label} className={classNames(styles.root, className)} role="group">
      {children}
    </div>
  );
}

export function SegmentedControl<Value extends string | number>({
  label,
  options,
  value,
  onChange,
  disabled,
  className,
}: SegmentedControlProps<Value>) {
  return (
    <SegmentedControlRoot className={className} label={label}>
      {options.map((option) => (
        <button
          aria-label={option.ariaLabel}
          aria-pressed={option.value === value}
          className={classNames(styles.segment, option.iconOnly && styles.iconSegment)}
          disabled={disabled}
          key={option.value}
          onClick={() => onChange(option.value)}
          title={option.ariaLabel}
          type="button"
        >
          {option.value === value ? <span aria-hidden="true" className={styles.activeIndicator} /> : null}
          <span className={styles.segmentContent}>{option.label}</span>
        </button>
      ))}
    </SegmentedControlRoot>
  );
}
