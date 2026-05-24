type Ctx = AudioContext | null;
let ctx: Ctx = null;

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
  return ctx;
}

export function unlockAudio(): void {
  ensureCtx();
}

export function beep(
  opts: { freq?: number; durationMs?: number; volume?: number; type?: OscillatorType } = {},
): void {
  const c = ensureCtx();
  if (!c) return;
  const { freq = 880, durationMs = 180, volume = 0.25, type = 'sine' } = opts;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.01);
  gain.gain.linearRampToValueAtTime(0, now + durationMs / 1000);
  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + durationMs / 1000 + 0.02);
}

export function tripleBeep(): void {
  beep({ freq: 660, durationMs: 120 });
  setTimeout(() => beep({ freq: 880, durationMs: 120 }), 150);
  setTimeout(() => beep({ freq: 1100, durationMs: 220 }), 300);
}
