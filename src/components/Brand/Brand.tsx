import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { createTranslator } from "../../i18n/translate";
import type { Locale } from "../../store/collectionStore";
import { useCollectionStore } from "../../store/collectionStore";
import wordmarkSvg from "../../brand/wordmark.svg?raw";
import symbolSvg from "../../brand/symbol.svg?raw";
import { SvgIcon } from "../ui";
import { brandMessages } from "./Brand.messages";
import styles from "./Brand.module.css";

type BrandProps = {
  locale: Locale;
};

const logoLayoutTransition = {
  ease: [0.22, 0.95, 0.48, 1.05],
  duration: 0.5,
} as const;

const logoAnimation = {
  initial: {
    opacity: 0,
    filter: "blur(4px)",
    scale: 0.9,
  },
  animate: { opacity: 1, filter: "blur(0px)", scale: 1 },
  exit: {
    opacity: 0,
    filter: "blur(4px)",
    scale: 1.1,
  },
} as const;

const logoContentTransition = {
  layout: logoLayoutTransition,
  opacity: { duration: 0.14, ease: "easeOut" },
  filter: { duration: 0.18, ease: "easeOut" },
} as const;

export function Brand({ locale }: BrandProps) {
  const t = createTranslator(brandMessages, locale);
  const logoVariant = useCollectionStore((state) => state.logoVariant);
  const setLogoVariant = useCollectionStore((state) => state.setLogoVariant);
  const [hasHydrated, setHasHydrated] = useState(
    useCollectionStore.persist.hasHydrated(),
  );

  useEffect(() => {
    setHasHydrated(useCollectionStore.persist.hasHydrated());
    return useCollectionStore.persist.onFinishHydration(() =>
      setHasHydrated(true),
    );
  }, []);

  const toggleLabel = t("toggleLogo");

  return (
    <motion.button
      aria-label={toggleLabel}
      className={styles.brand}
      data-hydrated={hasHydrated ? "true" : "false"}
      disabled={!hasHydrated}
      onClick={() =>
        setLogoVariant(logoVariant === "wordmark" ? "alternate" : "wordmark")
      }
      title={toggleLabel}
      transition={{
        layout: logoLayoutTransition,
      }}
      type="button"
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          {...logoAnimation}
          className={styles.logoMotion}
          key={logoVariant}
          layout
          layoutDependency={logoVariant}
          transition={logoContentTransition}
        >
          <SvgIcon className={styles.logo} svg={logoVariant === "wordmark" ? wordmarkSvg : symbolSvg} />
        </motion.span>
      </AnimatePresence>
      <span className={styles.srOnly}>{t("brand")}</span>
    </motion.button>
  );
}
