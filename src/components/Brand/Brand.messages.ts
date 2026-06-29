import type { Locale } from "../../store/collectionStore";

export const brandMessages = {
  de: {
    brand: "Gänsehosen",
    toggleLogo: "Logo-Variante wechseln",
  },
  en: {
    brand: "Gänsehosen",
    toggleLogo: "Switch logo variant",
  },
} as const satisfies Record<Locale, Record<string, string>>;
