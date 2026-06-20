import { useEffect, useState } from "react";

const mobileQuery = "(max-width: 620px)";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia(mobileQuery).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(mobileQuery);

    function updateIsMobile() {
      setIsMobile(mediaQuery.matches);
    }

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => {
      mediaQuery.removeEventListener("change", updateIsMobile);
    };
  }, []);

  return isMobile;
}
