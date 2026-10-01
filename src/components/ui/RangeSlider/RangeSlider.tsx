import { Slider } from "@base-ui/react/slider";
import { AnimatePresence, motion } from "motion/react";
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
        <AnimatePresence initial={false}>
          {value !== min && (
            <motion.span
              animate={{ opacity: 1 }}
              aria-hidden="true"
              className={`${styles.bound} ${styles.minimum}`}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="minimum"
              transition={{ duration: 0.16 }}
            >{min}</motion.span>
          )}
        </AnimatePresence>
        <Slider.Control className={styles.control}>
          <Slider.Track className={styles.track} />
          <Slider.Thumb
            className={styles.thumb}
            getAriaValueText={(_, currentValue) => `${Math.round(currentValue * 10) / 10}${valueSuffix}`}
          >{Math.round(value * 10) / 10}</Slider.Thumb>
        </Slider.Control>
        <AnimatePresence initial={false}>
          {value !== max && (
            <motion.span
              animate={{ opacity: 1 }}
              aria-hidden="true"
              className={`${styles.bound} ${styles.maximum}`}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="maximum"
              transition={{ duration: 0.16 }}
            >{max}</motion.span>
          )}
        </AnimatePresence>
      </div>
    </Slider.Root>
  );
}
