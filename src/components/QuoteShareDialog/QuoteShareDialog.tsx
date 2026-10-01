import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { controlIndicatorTransition } from "../motionTransitions";
import sunIcon from "../../icons/sun.svg?raw";
import moonIcon from "../../icons/moon.svg?raw";
import type { Locale, Quote, ThemeName } from "../../store/collectionStore";
import { createTranslator } from "../../i18n/translate";
import {
  FullScreenDialog,
  ModalCloseButton,
  MotionButton,
  OptionMenu,
  RangeSlider,
  SegmentedControl,
  SvgIcon,
  Text,
} from "../ui";
import { quoteShareMessages } from "./QuoteShareDialog.messages";
import {
  downloadPoster,
  fitPosterFontSize,
  posterFilename,
  posterDimensions,
  posterFormats,
  renderQuotePoster,
  type PosterFormat,
  type PosterAlignment,
  type PosterOptions,
} from "./quotePoster";
import { TextAlignmentControl } from "./TextAlignmentControl";
import styles from "./QuoteShareDialog.module.css";

const formats: PosterFormat[] = [
  "a2",
  // "a3", "a4",
  "ratio4x5",
  "ratio1x1",
  "ratio16x9",
  "ratio9x16",
];
const conditionalMotion = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
  transition: { duration: 0.16, ease: "easeOut" },
} as const;

const defaultOptions: PosterOptions = {
  format: "ratio4x5",
  fontSize: 20,
  dark: false,
  logo: true,
  textAlignment: "topLeft",
  sourceAlignment: "topLeft",
  sharedAlignment: true,
  margin: 4,
  decoratedCorners: true,
};

function PosterPreview({
  quote,
  options,
  locale,
  onReady,
}: {
  quote: Quote;
  options: PosterOptions;
  locale: Locale;
  onReady: (ready: boolean) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [renderedOptions, setRenderedOptions] = useState(options);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const t = createTranslator(quoteShareMessages, locale);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const updateSize = () => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      setStageSize((current) =>
        current.width === width && current.height === height
          ? current
          : { width, height },
      );
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(stage);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!stageSize.width || !stageSize.height) return;
    let cancelled = false;
    setLoading(true);
    onReady(false);
    const frame = requestAnimationFrame(() => {
      const canvas = document.createElement("canvas");
      const dimensions = posterDimensions(options.format);
      const scale = Math.min(
        stageSize.width / dimensions.width,
        stageSize.height / dimensions.height,
      );
      const previewWidth = Math.max(
        1,
        Math.round(dimensions.width * scale * 2),
      );
      void renderQuotePoster(canvas, quote, options, previewWidth)
        .then(() => {
          const target = canvasRef.current;
          if (cancelled || !target) return;
          target.width = canvas.width;
          target.height = canvas.height;
          target.getContext("2d")?.drawImage(canvas, 0, 0);
          setError(null);
          setRenderedOptions(options);
          onReady(true);
        })
        .catch((reason: unknown) => {
          if (!cancelled) {
            setError(reason instanceof Error ? reason.message : "render-error");
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [quote, options, stageSize, onReady]);

  const visibleOptions = renderedOptions;
  const dimensions = posterDimensions(visibleOptions.format);
  const scale = Math.min(
    stageSize.width / dimensions.width,
    stageSize.height / dimensions.height,
  );
  return (
    <div className={styles.previewContainer}>
      <div className={styles.previewFrame} aria-busy={loading}>
        <div className={styles.previewStage} ref={stageRef}>
          <div
            className={styles.preview}
            data-dark={visibleOptions.dark}
            style={{
              width: Math.round(dimensions.width * scale),
              height: Math.round(dimensions.height * scale),
              background: visibleOptions.dark ? "#10100f" : "#ffffff",
            }}
          >
            <canvas
              aria-hidden="true"
              className={styles.canvas}
              ref={canvasRef}
            />
          </div>
        </div>
      </div>
      <AnimatePresence initial={false} mode="popLayout">
        {error ? (
          <motion.p {...conditionalMotion} className={styles.previewMessage} key={error} role="status">
            {t(error === "quote-too-long" ? "tooLong" : "renderError")}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function QuoteShareDialog({
  locale,
  quote,
  theme,
  onClose,
}: {
  locale: Locale;
  quote: Quote;
  theme: ThemeName;
  onClose: () => void;
}) {
  const t = createTranslator(quoteShareMessages, locale);
  const titleId = useId();
  const menuPortalRef = useRef<HTMLDivElement>(null);
  const [options, setOptions] = useState<PosterOptions>(() => ({
    ...defaultOptions,
    dark: theme === "dark",
  }));
  const [initialized, setInitialized] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const controlsScrollRef = useRef<HTMLDivElement>(null);
  const controlsContentRef = useRef<HTMLDivElement>(null);
  const previewColumnRef = useRef<HTMLDivElement>(null);
  const [controlsHeight, setControlsHeight] = useState(584);
  const [scrollEdges, setScrollEdges] = useState({ top: false, bottom: false });
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<"exportError" | "tooLong" | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const mounted = useRef(true);
  const resetDownloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (resetDownloadTimer.current) clearTimeout(resetDownloadTimer.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const initialOptions = { ...defaultOptions, dark: theme === "dark" };
    setInitialized(false);
    setPreviewReady(false);
    void fitPosterFontSize(quote, initialOptions)
      .then((fontSize) => {
        if (!cancelled) setOptions({ ...initialOptions, fontSize });
      })
      .catch(() => {
        // The preview reports asset errors through its existing localized status.
        if (!cancelled) setOptions(initialOptions);
      })
      .finally(() => {
        if (!cancelled) setInitialized(true);
      });
    return () => { cancelled = true; };
  }, [quote, theme]);

  useLayoutEffect(() => {
    const scroll = controlsScrollRef.current;
    const content = controlsContentRef.current;
    const previewColumn = previewColumnRef.current;
    if (!scroll || !content || !previewColumn) return;
    const updateEdges = () => {
      setControlsHeight(previewColumn.clientHeight);
      const top = scroll.scrollTop > 1;
      const bottom = scroll.scrollTop + scroll.clientHeight < scroll.scrollHeight - 1;
      setScrollEdges((current) => current.top === top && current.bottom === bottom
        ? current : { top, bottom });
    };
    updateEdges();
    scroll.addEventListener("scroll", updateEdges, { passive: true });
    const observer = new ResizeObserver(updateEdges);
    observer.observe(scroll);
    observer.observe(content);
    observer.observe(previewColumn);
    return () => {
      scroll.removeEventListener("scroll", updateEdges);
      observer.disconnect();
    };
  }, []);

  function changeOptions(change: Partial<PosterOptions>) {
    if (resetDownloadTimer.current) clearTimeout(resetDownloadTimer.current);
    setPreviewReady(false);
    setOptions((current) => ({ ...current, ...change }));
    setError(null);
    setDownloaded(false);
  }

  async function exportQuote() {
    if (exporting || !previewReady) return;
    if (resetDownloadTimer.current) clearTimeout(resetDownloadTimer.current);
    setExporting(true);
    setError(null);
    setDownloaded(false);
    try {
      const canvas = document.createElement("canvas");
      await renderQuotePoster(canvas, quote, options);
      await downloadPoster(canvas, posterFilename(quote.source));
      if (mounted.current) {
        setDownloaded(true);
        resetDownloadTimer.current = setTimeout(() => {
          setDownloaded(false);
          resetDownloadTimer.current = null;
        }, 2600);
      }
    } catch (reason) {
      if (mounted.current) {
        setError(
          reason instanceof Error && reason.message === "quote-too-long"
            ? "tooLong"
            : "exportError",
        );
      }
    } finally {
      if (mounted.current) setExporting(false);
    }
  }

  function formatLabel(format: PosterFormat) {
    const { width, height } = posterFormats[format];
    return (
      <>
        <span>
          {width} × {height}
        </span>
        <span className={styles.formatName}>{t(format)}</span>
      </>
    );
  }

  const alignmentLabels = {
    topLeft: t("topLeft"),
    topCenter: t("topCenter"),
    topRight: t("topRight"),
    middleLeft: t("middleLeft"),
    middleCenter: t("middleCenter"),
    middleRight: t("middleRight"),
    bottomLeft: t("bottomLeft"),
    bottomCenter: t("bottomCenter"),
    bottomRight: t("bottomRight"),
  } satisfies Record<PosterAlignment, string>;
  const downloadState = exporting ? "loading" : downloaded ? "success" : "idle";
  const sharedAlignment = options.sharedAlignment;
  const controlsDisabled = exporting || !initialized;

  return (
    <MotionConfig reducedMotion="user">
      <FullScreenDialog
        aria-labelledby={titleId}
        className={styles.backdrop}
        closeOnBackdrop={false}
        contentClassName={styles.dialog}
        onClose={onClose}
      >
        <header className={styles.header}>
          <ModalCloseButton
            aria-label={t("close")}
            onClick={onClose}
            title={t("close")}
          />
          <Text as="h1" className={styles.title} id={titleId} variant="title">
            <span className={styles.quoteMark}>„</span>
            {t("title")}
            <span className={styles.quoteMark}>“</span>
          </Text>
        </header>
        <motion.div className={styles.layout} layoutRoot>
          <div className={styles.previewColumn} ref={previewColumnRef}>
            {initialized ? (
              <PosterPreview
                locale={locale}
                onReady={setPreviewReady}
                options={options}
                quote={quote}
              />
            ) : <div className={styles.previewFrame} aria-busy="true" />}
            <SegmentedControl
              disabled={controlsDisabled}
              label={t("theme")}
              onChange={(value) => changeOptions({ dark: value === "dark" })}
              options={[
                {
                  value: "light",
                  label: <SvgIcon svg={sunIcon} />,
                  ariaLabel: t("light"),
                  iconOnly: true,
                },
                {
                  value: "dark",
                  label: <SvgIcon svg={moonIcon} />,
                  ariaLabel: t("dark"),
                  iconOnly: true,
                },
              ]}
              value={options.dark ? "dark" : "light"}
            />
          </div>
          <div
            className={styles.controls}
            style={{ "--controls-height": `${controlsHeight}px` } as CSSProperties}
          >
            <motion.div
              className={styles.controlsScroll}
              layoutScroll
              data-scroll-top={scrollEdges.top}
              data-scroll-bottom={scrollEdges.bottom}
              ref={controlsScrollRef}
            >
              <div className={styles.controlsContent} ref={controlsContentRef}>
                <div className={styles.control}>
                  <span className={styles.label}>{t("format")}</span>
                  <OptionMenu
                    disabled={controlsDisabled}
                    label={t("format")}
                    onChange={(format) => changeOptions({ format })}
                    options={formats.map((format) => ({
                      value: format,
                      label: formatLabel(format),
                      textValue: `${posterFormats[format].width} × ${posterFormats[format].height} ${t(format)}`,
                    }))}
                    portalContainer={menuPortalRef}
                    triggerContent={formatLabel(options.format)}
                    value={options.format}
                  />
                </div>
                <RangeSlider
                  disabled={controlsDisabled}
                  label={t("fontSize")}
                  max={40}
                  min={10}
                  onChange={(fontSize) => changeOptions({ fontSize })}
                  step={1}
                  value={options.fontSize}
                />
                <RangeSlider
                  disabled={controlsDisabled}
                  label={t("margin")}
                  valueSuffix="%"
                  max={10}
                  min={0}
                  onChange={(margin) => changeOptions({ margin })}
                  step={0.5}
                  value={options.margin}
                />
                <div className={styles.control}>
                  <span className={styles.label}>{t("alignment")}</span>
                  <label className={styles.alignmentToggle}>
                    <span className={styles.sublabel}>{t("sharedAlignment")}</span>
                    <button
                      aria-checked={sharedAlignment}
                      aria-label={t("sharedAlignment")}
                      className={styles.switch}
                      disabled={controlsDisabled}
                      onClick={() => {
                        const next = !sharedAlignment;
                        changeOptions({
                          sharedAlignment: next,
                          ...(next ? { sourceAlignment: options.textAlignment } : {}),
                        });
                      }}
                      role="switch"
                      type="button"
                    >
                      <motion.span
                        className={styles.switchThumb}
                        layout="position"
                        transition={controlIndicatorTransition}
                      />
                    </button>
                  </label>
                  <motion.div className={styles.positionControls} layout="position" transition={controlIndicatorTransition}>
                    <motion.div className={styles.alignmentControl} layout="position" transition={controlIndicatorTransition}>
                      <AnimatePresence initial={false} mode="popLayout">
                        {!sharedAlignment && (
                          <motion.span {...conditionalMotion} className={styles.sublabel} key="text-label">{t("text")}</motion.span>
                        )}
                      </AnimatePresence>
                      <TextAlignmentControl
                        disabled={controlsDisabled}
                        label={t(sharedAlignment ? "alignment" : "textAlignment")}
                        labels={alignmentLabels}
                        onChange={(textAlignment) => changeOptions({
                          textAlignment,
                          ...(sharedAlignment ? { sourceAlignment: textAlignment } : {}),
                        })}
                        value={options.textAlignment}
                      />
                    </motion.div>
                    <AnimatePresence initial={false} mode="popLayout">
                      {!sharedAlignment && (
                        <motion.div
                          {...conditionalMotion}
                          className={styles.alignmentControl}
                          key="source-alignment"
                          layout="position"
                        >
                          <span className={styles.sublabel}>{t("source")}</span>
                          <TextAlignmentControl
                            disabled={controlsDisabled}
                            label={t("sourceAlignment")}
                            labels={alignmentLabels}
                            onChange={(sourceAlignment) => changeOptions({ sourceAlignment })}
                            value={options.sourceAlignment}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
                <motion.div className={styles.toggleControls} layout="position" transition={controlIndicatorTransition}>
                  <div className={styles.control}>
                    <span className={styles.label}>{t("logo")}</span>
                    <SegmentedControl
                      className={styles.logoControl}
                      disabled={controlsDisabled}
                      label={t("logo")}
                      onChange={(logo) => changeOptions({ logo: logo === "on" })}
                      options={[
                        { value: "on", label: t("on") },
                        { value: "off", label: t("off") },
                      ]}
                      value={options.logo ? "on" : "off"}
                    />
                  </div>
                  <div className={styles.control}>
                    <span className={styles.label}>{t("decoratedCorners")}</span>
                    <SegmentedControl
                      className={styles.logoControl}
                      disabled={controlsDisabled}
                      label={t("decoratedCorners")}
                      onChange={(value) => changeOptions({ decoratedCorners: value === "on" })}
                      options={[
                        { value: "on", label: t("on") },
                        { value: "off", label: t("off") },
                      ]}
                      value={options.decoratedCorners ? "on" : "off"}
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
            <div className={styles.downloadFooter}>
              <MotionButton
                aria-label={t(exporting ? "working" : downloaded ? "downloaded" : "download")}
                className={styles.downloadButton}
                data-state={downloadState}
                disabled={exporting || downloaded || !previewReady}
                layout="size"
                onClick={() => void exportQuote()}
                size="big"
                transition={{ layout: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
                variant="primary"
              >
                <AnimatePresence initial={false} mode="wait">
                  <motion.span
                    animate={{ opacity: 1, scale: 1 }}
                    className={styles.downloadContent}
                    exit={{ opacity: 0, scale: 0.75 }}
                    initial={{ opacity: 0, scale: 0.75 }}
                    key={downloadState}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                  >
                    {exporting ? (
                      <span aria-hidden="true" className={styles.spinner} />
                    ) : downloaded ? (
                      <svg aria-hidden="true" className={styles.checkmark} viewBox="0 0 20 20">
                        <path d="m4 10 4 4 8-8" />
                      </svg>
                    ) : t("download")}
                  </motion.span>
                </AnimatePresence>
              </MotionButton>
              <AnimatePresence initial={false} mode="popLayout">
                {error ? <motion.p {...conditionalMotion} className={styles.status} key={error} role="status">{t(error)}</motion.p> : null}
              </AnimatePresence>
              <span className={styles.srOnly} role="status">{downloaded ? t("downloaded") : ""}</span>
            </div>
          </div>
        </motion.div>
        <div ref={menuPortalRef} />
      </FullScreenDialog>
    </MotionConfig>
  );
}
