import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to enforce a minimum loading duration.
 * Prevents jarring visual flicker/flash when data loads too fast (<200ms).
 * 
 * Recommended duration: 350ms - 400ms.
 * - < 200ms: Eye registers a jarring flash/flicker ("bikin pusing").
 * - 350ms - 400ms: Sweet spot for smooth perceived transition.
 * - > 500ms: Starts to feel artificially slow for desktop operators.
 * 
 * @param isLoading Actual loading state from data query
 * @param minDuration Minimum duration in milliseconds (default: 350ms)
 * @returns boolean Stable loading state
 */
export function useMinimumLoading(isLoading: boolean, minDuration: number = 350): boolean {
  const [displayLoading, setDisplayLoading] = useState(isLoading);
  const startTimeRef = useRef<number | null>(isLoading ? Date.now() : null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isLoading) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      startTimeRef.current = Date.now();
      setDisplayLoading(true);
    } else {
      if (startTimeRef.current === null) {
        setDisplayLoading(false);
        return;
      }

      const elapsed = Date.now() - startTimeRef.current;
      const remaining = minDuration - elapsed;

      if (remaining > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayLoading(false);
          startTimeRef.current = null;
          timeoutRef.current = null;
        }, remaining);
      } else {
        setDisplayLoading(false);
        startTimeRef.current = null;
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isLoading, minDuration]);

  return displayLoading;
}
