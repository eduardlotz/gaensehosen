import type { KeyboardShortcutItem } from "../../utils/keyboardShortcuts";
import { classNames } from "../ui/classNames";
import styles from "./KeyboardShortcut.module.css";

type KeyboardShortcutKeysProps = {
  className?: string;
  decorative?: boolean;
  shortcut: KeyboardShortcutItem;
};

export function KeyboardShortcutKeys({
  className,
  decorative = false,
  shortcut,
}: KeyboardShortcutKeysProps) {
  return (
    <span
      aria-hidden={decorative ? "true" : undefined}
      aria-label={decorative ? undefined : shortcut.ariaText}
      className={classNames(styles.shortcutKeys, className)}
    >
      {shortcut.keys.map((key) => (
        <span
          className={styles.shortcutKey}
          key={`${shortcut.id}-${key.label}`}
        >
          {key.label}
        </span>
      ))}
    </span>
  );
}
