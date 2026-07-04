import { useEffect } from "react";

type KeyPressAction = (event: KeyboardEvent) => void;
type KeyCombination = string | readonly string[];

export type KeyPressBinding = {
  action: KeyPressAction;
  enabled?: boolean;
  keys: KeyCombination;
  preventDefault?: boolean;
  stopPropagation?: boolean;
};

type UseKeyPressOptions = {
  enabled?: boolean;
  event?: "keydown" | "keyup";
  ignoreEditable?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  target?: Document | HTMLElement | Window | null;
};

const modifierKeys = new Set(["alt", "control", "ctrl", "meta", "shift"]);

export function useKeyPress(
  bindings: readonly KeyPressBinding[],
  options?: UseKeyPressOptions,
): void;
export function useKeyPress(
  keys: KeyCombination,
  action: KeyPressAction,
  options?: UseKeyPressOptions,
): void;
export function useKeyPress(
  keysOrBindings: KeyCombination | readonly KeyPressBinding[],
  actionOrOptions?: KeyPressAction | UseKeyPressOptions,
  options?: UseKeyPressOptions,
) {
  useEffect(() => {
    const bindings = normalizeBindings(
      keysOrBindings,
      actionOrOptions,
      options,
    );
    const listenerTarget = bindings.options.target ?? window;

    if (!bindings.options.enabled || !listenerTarget) {
      return;
    }

    function handleKeyPress(event: Event) {
      if (!(event instanceof KeyboardEvent)) {
        return;
      }

      if (bindings.options.ignoreEditable && isEditableTarget(event.target)) {
        return;
      }

      const matchedBinding = bindings.items.find((binding) => {
        return binding.enabled && matchesKeys(event, binding.keys);
      });

      if (!matchedBinding) {
        return;
      }

      if (matchedBinding.preventDefault) {
        event.preventDefault();
      }

      if (matchedBinding.stopPropagation) {
        event.stopPropagation();
      }

      matchedBinding.action(event);
    }

    listenerTarget.addEventListener(bindings.options.event, handleKeyPress);

    return () => {
      listenerTarget.removeEventListener(
        bindings.options.event,
        handleKeyPress,
      );
    };
  }, [actionOrOptions, keysOrBindings, options]);
}

function normalizeBindings(
  keysOrBindings: KeyCombination | readonly KeyPressBinding[],
  actionOrOptions?: KeyPressAction | UseKeyPressOptions,
  options?: UseKeyPressOptions,
) {
  const isBindingList =
    Array.isArray(keysOrBindings) &&
    keysOrBindings.every((binding) => typeof binding === "object");
  const baseOptions =
    (isBindingList ? actionOrOptions : options) as UseKeyPressOptions | undefined;
  const normalizedOptions = {
    enabled: baseOptions?.enabled ?? true,
    event: baseOptions?.event ?? "keydown",
    ignoreEditable: baseOptions?.ignoreEditable ?? false,
    preventDefault: baseOptions?.preventDefault ?? false,
    stopPropagation: baseOptions?.stopPropagation ?? false,
    target: baseOptions?.target,
  };
  const bindings = isBindingList
    ? (keysOrBindings as readonly KeyPressBinding[])
    : [
        {
          action: actionOrOptions as KeyPressAction,
          keys: keysOrBindings as KeyCombination,
        },
      ];

  return {
    items: bindings.map((binding) => ({
      action: binding.action,
      enabled: binding.enabled ?? true,
      keys: normalizeKeys(binding.keys),
      preventDefault:
        binding.preventDefault ?? normalizedOptions.preventDefault,
      stopPropagation:
        binding.stopPropagation ?? normalizedOptions.stopPropagation,
    })),
    options: normalizedOptions,
  };
}

function normalizeKeys(keys: KeyCombination) {
  return (Array.isArray(keys) ? keys : [keys]).map((key) =>
    key.trim().toLowerCase(),
  );
}

function matchesKeys(event: KeyboardEvent, keys: string[]) {
  const modifiers = {
    alt: event.altKey,
    ctrl: event.ctrlKey,
    meta: event.metaKey,
    shift: event.shiftKey,
  };
  const expectedModifiers = {
    alt: false,
    ctrl: false,
    meta: false,
    shift: false,
  };
  let expectedKey = "";

  keys.forEach((key) => {
    if (key === "cmd" || key === "command" || key === "meta") {
      expectedModifiers.meta = true;
    } else if (key === "ctrl" || key === "control") {
      expectedModifiers.ctrl = true;
    } else if (key === "option" || key === "alt") {
      expectedModifiers.alt = true;
    } else if (key === "shift") {
      expectedModifiers.shift = true;
    } else {
      expectedKey = key;
    }
  });

  if (
    modifiers.alt !== expectedModifiers.alt ||
    modifiers.ctrl !== expectedModifiers.ctrl ||
    modifiers.meta !== expectedModifiers.meta ||
    modifiers.shift !== expectedModifiers.shift
  ) {
    return false;
  }

  const pressedKey = normalizeEventKey(event.key);

  return expectedKey ? pressedKey === normalizeEventKey(expectedKey) : false;
}

function normalizeEventKey(key: string) {
  const normalizedKey = key.trim().toLowerCase();

  if (normalizedKey === "esc") {
    return "escape";
  }

  if (normalizedKey === "space" || normalizedKey === "spacebar") {
    return " ";
  }

  return modifierKeys.has(normalizedKey) ? "" : normalizedKey;
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}
