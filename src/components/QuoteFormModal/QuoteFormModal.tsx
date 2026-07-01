import { AnimatePresence, motion } from "motion/react";
import trashIcon from "../../icons/trash.svg?raw";
import {
  ChangeEvent,
  FocusEvent,
  FormEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { PrimaryQuoteButton } from "../PrimaryQuoteButton";
import { Button, SrOnly, SvgIcon, Text } from "../ui";
import { createTranslator } from "../../i18n/translate";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import type { Locale, Quote } from "../../store/collectionStore";
import { quoteFormModalMessages } from "./QuoteFormModal.messages";
import styles from "./QuoteFormModal.module.css";

const placeholderQuotes = [
  { text: "What?", source: "Joe Biden" },
  { text: "Ha ha!", source: "Nelson Muntz" },
  { text: "Bazinga.", source: "Sheldon Cooper" },
  { text: "Miau.", source: "Gary" },
  { text: "Wow.", source: "Owen Wilson" },
] as const;

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
  locale,
  quote,
  open,
  onClose,
  onDelete,
  onSave,
}: QuoteFormModalProps) {
  const t = createTranslator(quoteFormModalMessages, locale);
  const [text, setText] = useState(() => quote?.text ?? "");
  const [source, setSource] = useState(() => quote?.source ?? "");
  const [activeInputBackground, setActiveInputBackground] =
    useState<ActiveInputBackground>(null);
  const [placeholderQuote] = useState(() => {
    if (quote) {
      return placeholderQuotes[0];
    }

    return placeholderQuotes[
      Math.floor(Math.random() * placeholderQuotes.length)
    ];
  });
  const quoteInputRef = useRef<HTMLTextAreaElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const { handleKeyDown } = useFocusTrap({
    containerRef: editorRef,
    enabled: open,
    initialFocusRef: quoteInputRef,
  });

  useLayoutEffect(() => {
    resizeQuoteInput();
  }, [text]);

  if (!open) {
    return null;
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!text.trim()) {
      return;
    }

    onSave({ text, source });
    onClose();
  }

  function deleteQuote() {
    onDelete?.();
    onClose();
  }

  function resizeQuoteInput() {
    const input = quoteInputRef.current;

    if (!input) {
      return;
    }

    input.style.height = "0px";
    input.style.height = `${input.scrollHeight}px`;
  }

  function updateText(event: ChangeEvent<HTMLTextAreaElement>) {
    setText(event.target.value);
  }

  function updateSource(event: ChangeEvent<HTMLInputElement>) {
    setSource(event.target.value);
  }

  function clearInputBackground(event: FocusEvent<HTMLElement>) {
    if (
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
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
      onMouseDown={onClose}
      role="presentation"
    >
      <motion.div
        aria-label={quote ? t("editQuote") : t("addQuote")}
        aria-modal="true"
        className={styles.editor}
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onKeyDown={handleKeyDown}
        onMouseDown={(event) => event.stopPropagation()}
        ref={editorRef}
        role="dialog"
        tabIndex={-1}
        transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <Text as="h2" className={styles.title} variant="title">
          {quote ? t("editQuote") : t("addQuote")}
        </Text>

        <form className={styles.form} id={formId} onSubmit={submit}>
          <div className={styles.inputGroup}>
            <label
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
                  {text || placeholderQuote.text}
                  <span className={styles.quoteMark}>“</span>
                </span>
                <textarea
                  autoFocus
                  className={styles.quoteInput}
                  onChange={updateText}
                  placeholder={placeholderQuote.text}
                  ref={quoteInputRef}
                  required
                  rows={1}
                  value={text}
                />
              </span>
            </label>

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
                  {source || placeholderQuote.source}
                </span>
                <input
                  className={styles.sourceInput}
                  onChange={updateSource}
                  placeholder={placeholderQuote.source}
                  type="text"
                  value={source}
                />
              </span>
            </label>
          </div>

          <div className={styles.actionGroup}>
            <PrimaryQuoteButton
              state={{
                kind: "save",
                label: t("saveQuote"),
                position: "relative",
                type: "submit",
              }}
              textSize="1rem"
            />

            {quote && onDelete ? (
              <Button
                icon={<SvgIcon svg={trashIcon} />}
                onClick={deleteQuote}
                size="big"
                type="button"
                variant="danger"
              >
                {t("delete")}
              </Button>
            ) : null}
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
