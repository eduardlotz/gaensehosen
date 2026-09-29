import type { PosterAlignment } from "./quotePoster";
import { SvgIcon } from "../ui";
import topLeftIcon from "../../icons/topleft.svg?raw";
import topCenterIcon from "../../icons/topcenter.svg?raw";
import topRightIcon from "../../icons/topright.svg?raw";
import middleLeftIcon from "../../icons/leftcenter.svg?raw";
import middleCenterIcon from "../../icons/centercenter.svg?raw";
import middleRightIcon from "../../icons/rightcenter.svg?raw";
import bottomLeftIcon from "../../icons/bottomleft.svg?raw";
import bottomCenterIcon from "../../icons/bottomcenter.svg?raw";
import bottomRightIcon from "../../icons/bottomright.svg?raw";
import styles from "./TextAlignmentControl.module.css";

const choices: { value: PosterAlignment; icon: string }[] = [
  { value: "topLeft", icon: topLeftIcon },
  { value: "topCenter", icon: topCenterIcon },
  { value: "topRight", icon: topRightIcon },
  { value: "middleLeft", icon: middleLeftIcon },
  { value: "middleCenter", icon: middleCenterIcon },
  { value: "middleRight", icon: middleRightIcon },
  { value: "bottomLeft", icon: bottomLeftIcon },
  { value: "bottomCenter", icon: bottomCenterIcon },
  { value: "bottomRight", icon: bottomRightIcon },
];

export function TextAlignmentControl({
  value,
  onChange,
  label,
  labels,
  disabled,
}: {
  value: PosterAlignment;
  onChange: (value: PosterAlignment) => void;
  label: string;
  labels: Record<PosterAlignment, string>;
  disabled?: boolean;
}) {
  return (
    <div aria-label={label} className={styles.root} role="group">
      {choices.map(({ value: choice, icon }) => (
        <button
          aria-label={labels[choice]}
          aria-pressed={value === choice}
          className={styles.choice}
          disabled={disabled}
          key={choice}
          onClick={() => onChange(choice)}
          title={labels[choice]}
          type="button"
        >
          <SvgIcon className={styles.icon} svg={icon.replaceAll('#292D32', 'currentColor')} />
        </button>
      ))}
    </div>
  );
}
