import { FullScreenDialog, ModalCloseButton, Text } from "../ui";
import { createTranslator, getLocaleMessages } from "../../i18n/translate";
import type { Locale } from "../../store/collectionStore";
import {
  helpModalMessages,
  type DialogText,
} from "./HelpModal.messages";
import styles from "./HelpModal.module.css";

type HelpModalProps = {
  locale: Locale;
  open: boolean;
  onClose: () => void;
};

function renderDialogText(text: DialogText) {
  if (typeof text === "string") {
    return text;
  }

  return text.map((part, index) => {
    if (typeof part === "string") {
      return part;
    }

    return (
      <a
        className={styles.answerLink}
        href={part.href}
        key={`${part.href}-${index}`}
        rel="noreferrer"
        target="_blank"
      >
        {part.text}
      </a>
    );
  });
}

export function HelpModal({ locale, open, onClose }: HelpModalProps) {
  const t = createTranslator(helpModalMessages, locale);
  const messages = getLocaleMessages(helpModalMessages, locale);

  if (!open) {
    return null;
  }

  return (
    <FullScreenDialog
      aria-labelledby="help-dialog-title"
      className={styles.backdrop}
      contentClassName={styles.modal}
      onClose={onClose}
    >
      <div className={styles.stickyHeader}>
        <Text
          as="h1"
          className={styles.title}
          id="help-dialog-title"
          variant="title"
        >
          <span className={styles.quoteMark}>„</span>
          {t("title")}
          <span className={styles.quoteMark}>“</span>
        </Text>

        <ModalCloseButton
          aria-label={t("close")}
          className={styles.closeButton}
          onClick={onClose}
          title={t("close")}
        />
      </div>

      <div className={styles.scrollContent}>
        <div className={styles.items}>
          {messages.items.map((item) => (
            <section className={styles.item} key={item.question}>
              <Text as="h3" className={styles.question} variant="body">
                {item.question}
              </Text>
              <Text className={styles.answer} tone="muted" variant="body">
                {renderDialogText(item.answer)}
              </Text>
            </section>
          ))}
        </div>
      </div>
    </FullScreenDialog>
  );
}
