import type { Locale } from "../../store/collectionStore";

type QuoteFormModalMessages = {
  addQuote: string;
  delete: string;
  editQuote: string;
  quoteText: string;
  saveQuote: string;
  source: string;
};

export const quoteFormModalMessages = {
  de: {
    addQuote: "Zitat hinzufügen",
    delete: "Löschen",
    editQuote: "Zitat bearbeiten",
    quoteText: "Zitat",
    saveQuote: "Zitat Ende",
    source: "Quelle",
  },
  en: {
    addQuote: "Add quote",
    delete: "Delete",
    editQuote: "Edit quote",
    quoteText: "Quote",
    saveQuote: "Save quote",
    source: "Source",
  },
} as const satisfies Record<Locale, QuoteFormModalMessages>;
