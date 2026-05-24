import { useCallback } from 'react';

export function useVibration() {
  const supported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const vibrate = useCallback(
    (pattern: number | number[]) => {
      if (!supported) return;
      try {
        navigator.vibrate(pattern);
      } catch {
        /* ignore */
      }
    },
    [supported],
  );

  return { supported, vibrate };
}
