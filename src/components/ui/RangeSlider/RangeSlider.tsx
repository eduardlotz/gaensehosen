import { Slider } from "@base-ui/react/slider";
import styles from "./RangeSlider.module.css";

type RangeSliderProps = {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  valueSuffix?: string;
};

export function RangeSlider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  disabled,
  valueSuffix = "px",
}: RangeSliderProps) {
  return (
    <Slider.Root
      className={styles.root}
      disabled={disabled}
      max={max}
      min={min}
      onValueChange={onChange}
      step={step}
      value={value}
    >
      <Slider.Label className={styles.label}>{label}</Slider.Label>
      <div className={styles.pill}>
        {value !== min && <span aria-hidden="true" className={`${styles.bound} ${styles.minimum}`}>{min}</span>}
        <Slider.Control className={styles.control}>
          <Slider.Track className={styles.track} />
          <Slider.Thumb
            className={styles.thumb}
            getAriaValueText={(_, currentValue) => `${Math.round(currentValue * 10) / 10}${valueSuffix}`}
          >{Math.round(value * 10) / 10}</Slider.Thumb>
        </Slider.Control>
        {value !== max && <span aria-hidden="true" className={`${styles.bound} ${styles.maximum}`}>{max}</span>}
      </div>
    </Slider.Root>
  );
}
