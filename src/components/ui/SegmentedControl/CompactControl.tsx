import type { ReactElement, ReactNode } from "react";
import threeDotsIcon from "../../../icons/three-dots.svg?raw";
import { SegmentedControlRoot } from "./SegmentedControl";
import { SvgIcon } from "../SvgIcon";
import { classNames } from "../classNames";
import styles from "./SegmentedControl.module.css";

export function CompactControl({
  label,
  valueLabel,
  children,
  optionsLabel,
  disabled,
  expanded,
  onValueClick,
  onOptionsClick,
  renderOptions,
}: {
  label: string;
  valueLabel: string;
  children: ReactNode;
  optionsLabel: string;
  disabled?: boolean;
  expanded?: boolean;
  onValueClick?: () => void;
  onOptionsClick?: () => void;
  renderOptions?: (button: ReactElement) => ReactNode;
}) {
  const optionsButton = (
    <button
      aria-label={optionsLabel}
      aria-expanded={expanded}
      className={classNames(styles.segment, styles.iconSegment)}
      disabled={disabled}
      onClick={onOptionsClick}
      title={optionsLabel}
      type="button"
    >
      <span className={styles.segmentContent}><SvgIcon svg={threeDotsIcon} /></span>
    </button>
  );
  return (
    <SegmentedControlRoot label={label}>
      <button
        aria-label={valueLabel}
        className={styles.segment}
        data-active="true"
        disabled={disabled}
        onClick={onValueClick}
        title={valueLabel}
        type="button"
      >
        <span aria-hidden="true" className={styles.activeIndicator} />
        <span className={styles.segmentContent}>{children}</span>
      </button>
      {renderOptions ? renderOptions(optionsButton) : optionsButton}
    </SegmentedControlRoot>
  );
}
