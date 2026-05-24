import { useCallback, useEffect, useRef, useState } from 'react';

type WakeLockSentinelLike = {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: 'release', cb: () => void) => void;
};

export function useWakeLock(): {
  active: boolean;
  supported: boolean;
  request: () => Promise<void>;
  release: () => Promise<void>;
} {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);
  const [active, setActive] = useState(false);

  const nav = typeof navigator !== 'undefined' ? (navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> } }) : null;
  const supported = !!nav && !!nav.wakeLock && typeof nav.wakeLock.request === 'function';

  const request = useCallback(async () => {
    if (!supported || !nav?.wakeLock) return;
    try {
      const s = await nav.wakeLock.request('screen');
      sentinelRef.current = s;
      setActive(true);
      s.addEventListener('release', () => setActive(false));
    } catch {
      setActive(false);
    }
  }, [supported]);

  const release = useCallback(async () => {
    const s = sentinelRef.current;
    if (s && !s.released) {
      try {
        await s.release();
      } catch {
        /* ignore */
      }
    }
    sentinelRef.current = null;
    setActive(false);
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible' && sentinelRef.current === null && active) {
        void request();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [active, request]);

  useEffect(() => {
    return () => {
      void release();
    };
  }, [release]);

  return { active, supported, request, release };
}
