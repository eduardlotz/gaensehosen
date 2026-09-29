import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import shareIcon from "../../icons/export-arrow.svg?raw";
import trashIcon from "../../icons/trash.svg?raw";
import { useLayoutEffect, useRef, useState } from "react";
import { PrimaryQuoteButton } from "../PrimaryQuoteButton";
import { MotionButton, SrOnly, SvgIcon, Text } from "../ui";
import { quickScaleFade } from "../motionTransitions";
import { createTranslator } from "../../i18n/translate";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import type { Locale, Quote } from "../../store/collectionStore";
import { quoteFormModalMessages } from "./QuoteFormModal.messages";
import styles from "./QuoteFormModal.module.css";

const inputBackgroundLayoutId = "quote-form-input-background";
const inputBackgroundTransition = {
  layout: {
    type: "spring",
    stiffness: 520,
    damping: 34,
    mass: 0.45,
  },
  opacity: {
    duration: 0.12,
  },
  scale: {
    duration: 0.14,
    ease: [0.2, 0.8, 0.2, 1],
  },
} as const;

type ActiveInputBackground = "text" | "source" | null;

type QuoteFormModalProps = {
  mode: "add" | "view" | "edit";
  onEdit: () => void;
  onCancel: () => void;
  onShare: () => void;
  locale: Locale;
  quote?: Quote;
  open: boolean;
  formId: string;
  onClose: () => void;
  onDelete?: () => void;
  onSave: (quote: { text: string; source: string }) => void;
};

export function QuoteFormModal({
  formId,
  mode,
  onEdit,
  onCancel,
  onShare,
  locale,
  quote,
  open,
  onClose,
  onDelete,
  onSave,
}: QuoteFormModalProps) {
  const readOnly = mode === "view";
  const t = createTranslator(quoteFormModalMessages, locale);
  const [text, setText] = useState(() => quote?.text ?? "");
  const [source, setSource] = useState(() => quote?.source ?? "");
  const [activeInputBackground, setActiveInputBackground] =
    useState<ActiveInputBackground>(null);
  const quoteShakeControls = useAnimationControls();
  const quotePlaceholder = t("quoteText");
  const sourcePlaceholder = t("source");
  const quoteInputRef = useRef<HTMLTextAreaElement | null>(null);
  const readOnlyFieldsRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const { handleKeyDown } = useFocusTrap({
    containerRef: editorRef,
    enabled: open,
    initialFocusRef: quoteInputRef,
  });

  useLayoutEffect(() => {
    resizeQuoteInput();
  }, [text, mode]);

  useLayoutEffect(() => {
    if (mode === "view") {
      setActiveInputBackground(null);
      setText(quote?.text ?? "");
      setSource(quote?.source ?? "");
      readOnlyFieldsRef.current?.focus({ preventScroll: true });
    } else {
      setActiveInputBackground("text");
      quoteInputRef.current?.focus({ preventScroll: true });
    }
  }, [mode, quote]);

  if (!open) {
    return null;
  }

  function saveQuote() {
    if (readOnly) return;
    if (!text.trim()) {
      setActiveInputBackground("text");
      quoteInputRef.current?.focus();
      quoteShakeControls.set({ x: 0 });
      void quoteShakeControls.start({
        x: [0, -7, 6, -4, 3, 0],
        transition: { duration: 0.28, ease: "easeInOut" },
      });
      return;
    }

    onSave({ text, source });
  }

  function resizeQuoteInput() {
    const input = quoteInputRef.current;

    if (!input) {
      return;
    }

    input.style.height = "0px";
    input.style.height = `${input.scrollHeight}px`;
  }

  function clearInputBackground({
    currentTarget,
    relatedTarget,
  }: {
    currentTarget: HTMLElement;
    relatedTarget: EventTarget | null;
  }) {
    if (
      relatedTarget instanceof Node &&
      currentTarget.contains(relatedTarget)
    ) {
      return;
    }

    setActiveInputBackground(null);
  }

  return (
    <motion.div
      className={styles.backdrop}
      exit={{ opacity: 0 }}
      layoutRoot
      onMouseDown={mode === "edit" ? undefined : onClose}
      role="presentation"
    >
      <motion.div
        aria-label={readOnly ? t("viewQuote") : quote ? t("editQuote") : t("addQuote")}
        aria-modal="true"
        className={styles.editor}
        exit={{ opacity: 0, scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onKeyDown={handleKeyDown}
        onMouseDown={(event) => event.stopPropagation()}
        ref={editorRef}
        role="dialog"
        tabIndex={-1}
        // transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
        // transition={{ duration: 0.25, type: "spring" }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <Text as="h2" className={styles.title} variant="title">
          {readOnly ? t("viewQuote") : quote ? t("editQuote") : t("addQuote")}
        </Text>

        <form
          className={styles.form}
          id={formId}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            saveQuote();
          }}
        >
          {readOnly ? (
            <div
              aria-label={t("editQuote")}
              className={`${styles.inputGroup} ${styles.readOnlyFields}`}
              onClick={onEdit}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onEdit();
                }
              }}
              ref={readOnlyFieldsRef}
              role="button"
              tabIndex={0}
            >
              <div className={styles.quoteField}>
                <span className={`${styles.quoteMark} ${styles.openingQuoteMark}`}>„</span>
                <span className={styles.quoteInputWrap}>
                  <span className={styles.quoteMirror}>
                    {quote?.text}<span className={styles.quoteMark}>“</span>
                  </span>
                </span>
              </div>
              {quote?.source ? (
                <div className={styles.sourceField}>
                  <span className={styles.sourceInputWrap}>
                    <span className={styles.sourceMirror}>{quote.source}</span>
                  </span>
                </div>
              ) : null}
            </div>
          ) : (
          <div className={styles.inputGroup}>
            <motion.label
              animate={quoteShakeControls}
              className={styles.quoteField}
              onBlur={clearInputBackground}
              onFocus={() => setActiveInputBackground("text")}
            >
              <SrOnly>{t("quoteText")}</SrOnly>
              <span
                className={`${styles.quoteMark} ${styles.openingQuoteMark}`}
              >
                „
              </span>
              <span className={styles.quoteInputWrap}>
                <span className={styles.quoteMirror} aria-hidden="true">
                  <AnimatePresence initial={false}>
                    {activeInputBackground === "text" ? (
                      <motion.span
                        animate={{ opacity: 1, scale: 1 }}
                        className={styles.inputFocusBackground}
                        exit={{ opacity: 0, scale: 0.96 }}
                        initial={{ opacity: 0, scale: 0.96 }}
                        layout
                        layoutId={inputBackgroundLayoutId}
                        transition={inputBackgroundTransition}
                      />
                    ) : null}
                  </AnimatePresence>
                  {text || quotePlaceholder}
                  <span className={styles.quoteMark}>“</span>
                </span>
                <textarea
                  autoFocus
                  className={styles.quoteInput}
                  onChange={(event) => setText(event.currentTarget.value)}
                  placeholder={quotePlaceholder}
                  ref={quoteInputRef}
                  rows={1}
                  value={text}
                />
              </span>
            </motion.label>

            <label
              className={styles.sourceField}
              onBlur={clearInputBackground}
              onFocus={() => setActiveInputBackground("source")}
            >
              <SrOnly>{t("source")}</SrOnly>
              <span className={styles.sourceInputWrap}>
                <span className={styles.sourceMirror} aria-hidden="true">
                  <AnimatePresence initial={false}>
                    {activeInputBackground === "source" ? (
                      <motion.span
                        animate={{ opacity: 1, scale: 1 }}
                        className={styles.inputFocusBackground}
                        exit={{ opacity: 0, scale: 0.96 }}
                        initial={{ opacity: 0, scale: 0.96 }}
                        layout
                        layoutId={inputBackgroundLayoutId}
                        transition={inputBackgroundTransition}
                      />
                    ) : null}
                  </AnimatePresence>
                  {source || sourcePlaceholder}
                </span>
                <input
                  className={styles.sourceInput}
                  onChange={(event) => setSource(event.currentTarget.value)}
                  placeholder={sourcePlaceholder}
                  type="text"
                  value={source}
                />
              </span>
            </label>
          </div>

          )}

          <div className={styles.actionGroup} data-mode={mode}>
            {mode === "add" ? (
              <PrimaryQuoteButton
                state={{
                  kind: "save",
                  label: t("saveQuote"),
                  position: "relative",
                  type: "submit",
                }}
                textSize="1rem"
              />
            ) : (
              <>
                <div className={styles.primaryActions} data-mode={mode}>
                  <AnimatePresence initial={false} mode="popLayout">
                    {mode === "edit" ? (
                      <MotionButton
                        {...quickScaleFade}
                        className={styles.saveButton}
                        key="save-edit"
                        type="submit"
                        variant="brand"
                      >
                        {t("saveEdit")}
                      </MotionButton>
                    ) : null}
                    {mode === "edit" ? (
                      <MotionButton {...quickScaleFade} key="cancel-edit" onClick={onCancel}>
                        {t("cancel")}
                      </MotionButton>
                    ) : null}
                    {readOnly ? (
                      <MotionButton
                        {...quickScaleFade}
                        icon={<SvgIcon svg={shareIcon} />}
                        key="share"
                        onClick={onShare}
                      >
                        {t("share")}
                      </MotionButton>
                    ) : null}
                  </AnimatePresence>
                </div>
                <AnimatePresence initial={false} mode="popLayout">
                  {readOnly && onDelete ? (
                    <MotionButton
                      {...quickScaleFade}
                      icon={<SvgIcon svg={trashIcon} />}
                      key="delete"
                      onClick={onDelete}
                      type="button"
                      variant="danger"
                    >
                      {t("delete")}
                    </MotionButton>
                  ) : null}
                </AnimatePresence>
              </>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
