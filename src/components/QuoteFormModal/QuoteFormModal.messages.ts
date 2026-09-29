import type { Locale } from "../../store/collectionStore";

type QuoteFormModalMessages = {
  addQuote: string;
  viewQuote: string;
  cancel: string;
  share: string;
  delete: string;
  deleteQuoteCancel: string;
  deleteQuoteConfirm: string;
  deleteQuoteDescription: string;
  deleteQuoteTitle: string;
  editQuote: string;
  quoteText: string;
  saveQuote: string;
  saveEdit: string;
  source: string;
};

export const quoteFormModalMessages = {
  de: {
    addQuote: "Zitat hinzufügen",
    viewQuote: "Zitat ansehen",
    cancel: "Abbrechen",
    share: "Teilen",
    delete: "Löschen",
    deleteQuoteCancel: "Abbrechen",
    deleteQuoteConfirm: "Zitat löschen",
    deleteQuoteDescription: "Dieses Zitat wird dauerhaft aus deiner Sammlung entfernt.",
    deleteQuoteTitle: "Zitat löschen?",
    editQuote: "Zitat bearbeiten",
    quoteText: "Zitat",
    saveQuote: "Zitat Ende",
    saveEdit: "Speichern",
    source: "Quelle",
  },
  en: {
    addQuote: "Add quote",
    viewQuote: "View quote",
    cancel: "Cancel",
    share: "Share",
    delete: "Delete",
    deleteQuoteCancel: "Cancel",
    deleteQuoteConfirm: "Delete quote",
    deleteQuoteDescription:
      "This quote will be permanently removed from your collection.",
    deleteQuoteTitle: "Delete quote?",
    editQuote: "Edit quote",
    quoteText: "Quote",
    saveQuote: "Save quote",
    saveEdit: "Save",
    source: "Source",
  },
} as const satisfies Record<Locale, QuoteFormModalMessages>;
