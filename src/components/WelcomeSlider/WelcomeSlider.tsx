import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import styles from "./WelcomeSlider.module.css";

export type WelcomeSlide = {
  text: string;
  source: string;
};

type WelcomeSliderProps = {
  slides: WelcomeSlide[];
};

const slideIntervalMs = 7000;
const slideTransition = {
  duration: 0.62,
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

    const interval = window.setInterval(() => {
      setActiveSlideIndex((index) => (index + 1) % slides.length);
    }, slideIntervalMs);

    return () => window.clearInterval(interval);
  }, [slides.length]);

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

      <div className={styles.dots} role="tablist">
        {slides.map((slide, index) => (
          <button
            aria-label={`${index + 1}: ${slide.source}`}
            aria-selected={activeSlideIndex === index}
            className={styles.dot}
            data-active={activeSlideIndex === index}
            key={`${slide.source}-${index}`}
            onClick={() => setActiveSlideIndex(index)}
            role="tab"
            type="button"
          />
        ))}
      </div>
    </>
  );
}
