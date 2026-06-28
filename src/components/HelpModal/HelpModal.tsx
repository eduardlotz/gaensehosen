import { FullScreenDialog, ModalCloseButton, Text } from "../ui";
import { t } from "../../i18n/messages";
import type { Locale } from "../../store/collectionStore";
import styles from "./HelpModal.module.css";

type HelpModalProps = {
  locale: Locale;
  open: boolean;
  onClose: () => void;
};

type DialogLink = {
  type: "link";
  href: string;
  text: string;
};

type DialogText = string | Array<string | DialogLink>;

type HelpItem = {
  question: string;
  answer: DialogText;
};

const helpItems: Record<Locale, HelpItem[]> = {
  de: [
    {
      question: "Was ist das hier?",
      answer:
        "Eine Website zum Sammeln von Zitaten.\nQuasi eine Notiz-App im Internet, aber nur für Texte und deren Herkunft.",
    },
    {
      question: "Wofür eine Website, ich hab doch meine Notizapp?",
      answer:
        "Ich auch, aber ich finde dort nichts wieder, wenn ich nicht weiß, wonach ich suche. Ich wollte stattdessen eine schlichte Platform zum Sammeln von Zitaten haben.",
    },
    {
      question: "Wie viel kostet?",
      answer: "Kostenlos. 🙂",
    },
    {
      question: "Wo werden meine Daten gespeichert?",
      answer:
        "In deinem Browser, also nur auf dem Gerät, auf dem du die Seite benutzt.\nEs wird nichts im Internet hochgeladen, alles funktioniert quasi offline.",
    },
    {
      question: "Wieso heißt es Gänsehosen?",
      answer: [
        "Eine Anspielung an ",
        {
          type: "link",
          href: "https://youtube.com/shorts/JhuhaS8Z7cc",
          text: "das deutsche Meme",
        },
        ", in Kombination damit, dass Zitate sowieso schon Gänsefüßchen haben. 🦆",
      ],
    },
  ],
  en: [
    {
      question: "What is this?",
      answer:
        "A website for collecting quotes.\nBasically a notes app on the internet, but only for text and where it came from.",
    },
    {
      question: "Why a website, I already have my notes app?",
      answer:
        "I do too, but I can never find anything there unless I know what I am looking for. I wanted a simple platform for collecting quotes instead.",
    },
    {
      question: "How much does it cost?",
      answer: "Free. 🙂",
    },
    {
      question: "Where is my data stored?",
      answer:
        "In your browser, so only on the device where you use the site.\nNothing is uploaded to the internet; it basically works offline.",
    },
    {
      question: "Why is it called Gänsehosen?",
      answer: [
        "Gänsehosen (geesepants) is a nod to ",
        {
          type: "link",
          href: "https://youtube.com/shorts/JhuhaS8Z7cc",
          text: "the German meme",
        },
        ", combined with the fact, that quotation marks are called Gänsefüßchen (little goose feet) in German. 🦆",
      ],
    },
  ],
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
          {t(locale, "help")}
          <span className={styles.quoteMark}>“</span>
        </Text>

        <ModalCloseButton
          aria-label={t(locale, "cancel")}
          className={styles.closeButton}
          onClick={onClose}
          title={t(locale, "cancel")}
        />
      </div>

      <div className={styles.scrollContent}>
        <div className={styles.items}>
          {helpItems[locale].map((item) => (
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
