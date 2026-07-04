import type { Locale } from "../../store/collectionStore";

export const shortcutsDialogMessages = {
  de: {
    close: "Abbrechen",
    fontSize: "Schriftgröße",
    gridView: "Raster",
    title: "Tastaturkürzel",
  },
  en: {
    close: "Cancel",
    fontSize: "Font size",
    gridView: "Grid",
    title: "Keyboard shortcuts",
  },
} as const satisfies Record<Locale, Record<string, string>>;
