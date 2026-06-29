import type { Locale } from "../../store/collectionStore";

export type DialogLink = {
  type: "link";
  href: string;
  text: string;
};

export type DialogText = string | readonly (string | DialogLink)[];

export type HelpItem = {
  question: string;
  answer: DialogText;
};

type HelpModalMessages = {
  close: string;
  items: readonly HelpItem[];
  title: string;
};

export const helpModalMessages = {
  de: {
    close: "Abbrechen",
    title: "Hilfe",
    items: [
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
  },
  en: {
    close: "Cancel",
    title: "Help",
    items: [
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
  },
} as const satisfies Record<Locale, HelpModalMessages>;
