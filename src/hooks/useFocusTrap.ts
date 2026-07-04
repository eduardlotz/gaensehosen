import type { KeyboardEvent, RefObject } from "react";
import { useEffect, useRef } from "react";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const activeTrapStack: HTMLElement[] = [];

type UseFocusTrapOptions = {
  containerRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  onEscape?: () => void;
  restoreFocusRef?: RefObject<HTMLElement | null>;
};

export function useFocusTrap({
  containerRef,
  enabled = true,
  initialFocusRef,
  onEscape,
  restoreFocusRef,
}: UseFocusTrapOptions) {
  const openerRef = useRef<HTMLElement | null>(getActiveElement());
  const onEscapeRef = useRef(onEscape);
  const lastFocusedInsideRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const currentContainer = containerRef.current;

    if (!currentContainer) {
      return;
    }

    const trapContainer: HTMLElement = currentContainer;

    activeTrapStack.push(trapContainer);

    const focusTimer = window.setTimeout(() => {
      focusInitialElement();
    }, 0);

    function handleDocumentFocusIn(event: globalThis.FocusEvent) {
      if (
        event.target instanceof HTMLElement &&
        trapContainer.contains(event.target)
      ) {
        lastFocusedInsideRef.current = event.target;
        return;
      }

      if (!isTopTrap(trapContainer)) {
        return;
      }

      focusLastKnownDialogElement();
    }

    function handleDocumentKeyDown(event: globalThis.KeyboardEvent) {
      const escapeHandler = onEscapeRef.current;

      if (
        event.key !== "Escape" ||
        !escapeHandler ||
        !isTopTrap(trapContainer)
      ) {
        return;
      }

      event.preventDefault();
      escapeHandler();
    }

    document.addEventListener("focusin", handleDocumentFocusIn);
    window.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      removeActiveTrap(trapContainer);
      document.removeEventListener("focusin", handleDocumentFocusIn);
      window.removeEventListener("keydown", handleDocumentKeyDown);
      restoreFocus();
    };
  }, [containerRef, enabled, initialFocusRef, restoreFocusRef]);

  function getFocusableElements() {
    const container = containerRef.current;

    if (!container) {
      return [];
    }

    return Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelector),
    ).filter(
      (element) =>
        element.tabIndex !== -1 &&
        !element.hasAttribute("disabled") &&
        element.getAttribute("aria-hidden") !== "true",
    );
  }

  function focusInitialElement() {
    const initialFocusElement = initialFocusRef?.current;

    if (initialFocusElement && canReceiveFocus(initialFocusElement)) {
      initialFocusElement.focus({ preventScroll: true });
      lastFocusedInsideRef.current = initialFocusElement;
      return;
    }

    focusFirstDialogControl();
  }

  function focusFirstDialogControl() {
    const firstFocusableElement = getFocusableElements()[0];

    if (firstFocusableElement) {
      firstFocusableElement.focus({ preventScroll: true });
      lastFocusedInsideRef.current = firstFocusableElement;
      return;
    }

    containerRef.current?.focus({ preventScroll: true });
  }

  function focusLastKnownDialogElement() {
    const lastFocusedInside = lastFocusedInsideRef.current;

    if (lastFocusedInside && canReceiveFocus(lastFocusedInside)) {
      lastFocusedInside.focus({ preventScroll: true });
      return;
    }

    focusFirstDialogControl();
  }

  function restoreFocus() {
    const restoreFocusElement = restoreFocusRef?.current ?? openerRef.current;

    if (restoreFocusElement && canRestoreFocus(restoreFocusElement)) {
      restoreFocusElement.focus({ preventScroll: true });
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab") {
      return;
    }

    const container = containerRef.current;
    const focusableElements = getFocusableElements();

    if (!container || focusableElements.length === 0) {
      event.preventDefault();
      container?.focus({ preventScroll: true });
      return;
    }

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement =
      focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (
      event.shiftKey &&
      (activeElement === firstFocusableElement ||
        !(activeElement instanceof Node && container.contains(activeElement)))
    ) {
      event.preventDefault();
      lastFocusableElement.focus({ preventScroll: true });
      return;
    }

    if (!event.shiftKey && activeElement === lastFocusableElement) {
      event.preventDefault();
      firstFocusableElement.focus({ preventScroll: true });
    }
  }

  return { handleKeyDown };
}

function isTopTrap(container: HTMLElement) {
  return activeTrapStack[activeTrapStack.length - 1] === container;
}

function removeActiveTrap(container: HTMLElement) {
  const index = activeTrapStack.lastIndexOf(container);

  if (index !== -1) {
    activeTrapStack.splice(index, 1);
  }
}

function getActiveElement() {
  if (typeof document === "undefined") {
    return null;
  }

  return document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;
}

function canReceiveFocus(element: HTMLElement) {
  return (
    element.isConnected &&
    !element.hasAttribute("disabled") &&
    element.getAttribute("aria-hidden") !== "true"
  );
}

function canRestoreFocus(element: HTMLElement) {
  if (!canReceiveFocus(element)) {
    return false;
  }

  return (
    element instanceof HTMLAnchorElement ||
    element instanceof HTMLButtonElement ||
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement ||
    element.isContentEditable
  );
}
