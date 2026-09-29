import type { Locale } from "../store/collectionStore";
import type { WelcomeSlide } from "../components/WelcomeSlider";

type AppPageMessages = {
  addQuote: string;
  cancel: string;
  clearSearch: string;
  closeControls: string;
  closeFontSizeControls: string;
  exportCsv: string;
  help: string;
  importCsv: string;
  importCsvError: string;
  intro: string;
  jumpToQuotes: string;
  keyboardShortcut: string;
  keyboardShortcuts: string;
  language: string;
  newQuoteShortcut: string;
  noResults: string;
  openQuoteShortcut: string;
  options: string;
  quoteNavigationShortcut: string;
  quotes: string;
  resetApp: string;
  resetAppCancel: string;
  resetAppConfirm: string;
  resetAppDescription: string;
  resetAppTitle: string;
  search: string;
  theme: string;
  welcomeSlides: readonly WelcomeSlide[];
};

export const appPageMessages = {
  de: {
    addQuote: "Neues Zitat",
    cancel: "Abbrechen",
    clearSearch: "Filter entfernen",
    closeControls: "Rasteroptionen schließen",
    closeFontSizeControls: "Schriftgrößenoptionen schließen",
    exportCsv: "Als CSV exportieren",
    help: "Hilfe",
    importCsv: "CSV importieren",
    importCsvError: "Die CSV konnte nicht importiert werden.",
    intro:
      "Ich liebe schöne Zitate.\nDie meisten lese ich aber nie wieder.\nSie liegen immer irgendwo verteilt auf Post-Its, meiner Notiz-App und einer Menge Screenshots.\nAus diesem Grund habe ich diese Website gebaut.\n\nEin Ort für meine (und deine) Lieblingszitate.\nNicht mehr und nicht weniger.",
    jumpToQuotes: "Zu den Zitaten springen",
    keyboardShortcut: "Shortcut",
    keyboardShortcuts: "Shortcuts",
    language: "Sprache ändern",
    newQuoteShortcut: "Neues Zitat",
    noResults: "Nichts hier...",
    openQuoteShortcut: "Fokussiertes Zitat öffnen",
    options: "Optionen",
    quoteNavigationShortcut: "Zwischen Zitaten navigieren",
    quotes: "Zitate",
    resetApp: "Alles löschen",
    resetAppCancel: "Nein, zurück",
    resetAppConfirm: "Ja, alles löschen",
    resetAppDescription:
      "Es werden alle Zitate gelöscht. Dieser Vorgang lässt sich nicht mehr rückgängig machen.",
    resetAppTitle: "Alles löschen?",
    search: "Suchen",
    theme: "Theme ändern",
    welcomeSlides: [
      {
        text: "Wie wunderbar ist es, dass niemand einen einzigen Moment warten muss, bevor er anfängt, die Welt zu verbessern.",
        source: "Anne Frank",
      },
      {
        text: "Der Mensch entdeckt sich selbst, wenn er sich im Spiegel seiner Taten betrachtet.",
        source: "Antoine de Saint-Exupéry",
      },
      {
        text: "Du kannst nicht verbrauchen, was Du bist. Je mehr Du benutzt, desto mehr hast Du.",
        source: "Maya Angelou",
      },
      {
        text: "Es gibt nichts Gutes, außer man tut es.",
        source: "Erich Kästner",
      },
      {
        text: "Wer nicht an Magie glaubt, wird sie niemals entdecken.",
        source: "Roald Dahl",
      },
      {
        text: "Der Kampf gegen Gipfel vermag ein Menschenherz auszufüllen. Wir müssen uns Sisyphos als einen glücklichen Menschen vorstellen.",
        source: "Albert Camus",
      },
      {
        text: "Weniger, aber besser.",
        source: "Dieter Rams",
      },
    ],
  },
  en: {
    addQuote: "New quote",
    cancel: "Cancel",
    clearSearch: "Clear search",
    closeControls: "Close grid options",
    closeFontSizeControls: "Close font size options",
    exportCsv: "Export as CSV",
    help: "Help",
    importCsv: "Import CSV",
    importCsvError: "The CSV could not be imported.",
    intro:
      "I love beautiful quotes.\nMost of them I never read again.\nThey end up scattered across sticky notes, my notes app, and far too many screenshots.\nThat is why I built this site.\n\nA place for my (and your) favorite quotes.\nNothing more and nothing less.",
    jumpToQuotes: "Jump to quotes",
    keyboardShortcut: "Shortcut",
    keyboardShortcuts: "Shortcuts",
    language: "Change language",
    newQuoteShortcut: "Open new quote form",
    noResults: "Nothing here...",
    openQuoteShortcut: "Open focused quote",
    options: "Options",
    quoteNavigationShortcut: "Navigate between quotes",
    quotes: "Quotes",
    resetApp: "Delete everything",
    resetAppCancel: "No, go back",
    resetAppConfirm: "Yes, delete everything",
    resetAppDescription:
      "All quotes will be removed. This action cannot be undone.",
    resetAppTitle: "Delete everything?",
    search: "Search",
    theme: "Change theme",
    welcomeSlides: [
      {
        text: "The man who does not read has no advantage over the man who cannot read.",
        source: "Mark Twain",
      },
      {
        text: "It's hard to be poor if you're making the lives of the people around you rich.",
        source: "Michael Thompson",
      },
      {
        text: "Fate leads the willing and drags the unwilling.",
        source: "Seneca",
      },
      {
        text: "The goal in life is not to live forever but to create something that will.",
        source: "Andy Warhol",
      },
      {
        text: "Yesterday is dead, tomorrow hasn't arrived yet. I have just one day, and I'm going to be happy in it.",
        source: "Groucho Marx",
      },
      {
        text: "He who has a why to live for can bear almost any how.",
        source: "Friedrich Nietzsche",
      },
    ],
  },
} as const satisfies Record<Locale, AppPageMessages>;
