import { useCallback, useRef } from 'react';

export function useSpeech(): {
  supported: boolean;
  speak: (text: string) => void;
  cancel: () => void;
} {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const queuedRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text) return;
      try {
        const synth = window.speechSynthesis;
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ja-JP';
        u.rate = 1.05;
        u.pitch = 1;
        u.volume = 1;
        queuedRef.current = u;
        synth.speak(u);
      } catch {
        /* ignore */
      }
    },
    [supported],
  );

  const cancel = useCallback(() => {
    if (!supported) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }, [supported]);

  return { supported, speak, cancel };
}
