import type { PosterAlignment } from "./quotePoster";
import styles from "./TextAlignmentControl.module.css";

const choices: { value: PosterAlignment; icon: "topLeft" | "topCenter" | "topRight" | "middleLeft" | "middleCenter"; flip?: string }[] = [
  { value: "topLeft", icon: "topLeft" },
  { value: "topCenter", icon: "topCenter" },
  { value: "topRight", icon: "topRight" },
  { value: "middleLeft", icon: "middleLeft" },
  { value: "middleCenter", icon: "middleCenter" },
  { value: "middleRight", icon: "middleLeft", flip: "scaleX(-1)" },
  { value: "bottomLeft", icon: "topLeft", flip: "scaleY(-1)" },
  { value: "bottomCenter", icon: "topCenter", flip: "scaleY(-1)" },
  { value: "bottomRight", icon: "topRight", flip: "scaleY(-1)" },
];

const strokes = {
  topLeft: [[4, 5, 18], [4, 9, 13], [4, 13, 10]],
  topCenter: [[3, 5, 21], [6, 9, 18], [8, 13, 16]],
  topRight: [[6, 5, 20], [11, 9, 20], [14, 13, 20]],
  middleLeft: [[4, 8, 18], [4, 12, 13], [4, 16, 10]],
  middleCenter: [[3, 8, 21], [6, 12, 18], [8, 16, 16]],
} as const;

function AlignmentIcon({ name, flip }: { name: keyof typeof strokes; flip?: string }) {
  return (
    <svg aria-hidden="true" className={styles.icon} style={{ transform: flip }} viewBox="0 0 24 24">
      {strokes[name].map(([x1, y, x2], index) => (
        <line key={index} x1={x1} x2={x2} y1={y} y2={y} />
      ))}
    </svg>
  );
}

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
      {choices.map(({ value: choice, icon, flip }) => (
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
          <AlignmentIcon flip={flip} name={icon} />
        </button>
      ))}
    </div>
  );
}
