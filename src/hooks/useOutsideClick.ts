import { useEffect, useRef } from "react";

type UseOutsideClickOptions = {
  enabled: boolean;
  ignoreSelector: string;
  onOutsideClick: () => void;
};

export function useOutsideClick({
  enabled,
  ignoreSelector,
  onOutsideClick,
}: UseOutsideClickOptions) {
  const onOutsideClickRef = useRef(onOutsideClick);

  useEffect(() => {
    onOutsideClickRef.current = onOutsideClick;
  }, [onOutsideClick]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    function isIgnoredTarget(target: EventTarget | null) {
      return (
        target instanceof Element && target.closest(ignoreSelector) !== null
      );
    }

    function stopOutsideEvent(event: Event) {
      event.preventDefault();
      event.stopPropagation();

      if ("stopImmediatePropagation" in event) {
        event.stopImmediatePropagation();
      }
    }

    function handleClick(event: MouseEvent) {
      if (isIgnoredTarget(event.target)) {
        return;
      }

      stopOutsideEvent(event);
      onOutsideClickRef.current();
    }

    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, [enabled, ignoreSelector]);
}
