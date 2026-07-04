import type { Locale } from "../../store/collectionStore";

type QuoteFormModalMessages = {
  addQuote: string;
  delete: string;
  deleteQuoteCancel: string;
  deleteQuoteConfirm: string;
  deleteQuoteDescription: string;
  deleteQuoteTitle: string;
  editQuote: string;
  quoteText: string;
  saveQuote: string;
  source: string;
};

export const quoteFormModalMessages = {
  de: {
    addQuote: "Zitat hinzufügen",
    delete: "Löschen",
    deleteQuoteCancel: "Abbrechen",
    deleteQuoteConfirm: "Zitat löschen",
    deleteQuoteDescription: "Dieses Zitat wird dauerhaft aus deiner Sammlung entfernt.",
    deleteQuoteTitle: "Zitat löschen?",
    editQuote: "Zitat bearbeiten",
    quoteText: "Zitat",
    saveQuote: "Zitat Ende",
    source: "Quelle",
  },
  en: {
    addQuote: "Add quote",
    delete: "Delete",
    deleteQuoteCancel: "Cancel",
    deleteQuoteConfirm: "Delete quote",
    deleteQuoteDescription:
      "This quote will be permanently removed from your collection.",
    deleteQuoteTitle: "Delete quote?",
    editQuote: "Edit quote",
    quoteText: "Quote",
    saveQuote: "Save quote",
    source: "Source",
  },
} as const satisfies Record<Locale, QuoteFormModalMessages>;
