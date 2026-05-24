import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWakeLock } from '../hooks/useWakeLock';
import { useVibration } from '../hooks/useVibration';
import { beep, tripleBeep, unlockAudio } from '../utils/beep';

type Phase = 'work' | 'rest' | 'done' | 'idle';

interface Preset {
  id: string;
  label: string;
  work: number;
  rest: number;
  sets: number;
}

const PRESETS: Preset[] = [
  { id: 'tabata', label: 'タバタ (20/10 × 8)', work: 20, rest: 10, sets: 8 },
  { id: 'hiit-30-30', label: '30/30 × 10', work: 30, rest: 30, sets: 10 },
  { id: 'period-30', label: '30秒周期 × 10', work: 30, rest: 0, sets: 10 },
  { id: 'long-1min', label: '60/30 × 8', work: 60, rest: 30, sets: 8 },
];

export function IntervalTimerTab() {
  const [work, setWork] = useState(20);
  const [rest, setRest] = useState(10);
  const [sets, setSets] = useState(8);

  const [phase, setPhase] = useState<Phase>('idle');
  const [setIdx, setSetIdx] = useState(1);
  const [remain, setRemain] = useState(work);
  const [running, setRunning] = useState(false);

  const wakelock = useWakeLock();
  const vibe = useVibration();
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase === 'idle') setRemain(work);
  }, [work, phase]);

  const clearTick = useCallback(() => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const onTransition = useCallback(
    (nextPhase: Phase, nextRemain: number, nextSet: number) => {
      setPhase(nextPhase);
      setRemain(nextRemain);
      setSetIdx(nextSet);
      if (nextPhase === 'done') {
        tripleBeep();
        vibe.vibrate([300, 80, 300, 80, 300]);
      } else if (nextPhase === 'work') {
        beep({ freq: 1000, durationMs: 220, volume: 0.3 });
        vibe.vibrate([180, 60, 180]);
      } else if (nextPhase === 'rest') {
        beep({ freq: 600, durationMs: 220, volume: 0.3 });
        vibe.vibrate(200);
      }
    },
    [vibe],
  );

  useEffect(() => {
    if (!running) return;
    tickRef.current = window.setInterval(() => {
      setRemain((r) => {
        if (r > 1) {
          if (r === 4 || r === 3 || r === 2) {
            beep({ freq: 700, durationMs: 80, volume: 0.18 });
          }
          return r - 1;
        }
        // r === 1 → transition
        if (phase === 'work') {
          if (rest > 0) {
            onTransition('rest', rest, setIdx);
            return rest;
          }
          if (setIdx >= sets) {
            setRunning(false);
            clearTick();
            onTransition('done', 0, setIdx);
            return 0;
          }
          onTransition('work', work, setIdx + 1);
          return work;
        }
        if (phase === 'rest') {
          if (setIdx >= sets) {
            setRunning(false);
            clearTick();
            onTransition('done', 0, setIdx);
            return 0;
          }
          onTransition('work', work, setIdx + 1);
          return work;
        }
        return 0;
      });
    }, 1000);
    return clearTick;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase, setIdx, work, rest, sets]);

  async function handleStart() {
    unlockAudio();
    if (!wakelock.active) await wakelock.request();
    if (phase === 'idle' || phase === 'done') {
      setSetIdx(1);
      setPhase('work');
      setRemain(work);
      beep({ freq: 1000, durationMs: 220, volume: 0.3 });
      vibe.vibrate([180, 60, 180]);
    }
    setRunning(true);
  }

  function handlePause() {
    setRunning(false);
  }

  function handleReset() {
    setRunning(false);
    clearTick();
    setPhase('idle');
    setSetIdx(1);
    setRemain(work);
  }

  const total = useMemo(() => {
    const t = sets * work + Math.max(0, sets - 1) * rest;
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}分${String(s).padStart(2, '0')}秒`;
  }, [sets, work, rest]);

  const phaseLabel =
    phase === 'work' ? '動作' : phase === 'rest' ? '休息' : phase === 'done' ? '完了' : '待機中';
  const phaseColor =
    phase === 'work'
      ? 'bg-accent text-white'
      : phase === 'rest'
        ? 'bg-paper-200 text-ink-700'
        : phase === 'done'
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-paper-100 text-ink-500';

  return (
    <div className="space-y-4">
      <div className="card p-3">
        <div className="label mb-2">プリセット</div>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className="btn-ghost text-sm"
              onClick={() => {
                setWork(p.work);
                setRest(p.rest);
                setSets(p.sets);
                handleReset();
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <NumberField label="動作(秒)" value={work} onChange={setWork} min={5} max={600} />
          <NumberField label="休息(秒)" value={rest} onChange={setRest} min={0} max={600} />
          <NumberField label="セット" value={sets} onChange={setSets} min={1} max={50} />
        </div>
        <div className="text-xs text-ink-500">
          合計時間: <span className="font-semibold text-ink-700">{total}</span>
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${phaseColor}`}>
            {phaseLabel}
          </span>
          <span className="text-sm text-ink-500">
            セット <span className="font-bold text-ink-900">{Math.min(setIdx, sets)}</span> / {sets}
          </span>
        </div>

        <div className="text-center">
          <div className="text-[120px] leading-none font-bold tabular-nums text-ink-900">
            {phase === 'done' ? '✓' : remain}
          </div>
          {phase !== 'done' && phase !== 'idle' && (
            <div className="text-xs text-ink-500 mt-1">秒</div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {running ? (
            <button className="btn-soft col-span-2" onClick={handlePause}>
              一時停止
            </button>
          ) : (
            <button className="btn-primary col-span-2" onClick={handleStart}>
              {phase === 'idle' || phase === 'done' ? '開始' : '再開'}
            </button>
          )}
          <button className="btn-outline" onClick={handleReset}>
            リセット
          </button>
        </div>

        <div className="text-[11px] text-ink-300 text-center">
          画面常時点灯: {wakelock.active ? 'ON' : 'OFF'} ／ 残り3秒からカウントダウン音
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div>
      <div className="label mb-1">{label}</div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="btn-outline w-10 text-lg"
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          −
        </button>
        <input
          type="number"
          className="input text-center"
          inputMode="numeric"
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, Math.floor(n))));
          }}
        />
        <button
          type="button"
          className="btn-outline w-10 text-lg"
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          ＋
        </button>
      </div>
    </div>
  );
}
