import { Menu } from "@base-ui/react/menu";
import type { ReactNode, RefObject } from "react";
import styles from "./OptionMenu.module.css";
import { CompactControl } from "../SegmentedControl";

type Option<Value extends string> = {
  value: Value;
  label: ReactNode;
  textValue: string;
};

type OptionMenuProps<Value extends string> = {
  label: string;
  options: readonly Option<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  triggerContent: ReactNode;
  disabled?: boolean;
  portalContainer?: RefObject<HTMLElement | null>;
  compact?: boolean;
  side?: "top" | "bottom";
};

export function OptionMenu<Value extends string>({
  label,
  options,
  value,
  onChange,
  triggerContent,
  disabled,
  portalContainer,
  compact = false,
  side = "bottom",
}: OptionMenuProps<Value>) {
  return (
    <Menu.Root modal={false}>
      {compact ? (
        <CompactControl
          disabled={disabled}
          label={label}
          optionsLabel={label}
          valueLabel={options.find((option) => option.value === value)?.textValue ?? label}
          renderOptions={(button) => <Menu.Trigger disabled={disabled} render={button} />}
        >
          {triggerContent}
        </CompactControl>
      ) : <Menu.Trigger
        aria-label={label}
        className={styles.trigger}
        disabled={disabled}
        type="button"
      >
        <span className={styles.triggerContent}>{triggerContent}</span>
        <span aria-hidden="true" className={styles.chevron} />
      </Menu.Trigger>}
      <Menu.Portal container={portalContainer}>
        <Menu.Positioner align="start" className={styles.positioner} side={side} sideOffset={8}>
          <Menu.Popup aria-label={label} className={styles.popup}>
            <Menu.RadioGroup
              onValueChange={(nextValue) => onChange(nextValue as Value)}
              value={value}
            >
              {options.map((option) => (
                <Menu.RadioItem
                  className={styles.item}
                  closeOnClick
                  key={option.value}
                  label={option.textValue}
                  value={option.value}
                >
                  {option.label}
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
