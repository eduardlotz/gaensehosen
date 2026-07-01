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

    const focusTimer = window.setTimeout(() => {
      focusInitialElement();
    }, 0);

    function handleDocumentFocusIn(event: globalThis.FocusEvent) {
      const container = containerRef.current;

      if (!container) {
        return;
      }

      if (event.target instanceof HTMLElement && container.contains(event.target)) {
        lastFocusedInsideRef.current = event.target;
        return;
      }

      focusLastKnownDialogElement();
    }

    function handleDocumentKeyDown(event: globalThis.KeyboardEvent) {
      const escapeHandler = onEscapeRef.current;

      if (event.key !== "Escape" || !escapeHandler) {
        return;
      }

      event.preventDefault();
      escapeHandler();
    }

    document.addEventListener("focusin", handleDocumentFocusIn);
    window.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
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

    if (restoreFocusElement && canReceiveFocus(restoreFocusElement)) {
      suppressRestoredFocusRing(restoreFocusElement);
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

function suppressRestoredFocusRing(element: HTMLElement) {
  element.dataset.suppressFocusRing = "true";

  function clearSuppression() {
    element.removeAttribute("data-suppress-focus-ring");
    element.removeEventListener("blur", clearSuppression);
    element.removeEventListener("keydown", handleKeyDown);
  }

  function handleKeyDown(event: globalThis.KeyboardEvent) {
    if (
      event.key === "Tab" ||
      event.key === "ArrowDown" ||
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight" ||
      event.key === "ArrowUp"
    ) {
      clearSuppression();
    }
  }

  element.addEventListener("blur", clearSuppression);
  element.addEventListener("keydown", handleKeyDown);
}
