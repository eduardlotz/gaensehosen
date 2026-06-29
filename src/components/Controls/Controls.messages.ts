import type { Locale } from "../../store/collectionStore";

export const controlsMessages = {
  de: {
    fontSize: "Schriftgröße",
    grid: "Raster",
    gridMasonry: "Masonry",
    gridGrid: "Grid",
    gridList: "Liste",
    gridFocus: "Fokus",
    options: "Optionen",
  },
  en: {
    fontSize: "Font size",
    grid: "Grid",
    gridMasonry: "Masonry",
    gridGrid: "Grid",
    gridList: "List",
    gridFocus: "Focus",
    options: "Options",
  },
} as const satisfies Record<Locale, Record<string, string>>;
