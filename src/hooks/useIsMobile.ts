import { useEffect, useState } from "react";

const mobileQuery = "(max-width: 620px)";
const desktopQuery = "(min-width: 901px)";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    function updateMatches() {
      setMatches(mediaQuery.matches);
    }

    updateMatches();
    mediaQuery.addEventListener("change", updateMatches);

    return () => {
      mediaQuery.removeEventListener("change", updateMatches);
    };
  }, [query]);

  return matches;
}

export function useIsMobile() {
  return useMediaQuery(mobileQuery);
}

export function useIsDesktop() {
  return useMediaQuery(desktopQuery);
}
