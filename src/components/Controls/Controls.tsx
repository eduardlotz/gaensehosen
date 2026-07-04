import focusIcon from "../../icons/focus-view.svg?raw";
import gridIcon from "../../icons/grid-view.svg?raw";
import listIcon from "../../icons/list-view.svg?raw";
import masonryIcon from "../../icons/masonry-view.svg?raw";
import threeDotsIcon from "../../icons/three-dots.svg?raw";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { controlIndicatorTransition } from "../motionTransitions";
import { useIsMobile } from "../../hooks/useIsMobile";
import { createTranslator } from "../../i18n/translate";
import type { FontSize, GridMode, Locale } from "../../store/collectionStore";
import type { KeyboardShortcutItem } from "../../utils/keyboardShortcuts";
import { ShortcutTooltip } from "../ShortcutTooltip";
import { SvgIcon } from "../ui";
import { classNames } from "../ui/classNames";
import { controlsMessages } from "./Controls.messages";
import styles from "./Controls.module.css";

type ControlsTranslationKey = keyof (typeof controlsMessages)["de"];

const fontSizes: FontSize[] = [16, 24, 32, 40];
const gridModes = [
  { value: "masonry", icon: masonryIcon, labelKey: "gridMasonry" },
  { value: "grid", icon: gridIcon, labelKey: "gridGrid" },
  { value: "list", icon: listIcon, labelKey: "gridList" },
  { value: "focus", icon: focusIcon, labelKey: "gridFocus" },
] satisfies {
  value: GridMode;
  icon: string;
  labelKey: ControlsTranslationKey;
}[];

export type MobileControlOptionsOpen = "grid" | "fontSize" | null;

type ControlsProps = {
  locale: Locale;
  fontSize: FontSize;
  gridMode: GridMode;
  shortcuts?: {
    fontSizes: Record<FontSize, KeyboardShortcutItem>;
    gridModes: Record<GridMode, KeyboardShortcutItem>;
  };
  onFontSizeChange: (fontSize: FontSize) => void;
  onGridModeChange: (gridMode: GridMode) => void;
  mobileOptionsOpen?: MobileControlOptionsOpen;
  onMobileOptionsOpenChange?: (open: MobileControlOptionsOpen) => void;
};

export function Controls({
  locale,
  fontSize,
  gridMode,
  shortcuts,
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
        shortcuts={shortcuts}
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
      shortcuts={shortcuts}
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
  shortcuts,
  onFontSizeChange,
  onGridModeChange,
  onMobileOptionsOpenChange,
}: ControlsProps) {
  useEffect(() => {
    onMobileOptionsOpenChange?.(null);
  }, [onMobileOptionsOpenChange]);

  return (
    <>
      <div
        className={`${styles.controlDock} ${styles.gridDock}`}
        data-control-shortcut-target="grid"
      >
        <GridSegmentedControl
          gridMode={gridMode}
          layoutId="desktop-grid-control-active"
          locale={locale}
          shortcuts={shortcuts?.gridModes}
          onGridModeChange={onGridModeChange}
        />
      </div>

      <div
        className={`${styles.controlDock} ${styles.sizeDock}`}
        data-control-shortcut-target="fontSize"
      >
        <FontSizeSegmentedControl
          fontSize={fontSize}
          layoutId="desktop-font-size-control-active"
          locale={locale}
          shortcuts={shortcuts?.fontSizes}
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
  shortcuts,
  mobileOptionsOpen = null,
  onFontSizeChange,
  onGridModeChange,
  onMobileOptionsOpenChange,
}: ControlsProps) {
  const t = createTranslator(controlsMessages, locale);
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
            data-control-shortcut-target="grid"
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
                    shortcuts={shortcuts?.gridModes}
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
                  <SegmentedControl label={t("grid")}>
                    <MaybeShortcutTooltip
                      label={
                        activeGridMode
                          ? t(activeGridMode.labelKey)
                          : t("grid")
                      }
                      shortcut={shortcuts?.gridModes[gridMode]}
                    >
                      <button
                        className={classNames(styles.segment, styles.iconSegment)}
                        data-active="true"
                        onClick={() => onGridModeChange(gridMode)}
                        title={
                          activeGridMode
                            ? t(activeGridMode.labelKey)
                            : t("grid")
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
                    </MaybeShortcutTooltip>
                    <MaybeShortcutTooltip
                      label={t("grid")}
                      shortcut={undefined}
                    >
                      <button
                        aria-expanded={gridOptionsOpen}
                        className={classNames(styles.segment, styles.iconSegment)}
                        onClick={() => onMobileOptionsOpenChange?.("grid")}
                        title={t("options")}
                        type="button"
                      >
                        <span className={styles.segmentContent}>
                          <SvgIcon className={styles.icon} svg={threeDotsIcon} />
                        </span>
                      </button>
                    </MaybeShortcutTooltip>
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
            data-control-shortcut-target="fontSize"
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
                    shortcuts={shortcuts?.fontSizes}
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
                  <SegmentedControl label={t("fontSize")}>
                    <MaybeShortcutTooltip
                      label={t("fontSize")}
                      shortcut={undefined}
                    >
                      <button
                        aria-expanded={fontSizeOptionsOpen}
                        className={classNames(styles.segment, styles.iconSegment)}
                        onClick={() => onMobileOptionsOpenChange?.("fontSize")}
                        title={t("options")}
                        type="button"
                      >
                        <span className={styles.segmentContent}>
                          <SvgIcon className={styles.icon} svg={threeDotsIcon} />
                        </span>
                      </button>
                    </MaybeShortcutTooltip>
                    <MaybeShortcutTooltip
                      label={`${t("fontSize")} ${fontSize}`}
                      shortcut={shortcuts?.fontSizes[fontSize]}
                    >
                      <button
                        className={styles.segment}
                        data-active="true"
                        onClick={() => onFontSizeChange(fontSize)}
                        title={`${t("fontSize")} ${fontSize}`}
                        type="button"
                      >
                        <ActiveIndicator layoutId="mobile-font-size-control-active" />
                        <span className={styles.segmentContent}>{fontSize}</span>
                      </button>
                    </MaybeShortcutTooltip>
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
  shortcuts?: Record<GridMode, KeyboardShortcutItem>;
  onGridModeChange: (gridMode: GridMode) => void;
};

function GridSegmentedControl({
  gridMode,
  layoutId,
  locale,
  shortcuts,
  onGridModeChange,
}: GridSegmentedControlProps) {
  const t = createTranslator(controlsMessages, locale);
  return (
    <SegmentedControl label={t("grid")}>
      {gridModes.map(({ value, icon, labelKey }) => {
        const active = gridMode === value;

        return (
          <MaybeShortcutTooltip
            key={value}
            label={t(labelKey)}
            shortcut={shortcuts?.[value]}
          >
            <button
              className={classNames(styles.segment, styles.iconSegment)}
              data-active={active}
              onClick={() => onGridModeChange(value)}
              title={t(labelKey)}
              type="button"
            >
              {active ? <ActiveIndicator layoutId={layoutId} /> : null}
              <span className={styles.segmentContent}>
                <SvgIcon className={styles.icon} svg={icon} />
              </span>
            </button>
          </MaybeShortcutTooltip>
        );
      })}
    </SegmentedControl>
  );
}

type FontSizeSegmentedControlProps = {
  fontSize: FontSize;
  layoutId: string;
  locale: Locale;
  shortcuts?: Record<FontSize, KeyboardShortcutItem>;
  onFontSizeChange: (fontSize: FontSize) => void;
};

function FontSizeSegmentedControl({
  fontSize,
  layoutId,
  locale,
  shortcuts,
  onFontSizeChange,
}: FontSizeSegmentedControlProps) {
  const t = createTranslator(controlsMessages, locale);
  return (
    <SegmentedControl label={t("fontSize")}>
      {fontSizes.map((size) => {
        const active = fontSize === size;

        return (
          <MaybeShortcutTooltip
            key={size}
            label={`${t("fontSize")} ${size}`}
            shortcut={shortcuts?.[size]}
          >
            <button
              className={styles.segment}
              data-active={active}
              onClick={() => onFontSizeChange(size)}
              title={`${t("fontSize")} ${size}`}
              type="button"
            >
              {active ? <ActiveIndicator layoutId={layoutId} /> : null}
              <span className={styles.segmentContent}>{size}</span>
            </button>
          </MaybeShortcutTooltip>
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

type MaybeShortcutTooltipProps = {
  children: ReactNode;
  label: string;
  shortcut?: KeyboardShortcutItem;
};

function MaybeShortcutTooltip({
  children,
  label,
  shortcut,
}: MaybeShortcutTooltipProps) {
  if (!shortcut) {
    return children;
  }

  return (
    <ShortcutTooltip label={label} shortcut={shortcut}>
      {children as ReactElementWithShortcutTooltip}
    </ShortcutTooltip>
  );
}

type ReactElementWithShortcutTooltip = Parameters<
  typeof ShortcutTooltip
>[0]["children"];
