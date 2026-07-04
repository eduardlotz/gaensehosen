import type { Locale } from "../../store/collectionStore";

export const shortcutsDialogMessages = {
  de: {
    close: "Abbrechen",
    fontSize: "Zitate Schriftgröße",
    gridView: "Raster",
    title: "Shortcuts",
  },
  en: {
    close: "Cancel",
    fontSize: "Quote font size",
    gridView: "Grid",
    title: "Shortcuts",
  },
} as const satisfies Record<Locale, Record<string, string>>;
