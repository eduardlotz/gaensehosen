import type { FontSize, GridMode, Locale } from "../store/collectionStore";

export type ShortcutPlatform = "mac" | "windows";

export type KeyboardShortcutKey = {
  ariaLabel: string;
  label: string;
};

export type KeyboardShortcutItem = {
  ariaText: string;
  description: string;
  id: string;
  keys: KeyboardShortcutKey[];
  keysText: string;
};

export type KeyboardShortcutItems = {
  focusSearch: KeyboardShortcutItem;
  fontSizes: Record<FontSize, KeyboardShortcutItem>;
  gridModes: Record<GridMode, KeyboardShortcutItem>;
  newQuote: KeyboardShortcutItem;
  openQuote: KeyboardShortcutItem;
  quoteNavigation: KeyboardShortcutItem;
};

const localizedShortcutKeyLabels = {
  de: {
    arrowDown: "Pfeil nach unten",
    arrowLeft: "Pfeil nach links",
    arrowRight: "Pfeil nach rechts",
    arrowUp: "Pfeil nach oben",
    command: "Befehl",
    control: "Steuerung",
    controlVisual: "Strg",
    enter: "Eingabe",
    joiner: " plus ",
  },
  en: {
    arrowDown: "Arrow down",
    arrowLeft: "Arrow left",
    arrowRight: "Arrow right",
    arrowUp: "Arrow up",
    command: "Command",
    control: "Control",
    controlVisual: "Ctrl",
    enter: "Enter",
    joiner: " plus ",
  },
} as const satisfies Record<Locale, Record<string, string>>;

const shortcutDescriptions = {
  de: {
    focusSearch: "Suchen",
    fontSize: "Schriftgröße",
    gridFocus: "Fokus",
    gridGrid: "Grid",
    gridList: "Liste",
    gridMasonry: "Masonry",
    newQuote: "Neues Zitat",
    openQuote: "Fokussiertes Zitat öffnen",
    quoteNavigation: "Zwischen Zitaten navigieren",
  },
  en: {
    focusSearch: "Search",
    fontSize: "Font size",
    gridFocus: "Focus",
    gridGrid: "Grid",
    gridList: "List",
    gridMasonry: "Masonry",
    newQuote: "Open new quote form",
    openQuote: "Open focused quote",
    quoteNavigation: "Navigate between quotes",
  },
} as const satisfies Record<Locale, Record<string, string>>;

const fontSizes = [16, 24, 32, 40] as const satisfies FontSize[];
const gridModes = [
  { descriptionKey: "gridMasonry", key: "M", value: "masonry" },
  { descriptionKey: "gridGrid", key: "G", value: "grid" },
  { descriptionKey: "gridList", key: "L", value: "list" },
  { descriptionKey: "gridFocus", key: "F", value: "focus" },
] as const satisfies {
  descriptionKey:
    | "gridFocus"
    | "gridGrid"
    | "gridList"
    | "gridMasonry";
  key: string;
  value: GridMode;
}[];

export function getShortcutPlatform(): ShortcutPlatform {
  if (typeof navigator === "undefined") {
    return "windows";
  }

  const platform =
    "userAgentData" in navigator
      ? (navigator.userAgentData as { platform?: string }).platform
      : navigator.platform;

  return /mac|iphone|ipad|ipod/i.test(platform ?? "") ? "mac" : "windows";
}

export function getPlatformModifierKey(platform = getShortcutPlatform()) {
  return platform === "mac" ? "CMD" : "CTRL";
}

export function getKeyboardShortcutItems(
  locale: Locale,
  platform = getShortcutPlatform(),
): KeyboardShortcutItems {
  const descriptions = shortcutDescriptions[locale];
  const keyLabels = localizedShortcutKeyLabels[locale];
  const modifierKey =
    platform === "mac"
      ? { ariaLabel: keyLabels.command, label: "⌘" }
      : { ariaLabel: keyLabels.control, label: keyLabels.controlVisual };

  return {
    focusSearch: createKeyboardShortcutItem(
      "focus-search",
      descriptions.focusSearch,
      [modifierKey, { ariaLabel: "K", label: "K" }],
      keyLabels.joiner,
    ),
    fontSizes: Object.fromEntries(
      fontSizes.map((fontSize, index) => [
        fontSize,
        createKeyboardShortcutItem(
          `font-size-${fontSize}`,
          `${descriptions.fontSize} ${fontSize}`,
          [{ ariaLabel: String(index + 1), label: String(index + 1) }],
          keyLabels.joiner,
        ),
      ]),
    ) as Record<FontSize, KeyboardShortcutItem>,
    gridModes: Object.fromEntries(
      gridModes.map(({ descriptionKey, key, value }) => [
        value,
        createKeyboardShortcutItem(
          `grid-${value}`,
          descriptions[descriptionKey],
          [{ ariaLabel: key, label: key }],
          keyLabels.joiner,
        ),
      ]),
    ) as Record<GridMode, KeyboardShortcutItem>,
    newQuote: createKeyboardShortcutItem(
      "new-quote",
      descriptions.newQuote,
      [{ ariaLabel: "Q", label: "Q" }],
      keyLabels.joiner,
    ),
    openQuote: createKeyboardShortcutItem(
      "open-quote",
      descriptions.openQuote,
      [{ ariaLabel: keyLabels.enter, label: "Enter" }],
      keyLabels.joiner,
    ),
    quoteNavigation: createKeyboardShortcutItem(
      "quote-navigation",
      descriptions.quoteNavigation,
      [
        { ariaLabel: keyLabels.arrowUp, label: "↑" },
        { ariaLabel: keyLabels.arrowDown, label: "↓" },
        { ariaLabel: keyLabels.arrowLeft, label: "←" },
        { ariaLabel: keyLabels.arrowRight, label: "→" },
      ],
      keyLabels.joiner,
    ),
  };
}

export function getKeyboardShortcutList(
  locale: Locale,
  platform = getShortcutPlatform(),
) {
  const shortcuts = getKeyboardShortcutItems(locale, platform);

  return [
    shortcuts.focusSearch,
    ...fontSizes.map((fontSize) => shortcuts.fontSizes[fontSize]),
    ...gridModes.map(({ value }) => shortcuts.gridModes[value]),
    shortcuts.newQuote,
    shortcuts.openQuote,
    shortcuts.quoteNavigation,
  ];
}

function createKeyboardShortcutItem(
  id: string,
  description: string,
  keys: KeyboardShortcutKey[],
  joiner: string,
): KeyboardShortcutItem {
  const ariaText = keys.map((key) => key.ariaLabel).join(joiner);

  return {
    ariaText,
    description,
    id,
    keys,
    keysText: ariaText,
  };
}
