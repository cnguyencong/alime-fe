import { useEffect, useState, useCallback } from "react";

/**
 * Custom hook to track browser tab visibility using Page Visibility API
 * Returns current visibility state and allows registering callbacks
 */
export function useTabVisibility() {
  const [isVisible, setIsVisible] = useState<boolean>(!document.hidden);

  const handleVisibilityChange = useCallback(() => {
    setIsVisible(!document.hidden);
  }, []);

  useEffect(() => {
    // Add event listener for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return { isVisible };
}
