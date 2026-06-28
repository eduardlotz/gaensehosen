import { AnimatePresence, motion } from "motion/react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import chevronIcon from "../../icons/chevron.svg?raw";
import { SvgIcon } from "../ui";
import styles from "./WelcomeSlider.module.css";

export type WelcomeSlide = {
  text: string;
  source: string;
};

type WelcomeSliderProps = {
  slides: WelcomeSlide[];
};

const slideIntervalMs = 7000;
const slideIntervalSeconds = slideIntervalMs / 1000;
const slideTransitionMs = 620;
const slideTransition = {
  duration: slideTransitionMs / 1000,
  ease: [0.2, 0.8, 0.2, 1],
} as const;

export function WelcomeSlider({ slides }: WelcomeSliderProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const activeSlide = slides[activeSlideIndex] ?? slides[0];

  useEffect(() => {
    setActiveSlideIndex(0);
  }, [slides]);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveSlideIndex((index) => (index + 1) % slides.length);
    }, slideIntervalMs);

    return () => window.clearTimeout(timer);
  }, [activeSlideIndex, slides.length]);

  function showPreviousSlide() {
    setActiveSlideIndex((index) => (index - 1 + slides.length) % slides.length);
  }

  function showNextSlide() {
    setActiveSlideIndex((index) => (index + 1) % slides.length);
  }

  function showSlide(index: number) {
    setActiveSlideIndex(index);
  }

  if (!activeSlide) {
    return null;
  }

  return (
    <>
      <div className={styles.heroQuote} aria-live="polite">
        <div className={styles.heroClip}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              animate={{ opacity: 1, filter: "blur(0px)" }}
              className={styles.heroSlide}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              key={`${activeSlideIndex}-${activeSlide.source}`}
              transition={slideTransition}
            >
              <blockquote className={styles.heroText}>
                <span className={styles.quoteMark}>„</span>
                {activeSlide.text}
                <span className={styles.quoteMark}>“</span>
              </blockquote>
              <cite className={styles.heroSource}>{activeSlide.source}</cite>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {slides.length > 1 ? (
        <div
          aria-label={`Welcome quote slides, autoplay every ${slideIntervalSeconds} seconds`}
          className={styles.stepper}
          style={
            {
              "--step-duration": `${slideTransitionMs}ms`,
              "--step-fill-duration": `${slideIntervalMs}ms`,
            } as CSSProperties
          }
        >
          <button
            aria-label="Previous welcome quote"
            className={`${styles.stepperButton} ${styles.previousButton}`}
            onClick={showPreviousSlide}
            type="button"
          >
            <SvgIcon className={styles.stepperIcon} svg={chevronIcon} />
          </button>

          <div className={styles.steps} role="tablist">
            {slides.map((slide, index) => (
              <button
                aria-label={`${index + 1}: ${slide.source || "Unknown"}`}
                aria-selected={activeSlideIndex === index}
                className={styles.step}
                data-active={activeSlideIndex === index}
                key={`${slide.source}-${index}`}
                onClick={() => showSlide(index)}
                role="tab"
                tabIndex={activeSlideIndex === index ? 0 : -1}
                type="button"
              />
            ))}
          </div>

          <button
            aria-label="Next welcome quote"
            className={`${styles.stepperButton} ${styles.nextButton}`}
            onClick={showNextSlide}
            type="button"
          >
            <SvgIcon className={styles.stepperIcon} svg={chevronIcon} />
          </button>
        </div>
      ) : null}
    </>
  );
}
