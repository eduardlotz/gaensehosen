import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import sunIcon from "../../icons/sun.svg?raw";
import moonIcon from "../../icons/moon.svg?raw";
import type { Locale, Quote } from "../../store/collectionStore";
import { createTranslator } from "../../i18n/translate";
import {
  Button, FullScreenDialog, ModalCloseButton, OptionMenu, RangeSlider,
  SegmentedControl, SvgIcon, Text,
} from "../ui";
import { quoteShareMessages } from "./QuoteShareDialog.messages";
import {
  downloadPoster,
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
  "a2", "a3", "a4", "ratio4x5", "ratio1x1", "ratio16x9", "ratio9x16",
];
const defaultOptions: PosterOptions = {
  format: "a2",
  fontSize: 16,
  dark: false,
  logo: false,
  alignment: "bottomLeft",
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
      setStageSize((current) => current.width === width && current.height === height
        ? current : { width, height });
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
    let timer: ReturnType<typeof setTimeout>;
    setError(null);
    setLoading(true);
    onReady(false);
    timer = setTimeout(() => {
      const canvas = document.createElement("canvas");
      const dimensions = posterDimensions(options.format);
      const scale = Math.min(
        stageSize.width / dimensions.width,
        stageSize.height / dimensions.height,
      );
      const previewWidth = Math.max(1, Math.round(dimensions.width * scale * 2));
      void renderQuotePoster(canvas, quote, options, previewWidth)
      .then(() => {
        const target = canvasRef.current;
        if (cancelled || !target) return;
        target.width = canvas.width;
        target.height = canvas.height;
        target.getContext("2d")?.drawImage(canvas, 0, 0);
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
    }, 80);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [quote, options, stageSize, onReady]);

  const visibleOptions = error ? options : renderedOptions;
  const dimensions = posterDimensions(visibleOptions.format);
  const scale = Math.min(
    stageSize.width / dimensions.width,
    stageSize.height / dimensions.height,
  );
  return (
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
            style={{ visibility: error ? "hidden" : "visible" }}
          />
          {error ? (
            <p className={styles.previewMessage} role="status">
              {t(error === "quote-too-long" ? "tooLong" : "renderError")}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function QuoteShareDialog({
  locale,
  quote,
  onClose,
}: {
  locale: Locale;
  quote: Quote;
  onClose: () => void;
}) {
  const t = createTranslator(quoteShareMessages, locale);
  const titleId = useId();
  const menuPortalRef = useRef<HTMLDivElement>(null);
  const [options, setOptions] = useState<PosterOptions>(defaultOptions);
  const [previewReady, setPreviewReady] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<"exportError" | "tooLong" | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  function changeOptions(change: Partial<PosterOptions>) {
    setPreviewReady(false);
    setOptions((current) => ({ ...current, ...change }));
    setError(null);
    setDownloaded(false);
  }

  async function exportQuote() {
    if (exporting || !previewReady) return;
    setExporting(true);
    setError(null);
    setDownloaded(false);
    try {
      const canvas = document.createElement("canvas");
      await renderQuotePoster(canvas, quote, options);
      await downloadPoster(canvas, `gaensehosen-${options.format}.png`);
      if (mounted.current) setDownloaded(true);
    } catch (reason) {
      if (mounted.current) {
        setError(reason instanceof Error && reason.message === "quote-too-long"
          ? "tooLong"
          : "exportError");
      }
    } finally {
      if (mounted.current) setExporting(false);
    }
  }

  function formatLabel(format: PosterFormat) {
    const { width, height } = posterFormats[format];
    return (
      <>
        <span>{width} × {height}</span>
        <span className={styles.formatName}>{t(format)}</span>
      </>
    );
  }

  const alignmentLabels = {
    topLeft: t("topLeft"), topCenter: t("topCenter"), topRight: t("topRight"),
    middleLeft: t("middleLeft"), middleCenter: t("middleCenter"), middleRight: t("middleRight"),
    bottomLeft: t("bottomLeft"), bottomCenter: t("bottomCenter"), bottomRight: t("bottomRight"),
  } satisfies Record<PosterAlignment, string>;

  return (
    <FullScreenDialog
      aria-labelledby={titleId}
      className={styles.backdrop}
      closeOnBackdrop={false}
      contentClassName={styles.dialog}
      onClose={onClose}
    >
      <header className={styles.header}>
        <ModalCloseButton aria-label={t("close")} onClick={onClose} title={t("close")} />
        <Text as="h1" className={styles.title} id={titleId} variant="title">
          <span className={styles.quoteMark}>„</span>{t("title")}<span className={styles.quoteMark}>“</span>
        </Text>
      </header>
      <div className={styles.layout}>
        <div className={styles.previewColumn}>
          <PosterPreview locale={locale} onReady={setPreviewReady} options={options} quote={quote} />
          <SegmentedControl
            disabled={exporting}
            label={t("theme")}
            onChange={(value) => changeOptions({ dark: value === "dark" })}
            options={[
              {
                value: "light", label: <SvgIcon svg={sunIcon} />,
                ariaLabel: t("light"), iconOnly: true,
              },
              {
                value: "dark", label: <SvgIcon svg={moonIcon} />,
                ariaLabel: t("dark"), iconOnly: true,
              },
            ]}
            value={options.dark ? "dark" : "light"}
          />
        </div>
        <div className={styles.controls}>
          <div className={styles.control}>
            <span className={styles.label}>{t("format")}</span>
            <OptionMenu
              disabled={exporting}
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
            disabled={exporting}
            label={t("fontSize")}
            max={40}
            min={8}
            onChange={(fontSize) => changeOptions({ fontSize })}
            step={1}
            value={options.fontSize}
          />
          <div className={styles.control}>
            <span className={styles.label}>{t("alignment")}</span>
            <TextAlignmentControl
              disabled={exporting}
              label={t("alignment")}
              labels={alignmentLabels}
              onChange={(alignment) => changeOptions({ alignment })}
              value={options.alignment}
            />
          </div>
          <div className={styles.control}>
            <span className={styles.label}>{t("logo")}</span>
            <SegmentedControl
              className={styles.logoControl}
              disabled={exporting}
              label={t("logo")}
              onChange={(logo) => changeOptions({ logo: logo === "on" })}
              options={[
                { value: "off", label: t("off") },
                { value: "on", label: t("on") },
              ]}
              value={options.logo ? "on" : "off"}
            />
          </div>
          <Button
            className={styles.downloadButton}
            disabled={exporting || !previewReady}
            onClick={() => void exportQuote()}
            size="big"
            variant="primary"
          >
            {t(exporting ? "working" : "download")}
          </Button>
          <p className={styles.status} role="status">
            {error ? t(error) : downloaded ? t("downloaded") : ""}
          </p>
        </div>
      </div>
      <div ref={menuPortalRef} />
    </FullScreenDialog>
  );
}
