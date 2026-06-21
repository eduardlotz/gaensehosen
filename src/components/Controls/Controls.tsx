import focusIcon from "../../icons/focus-view.svg?raw";
import gridIcon from "../../icons/grid-view.svg?raw";
import listIcon from "../../icons/list-view.svg?raw";
import masonryIcon from "../../icons/masonry-view.svg?raw";
import threeDotsIcon from "../../icons/three-dots.svg?raw";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { controlIndicatorTransition } from "../motionTransitions";
import { useIsMobile } from "../../hooks/useIsMobile";
import type { FontSize, GridMode, Locale } from "../../store/collectionStore";
import { t } from "../../i18n/messages";
import { SvgIcon } from "../ui";
import { classNames } from "../ui/classNames";
import styles from "./Controls.module.css";

const fontSizes: FontSize[] = [16, 24, 32, 40];
const gridModes = [
  { value: "masonry", icon: masonryIcon, labelKey: "gridMasonry" },
  { value: "grid", icon: gridIcon, labelKey: "gridGrid" },
  { value: "list", icon: listIcon, labelKey: "gridList" },
  { value: "focus", icon: focusIcon, labelKey: "gridFocus" },
] satisfies { value: GridMode; icon: string; labelKey: Parameters<typeof t>[1] }[];

export type MobileControlOptionsOpen = "grid" | "fontSize" | null;

type ControlsProps = {
  locale: Locale;
  fontSize: FontSize;
  gridMode: GridMode;
  onFontSizeChange: (fontSize: FontSize) => void;
  onGridModeChange: (gridMode: GridMode) => void;
  mobileOptionsOpen?: MobileControlOptionsOpen;
  onMobileOptionsOpenChange?: (open: MobileControlOptionsOpen) => void;
};

export function Controls({
  locale,
  fontSize,
  gridMode,
  onFontSizeChange,
  onGridModeChange,
  mobileOptionsOpen,
  onMobileOptionsOpenChange,
}: ControlsProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileControls
        fontSize={fontSize}
        gridMode={gridMode}
        locale={locale}
        mobileOptionsOpen={mobileOptionsOpen}
        onFontSizeChange={onFontSizeChange}
        onGridModeChange={onGridModeChange}
        onMobileOptionsOpenChange={onMobileOptionsOpenChange}
      />
    );
  }

  return (
    <DesktopControls
      fontSize={fontSize}
      gridMode={gridMode}
      locale={locale}
      onFontSizeChange={onFontSizeChange}
      onGridModeChange={onGridModeChange}
      onMobileOptionsOpenChange={onMobileOptionsOpenChange}
    />
  );
}

function DesktopControls({
  locale,
  fontSize,
  gridMode,
  onFontSizeChange,
  onGridModeChange,
  onMobileOptionsOpenChange,
}: ControlsProps) {
  useEffect(() => {
    onMobileOptionsOpenChange?.(null);
  }, [onMobileOptionsOpenChange]);

  return (
    <>
      <div className={`${styles.controlDock} ${styles.gridDock}`}>
        <GridSegmentedControl
          gridMode={gridMode}
          layoutId="desktop-grid-control-active"
          locale={locale}
          onGridModeChange={onGridModeChange}
        />
      </div>

      <div className={`${styles.controlDock} ${styles.sizeDock}`}>
        <FontSizeSegmentedControl
          fontSize={fontSize}
          layoutId="desktop-font-size-control-active"
          locale={locale}
          onFontSizeChange={onFontSizeChange}
        />
      </div>
    </>
  );
}

function MobileControls({
  locale,
  fontSize,
  gridMode,
  mobileOptionsOpen = null,
  onFontSizeChange,
  onGridModeChange,
  onMobileOptionsOpenChange,
}: ControlsProps) {
  const optionsOpen = mobileOptionsOpen;
  const gridOptionsOpen = optionsOpen === "grid";
  const fontSizeOptionsOpen = optionsOpen === "fontSize";
  const activeGridMode = gridModes.find((mode) => mode.value === gridMode);

  useEffect(() => {
    onMobileOptionsOpenChange?.(optionsOpen);
  }, [onMobileOptionsOpenChange, optionsOpen]);

  function selectGridMode(nextGridMode: GridMode) {
    onGridModeChange(nextGridMode);
    onMobileOptionsOpenChange?.(null);
  }

  function selectFontSize(nextFontSize: FontSize) {
    onFontSizeChange(nextFontSize);
    onMobileOptionsOpenChange?.(null);
  }

  return (
    <>
      <AnimatePresence initial={false}>
        {fontSizeOptionsOpen ? null : (
          <motion.div
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            className={`${styles.controlDock} ${styles.gridDock}`}
            data-mobile-floating-controls=""
            exit={{ opacity: 0, x: -28, filter: "blur(10px)" }}
            initial={{ opacity: 0, x: -28, filter: "blur(10px)" }}
            key="mobile-grid-dock"
            layoutRoot
            transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {gridOptionsOpen ? (
                <motion.div
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  className={styles.mobileOptionsDock}
                  exit={{ opacity: 0, x: -8, filter: "blur(8px)" }}
                  initial={{ opacity: 0, x: -8, filter: "blur(8px)" }}
                  key="mobile-grid-options"
                  transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <GridSegmentedControl
                    gridMode={gridMode}
                    layoutId="mobile-grid-control-active"
                    locale={locale}
                    onGridModeChange={selectGridMode}
                  />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  className={styles.mobileClosedDock}
                  exit={{ opacity: 0, x: -8, filter: "blur(8px)" }}
                  initial={{ opacity: 0, x: -8, filter: "blur(8px)" }}
                  key="mobile-grid-closed"
                  transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <SegmentedControl label={t(locale, "grid")}>
                    <button
                      className={classNames(styles.segment, styles.iconSegment)}
                      data-active="true"
                      onClick={() => onGridModeChange(gridMode)}
                      title={
                        activeGridMode
                          ? t(locale, activeGridMode.labelKey)
                          : t(locale, "grid")
                      }
                      type="button"
                    >
                      <ActiveIndicator layoutId="mobile-grid-control-active" />
                      <span className={styles.segmentContent}>
                        <SvgIcon
                          className={styles.icon}
                          svg={activeGridMode?.icon ?? gridIcon}
                        />
                      </span>
                    </button>
                    <button
                      aria-expanded={gridOptionsOpen}
                      className={classNames(styles.segment, styles.iconSegment)}
                      onClick={() => onMobileOptionsOpenChange?.("grid")}
                      title={t(locale, "options")}
                      type="button"
                    >
                      <span className={styles.segmentContent}>
                        <SvgIcon className={styles.icon} svg={threeDotsIcon} />
                      </span>
                    </button>
                  </SegmentedControl>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {gridOptionsOpen ? null : (
          <motion.div
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            className={`${styles.controlDock} ${styles.sizeDock}`}
            data-mobile-floating-controls=""
            exit={{ opacity: 0, x: 28, filter: "blur(10px)" }}
            initial={{ opacity: 0, x: 28, filter: "blur(10px)" }}
            key="mobile-font-size-dock"
            layoutRoot
            transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {fontSizeOptionsOpen ? (
                <motion.div
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  className={styles.mobileOptionsDock}
                  exit={{ opacity: 0, x: 8, filter: "blur(8px)" }}
                  initial={{ opacity: 0, x: 8, filter: "blur(8px)" }}
                  key="mobile-font-size-options"
                  transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <FontSizeSegmentedControl
                    fontSize={fontSize}
                    layoutId="mobile-font-size-control-active"
                    locale={locale}
                    onFontSizeChange={selectFontSize}
                  />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  className={styles.mobileClosedDock}
                  exit={{ opacity: 0, x: 8, filter: "blur(8px)" }}
                  initial={{ opacity: 0, x: 8, filter: "blur(8px)" }}
                  key="mobile-font-size-closed"
                  transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <SegmentedControl label={t(locale, "fontSize")}>
                    <button
                      aria-expanded={fontSizeOptionsOpen}
                      className={classNames(styles.segment, styles.iconSegment)}
                      onClick={() => onMobileOptionsOpenChange?.("fontSize")}
                      title={t(locale, "options")}
                      type="button"
                    >
                      <span className={styles.segmentContent}>
                        <SvgIcon className={styles.icon} svg={threeDotsIcon} />
                      </span>
                    </button>
                    <button
                      className={styles.segment}
                      data-active="true"
                      onClick={() => onFontSizeChange(fontSize)}
                      title={`${t(locale, "fontSize")} ${fontSize}`}
                      type="button"
                    >
                      <ActiveIndicator layoutId="mobile-font-size-control-active" />
                      <span className={styles.segmentContent}>{fontSize}</span>
                    </button>
                  </SegmentedControl>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

type GridSegmentedControlProps = {
  gridMode: GridMode;
  layoutId: string;
  locale: Locale;
  onGridModeChange: (gridMode: GridMode) => void;
};

function GridSegmentedControl({
  gridMode,
  layoutId,
  locale,
  onGridModeChange,
}: GridSegmentedControlProps) {
  return (
    <SegmentedControl label={t(locale, "grid")}>
      {gridModes.map(({ value, icon, labelKey }) => {
        const active = gridMode === value;

        return (
          <button
            className={classNames(styles.segment, styles.iconSegment)}
            data-active={active}
            key={value}
            onClick={() => onGridModeChange(value)}
            title={t(locale, labelKey)}
            type="button"
          >
            {active ? <ActiveIndicator layoutId={layoutId} /> : null}
            <span className={styles.segmentContent}>
              <SvgIcon className={styles.icon} svg={icon} />
            </span>
          </button>
        );
      })}
    </SegmentedControl>
  );
}

type FontSizeSegmentedControlProps = {
  fontSize: FontSize;
  layoutId: string;
  locale: Locale;
  onFontSizeChange: (fontSize: FontSize) => void;
};

function FontSizeSegmentedControl({
  fontSize,
  layoutId,
  locale,
  onFontSizeChange,
}: FontSizeSegmentedControlProps) {
  return (
    <SegmentedControl label={t(locale, "fontSize")}>
      {fontSizes.map((size) => {
        const active = fontSize === size;

        return (
          <button
            className={styles.segment}
            data-active={active}
            key={size}
            onClick={() => onFontSizeChange(size)}
            title={`${t(locale, "fontSize")} ${size}`}
            type="button"
          >
            {active ? <ActiveIndicator layoutId={layoutId} /> : null}
            <span className={styles.segmentContent}>{size}</span>
          </button>
        );
      })}
    </SegmentedControl>
  );
}

type SegmentedControlProps = {
  children: ReactNode;
  label: string;
};

function SegmentedControl({ children, label }: SegmentedControlProps) {
  return (
    <div className={styles.segmented} aria-label={label}>
      {children}
    </div>
  );
}

type ActiveIndicatorProps = {
  layoutId: string;
};

function ActiveIndicator({ layoutId }: ActiveIndicatorProps) {
  return (
    <motion.span
      aria-hidden="true"
      className={styles.activeIndicator}
      layoutId={layoutId}
      transition={controlIndicatorTransition}
    />
  );
}
