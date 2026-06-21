import { Brand } from "../Brand";
import { FullScreenDialog, ModalCloseButton, Text } from "../ui";
import { t } from "../../i18n/messages";
import type { Locale } from "../../store/collectionStore";
import styles from "./HelpModal.module.css";

type HelpModalProps = {
  locale: Locale;
  open: boolean;
  onClose: () => void;
};

type HelpItem = {
  question: string;
  answer: string;
};

const helpItems: Record<Locale, HelpItem[]> = {
  de: [
    {
      question: "Was ist das hier?",
      answer:
        "Eine kleine Notiz-App im Browser, nur für Zitate und Quellen.\nZum Sammeln, Suchen und Wiederfinden.",
    },
    {
      question: "Wofür eine Website, ich hab doch meine Notizapp?",
      answer:
        "Damit Zitate nicht zwischen Einkaufslisten, Screenshots und anderen Notizen verschwinden.",
    },
    {
      question: "Wie viel kostet es?",
      answer: "Nichts. Kostenlos für dich :)",
    },
    {
      question: "Wo werden meine Daten gespeichert?",
      answer:
        "In deinem Browser, also nur auf dem Gerät, auf dem du die Seite benutzt.\nKeine Accounts, keine Uploads, keine Datenbank.",
    },
    {
      question: "Wieso heißt es Gänsehosen?",
      answer:
        "Eine Anspielung auf das deutsche Meme. Und Zitate haben eh schon Gänsefüßchen, warum also keine Hosen?",
    },
  ],
  en: [
    {
      question: "What is this?",
      answer:
        "A small notes app in your browser, just for quotes and sources.\nFor collecting, searching, and finding them again.",
    },
    {
      question: "Why a website, I already have my notes app?",
      answer:
        "So quotes do not disappear between shopping lists, screenshots, and other notes.",
    },
    {
      question: "How much does it cost?",
      answer: "Nothing. Free for you :)",
    },
    {
      question: "Where is my data stored?",
      answer:
        "In your browser, on the device where you use the site.\nNo accounts, no uploads, no database.",
    },
    {
      question: "Why is it called Gänsehosen?",
      answer: "A nod to the German meme.",
    },
  ],
};

export function HelpModal({ locale, open, onClose }: HelpModalProps) {
  if (!open) {
    return null;
  }

  return (
    <FullScreenDialog
      aria-labelledby="help-dialog-title"
      contentClassName={styles.modal}
      onClose={onClose}
    >
      <ModalCloseButton
        aria-label={t(locale, "cancel")}
        onClick={onClose}
        title={t(locale, "cancel")}
      />

      <div className={styles.brand}>
        <Brand locale={locale} />
      </div>

      <div className={styles.content}>
        <Text
          as="h1"
          className={styles.title}
          id="help-dialog-title"
          variant="title"
        >
          <span className={styles.quoteMark}>„</span>
          {t(locale, "help")}
          <span className={styles.quoteMark}>“</span>
        </Text>

        <div className={styles.items}>
          {helpItems[locale].map((item) => (
            <section className={styles.item} key={item.question}>
              <Text as="h3" className={styles.question} variant="body">
                {item.question}
              </Text>
              <Text className={styles.answer} tone="muted" variant="body">
                {item.answer}
              </Text>
            </section>
          ))}
        </div>
      </div>
    </FullScreenDialog>
  );
}
