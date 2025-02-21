import { TAny } from "../../shared/types/common";
import React from "react";

const isStandalone = () => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as TAny)["standalone"]
  );
};

const getOffsetHeight = () => {
  let safeAreaInsetBottom = 0;

  if (isStandalone()) {
    // Try to get the safe area inset using env() variables
    const safeAreaInsetBottomString = getComputedStyle(
      document.documentElement
    ).getPropertyValue("env(safe-area-inset-bottom)");
    if (safeAreaInsetBottomString) {
      safeAreaInsetBottom = parseFloat(safeAreaInsetBottomString);
    }

    // Fallback values for specific devices if env() is not supported
    if (!safeAreaInsetBottom) {
      const userAgent = navigator.userAgent || navigator.vendor;

      if (/iPhone|iPad|iPod/i.test(userAgent) && !(window as TAny).MSStream) {
        // This is an approximation; you might need to adjust this value based on testing
        safeAreaInsetBottom = 20; // Example fallback value for iPhone
      }
    }
  }

  return window.innerHeight - safeAreaInsetBottom;
};

export const useHeight = () => {
  const [height, setHeight] = React.useState(getOffsetHeight());
  React.useEffect(() => {
    window.addEventListener("resize", () => {
      setHeight(getOffsetHeight());
    });
  }, []);
  return height;
};
