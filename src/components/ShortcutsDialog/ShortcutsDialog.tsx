import type { RefObject } from "react";
import type { FontSize, GridMode, Locale } from "../../store/collectionStore";
import { getKeyboardShortcutItems } from "../../utils/keyboardShortcuts";
import { CoreDialog } from "../CoreDialog";
import { KeyboardShortcutKeys } from "../KeyboardShortcut";
import { shortcutsDialogMessages } from "./ShortcutsDialog.messages";
import styles from "./ShortcutsDialog.module.css";

type ShortcutsDialogProps = {
  locale: Locale;
  onClose: () => void;
  restoreFocusRef?: RefObject<HTMLElement | null>;
};

const fontSizes = [16, 24, 32, 40] as const satisfies FontSize[];
const gridModes = [
  "masonry",
  "grid",
  "list",
  "focus",
] as const satisfies GridMode[];

export function ShortcutsDialog({
  locale,
  onClose,
  restoreFocusRef,
}: ShortcutsDialogProps) {
  const messages = shortcutsDialogMessages[locale];
  const shortcuts = getKeyboardShortcutItems(locale);

  return (
    <CoreDialog
      bodyClassName={styles.body}
      closeLabel={messages.close}
      onClose={onClose}
      restoreFocusRef={restoreFocusRef}
      title={messages.title}
      titleId="shortcuts-dialog-title"
    >
      <ul className={styles.shortcutsList}>
        <ShortcutRow shortcut={shortcuts.focusSearch} />

        <li className={styles.shortcutsListItem}>
          <span className={styles.shortcutDescription}>
            {messages.fontSize}
          </span>
          <span className={styles.inlineShortcutGroup}>
            {fontSizes.map((fontSize) => (
              <span className={styles.shortcutColumn} key={fontSize}>
                <KeyboardShortcutKeys shortcut={shortcuts.fontSizes[fontSize]} />
                <span className={styles.shortcutValue}>{fontSize}px</span>
              </span>
            ))}
          </span>
        </li>

        <li className={styles.shortcutsListItem}>
          <span className={styles.shortcutDescription}>
            {messages.gridView}
          </span>
          <span className={styles.gridShortcutGroup}>
            {gridModes.map((gridMode) => {
              const shortcut = shortcuts.gridModes[gridMode];

              return (
                <span className={styles.shortcutColumn} key={gridMode}>
                  <KeyboardShortcutKeys shortcut={shortcut} />
                  <span className={styles.shortcutValue}>
                    {shortcut.description}
                  </span>
                </span>
              );
            })}
          </span>
        </li>

        <ShortcutRow shortcut={shortcuts.newQuote} />
        <ShortcutRow shortcut={shortcuts.openQuote} />
        <ShortcutRow shortcut={shortcuts.quoteNavigation} />
      </ul>
    </CoreDialog>
  );
}

type ShortcutRowProps = {
  shortcut: ReturnType<typeof getKeyboardShortcutItems>["focusSearch"];
};

function ShortcutRow({ shortcut }: ShortcutRowProps) {
  return (
    <li className={styles.shortcutsListItem}>
      <span className={styles.shortcutDescription}>{shortcut.description}</span>
      <KeyboardShortcutKeys shortcut={shortcut} />
    </li>
  );
}
