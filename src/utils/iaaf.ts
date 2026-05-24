import type { MenuParams } from '../types';

function formatTime(sec: number): string {
  if (sec >= 60) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s === 0 ? `${m}'00"` : `${m}'${String(s).padStart(2, '0')}"`;
  }
  return `${sec}s`;
}

function formatDistance(m: number): string {
  if (m >= 1000 && m % 1000 === 0) return `${m / 1000}k`;
  return `${m}m`;
}

export function toIAAF(p: MenuParams): string {
  const sets = p.sets ?? 1;
  const reps = p.reps ?? 1;
  const dist = p.distanceM
    ? formatDistance(p.distanceM)
    : p.timeSec
      ? formatTime(p.timeSec)
      : '?';

  // For single-set: "5 × 1000m" instead of "1 × 5 × 1000m"
  const main = sets > 1 ? `${sets} × ${reps} × ${dist}` : `${reps} × ${dist}`;

  const intensity = p.intensity ? ` (${p.intensity})` : '';

  let rest = '';
  if (p.restM) {
    rest = ` r=${p.restM}m ${p.restType ?? 'jog'}`;
  } else if (p.restSec) {
    rest = ` r=${formatTime(p.restSec)} ${p.restType ?? 'rest'}`;
  }

  const envBits = [p.environment, p.incline, p.load].filter((v) => v && String(v).trim() !== '');
  const envStr = envBits.length > 0 ? ` @${envBits.join(' ')}` : '';

  return `${main}${intensity}${rest}${envStr}`.trim();
}

export function toJapaneseTitle(p: MenuParams): string {
  const labelMap: Record<MenuParams['category'], string> = {
    interval: 'インターバル',
    repetition: 'レペティション',
    tempo: 'テンポ走',
    fartlek: 'ファルトレク',
    pace: 'ペースラン',
    change: '変化走',
    jog: 'ジョグ',
    long: 'ロング走',
    hill: '坂ダッシュ',
  };
  const head = labelMap[p.category] ?? '';
  const dist = p.distanceM
    ? `${p.distanceM}m`
    : p.timeSec
      ? p.timeSec >= 60
        ? `${Math.floor(p.timeSec / 60)}分`
        : `${p.timeSec}秒`
      : '';
  const reps = p.reps && p.reps > 1 ? ` × ${p.reps}本` : '';
  const sets = p.sets && p.sets > 1 ? ` × ${p.sets}set` : '';
  let rest = '';
  if (p.restM) rest = ` r=${p.restM}m`;
  else if (p.restSec) rest = ` r=${p.restSec}s`;
  return `${head} ${dist}${reps}${sets}${rest}`.trim();
}
