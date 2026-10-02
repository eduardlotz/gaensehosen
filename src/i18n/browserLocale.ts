import type { Locale } from "../store/collectionStore";

export function getBrowserLocale(): Locale {
  if (typeof navigator === "undefined") {
    return "en";
  }

  const languages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const language of languages) {
    const locale = language.toLowerCase().split("-")[0];

    if (locale === "de" || locale === "en") {
      return locale;
    }
  }

  return "en";
}
