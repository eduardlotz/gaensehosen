import type { Locale } from "../store/collectionStore";

export type LocaleMessages = Record<Locale, Record<string, unknown>>;

export function createTranslator<Messages extends LocaleMessages>(
  messages: Messages,
  locale: Locale,
) {
  const localeMessages = messages[locale];

  return function translate<Key extends keyof Messages[Locale] & string>(
    key: Key,
  ): Messages[Locale][Key] {
    return localeMessages[key] as Messages[Locale][Key];
  };
}

export function getLocaleMessages<Messages extends LocaleMessages>(
  messages: Messages,
  locale: Locale,
): Messages[Locale] {
  return messages[locale];
}
