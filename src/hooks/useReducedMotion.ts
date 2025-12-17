/**
 * useReducedMotion Hook
 * 
 * Detects user's preference for reduced motion.
 * Returns true if the user prefers reduced motion.
 */

import { useState, useEffect } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function getInitialState(): boolean {
  // SSR safety check
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia(QUERY).matches;
}

/**
 * Hook that returns true if the user prefers reduced motion.
 * Listens for changes to the user's preference.
 * 
 * @example
 * const prefersReducedMotion = useReducedMotion();
 * const variants = prefersReducedMotion ? reducedMotion : fadeUp;
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getInitialState);

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY);
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } 
    // Legacy browsers (Safari < 14)
    else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
}

export default useReducedMotion;

