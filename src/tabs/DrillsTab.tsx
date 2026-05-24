import { useEffect, useMemo, useRef, useState } from 'react';
import { useWakeLock } from '../hooks/useWakeLock';
import { useSpeech } from '../hooks/useSpeech';
import { useVibration } from '../hooks/useVibration';
import { tripleBeep, unlockAudio } from '../utils/beep';
import { loadState, saveDrillRoutines } from '../store/localStore';
import type { DrillRoutine } from '../types';
import { DrillEditor } from '../components/DrillEditor';
import { IntervalTimerTab } from './IntervalTimerTab';

type Mode = 'run' | 'timer';

export function DrillsTab() {
  const [mode, setMode] = useState<Mode>('run');
  const [routines, setRoutines] = useState<DrillRoutine[]>(() => loadState().customDrillRoutines);
  const [routineId, setRoutineId] = useState<string>(routines[0]?.id ?? '');
  const [editorOpen, setEditorOpen] = useState(false);

  const routine = useMemo(
    () => routines.find((r) => r.id === routineId) ?? routines[0],
    [routineId, routines],
  );

  useEffect(() => {
    if (!routine && routines[0]) setRoutineId(routines[0].id);
  }, [routine, routines]);

  function handleEditorSave(next: DrillRoutine[]) {
    const st = saveDrillRoutines(next);
    setRoutines(st.customDrillRoutines);
    if (!st.customDrillRoutines.find((r) => r.id === routineId)) {
      setRoutineId(st.customDrillRoutines[0]?.id ?? '');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex gap-1 p-1 bg-paper-100 rounded-xl flex-1">
          <button
            onClick={() => setMode('run')}
            className={
              'flex-1 py-2 rounded-lg text-sm font-medium ' +
              (mode === 'run' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-500')
            }
          >
            ルーティン
          </button>
          <button
            onClick={() => setMode('timer')}
            className={
              'flex-1 py-2 rounded-lg text-sm font-medium ' +
              (mode === 'timer' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-500')
            }
          >
            インターバル
          </button>
        </div>
        <button
          onClick={() => setEditorOpen(true)}
          className="shrink-0 w-12 h-12 rounded-xl bg-paper-100 text-ink-700 hover:bg-paper-200 text-lg"
          aria-label="ドリルを編集"
        >
          ✎
        </button>
      </div>

      {mode === 'run' &&
        (routine ? (
          <RunRoutine routine={routine} onChangeRoutine={setRoutineId} routines={routines} routineId={routineId} />
        ) : (
          <div className="card p-6 text-center text-ink-500 text-sm">
            ルーティンがありません。右上の ✎ から追加してください。
          </div>
        ))}

      {mode === 'timer' && <IntervalTimerTab />}

      <DrillEditor open={editorOpen} onClose={() => setEditorOpen(false)} routines={routines} onSave={handleEditorSave} />
    </div>
  );
}

interface RunProps {
  routine: DrillRoutine;
  routines: DrillRoutine[];
  routineId: string;
  onChangeRoutine: (id: string) => void;
}

function RunRoutine({ routine, routines, routineId, onChangeRoutine }: RunProps) {
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [remain, setRemain] = useState<number>(routine.items[0]?.durationSec ?? 0);

  const wakelock = useWakeLock();
  const speech = useSpeech();
  const vibe = useVibration();

  const item = routine.items[index];
  const total = routine.items.length;
  const hasTimer = typeof item?.durationSec === 'number' && item.durationSec > 0;

  useEffect(() => {
    setIndex(0);
    setRunning(false);
    setRemain(routine.items[0]?.durationSec ?? 0);
  }, [routine.id, routine.items]);

  useEffect(() => {
    setRemain(item?.durationSec ?? 0);
  }, [item?.id, item?.durationSec]);

  const tickRef = useRef<number | null>(null);
  useEffect(() => {
    if (!running || !hasTimer) return;
    tickRef.current = window.setInterval(() => {
      setRemain((r) => {
        if (r <= 1) {
          window.clearInterval(tickRef.current ?? undefined);
          tickRef.current = null;
          handleAdvance();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      tickRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, item?.id]);

  function announce(i: number) {
    const it = routine.items[i];
    if (!it) return;
    speech.speak(`次、${it.name}。意識ポイント、${it.cue}`);
  }

  function handleAdvance() {
    tripleBeep();
    vibe.vibrate([180, 80, 180]);
    setRunning(false);
    if (index + 1 < total) {
      const next = index + 1;
      setIndex(next);
      setTimeout(() => announce(next), 250);
    } else {
      speech.speak('ルーティン完了。お疲れさま。');
    }
  }

  async function handleStart() {
    unlockAudio();
    if (!wakelock.active) await wakelock.request();
    announce(index);
    if (hasTimer) setRunning(true);
  }

  function handlePrev() {
    if (index === 0) return;
    setRunning(false);
    const p = index - 1;
    setIndex(p);
    setTimeout(() => announce(p), 200);
  }

  function handleSkip() {
    setRunning(false);
    if (index + 1 < total) {
      const n = index + 1;
      setIndex(n);
      setTimeout(() => announce(n), 200);
    }
  }

  function handleReset() {
    setRunning(false);
    setIndex(0);
    setRemain(routine.items[0]?.durationSec ?? 0);
  }

  if (!item) {
    return (
      <div className="card p-6 text-center text-ink-500 text-sm">
        このルーティンには種目がありません。「編集」から追加してください。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-4 space-y-2">
        <div className="flex items-center gap-2">
          <label className="label shrink-0">ルーティン</label>
          <select className="input" value={routineId} onChange={(e) => onChangeRoutine(e.target.value)}>
            {routines.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        {routine.referenceUrl && (
          <a
            href={routine.referenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-accent-ink hover:underline"
          >
            <span aria-hidden>▶</span>
            <span>参考動画を開く</span>
            <span className="text-ink-300 break-all">{routine.referenceUrl}</span>
          </a>
        )}
      </div>

      <div className="card p-4 space-y-4">
        <div className="flex items-center justify-between text-xs text-ink-500">
          <span>
            {index + 1} / {total}
          </span>
          <span className="flex gap-2">
            <span className={'chip ' + (wakelock.active ? 'bg-accent-soft text-accent-ink' : '')}>
              画面常時点灯 {wakelock.active ? 'ON' : 'OFF'}
            </span>
          </span>
        </div>

        <div className="space-y-1">
          <div className="label">意識すべきポイント</div>
          <p className="text-3xl sm:text-4xl font-extrabold leading-tight text-ink-900">{item.cue}</p>
        </div>

        <div>
          <div className="label">種目</div>
          <p className="text-xl font-semibold text-ink-900">{item.name}</p>
          {item.reps && <p className="text-sm text-ink-500 mt-0.5">{item.reps}</p>}
        </div>

        {hasTimer && (
          <div className="bg-paper-50 rounded-xl py-6 flex items-center justify-center">
            <span className="text-6xl font-bold tabular-nums text-ink-900">
              {String(Math.floor(remain / 60)).padStart(2, '0')}:{String(remain % 60).padStart(2, '0')}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {running ? (
            <button className="btn-soft col-span-2" onClick={() => setRunning(false)}>
              一時停止
            </button>
          ) : (
            <button className="btn-primary col-span-2" onClick={handleStart}>
              {hasTimer ? '開始 / 読み上げ' : '読み上げ'}
            </button>
          )}
          <button className="btn-outline" onClick={handlePrev} disabled={index === 0}>
            ← 前へ
          </button>
          <button className="btn-outline" onClick={handleAdvance}>
            完了 → 次へ
          </button>
          <button className="btn-ghost" onClick={handleSkip}>
            スキップ
          </button>
          <button className="btn-ghost" onClick={handleReset}>
            最初に戻す
          </button>
        </div>
      </div>

      <div className="card p-4">
        <div className="label mb-2">このルーティンの全種目</div>
        <ol className="divide-y divide-paper-200">
          {routine.items.map((it, i) => (
            <li
              key={it.id}
              className={
                'py-2 flex items-baseline gap-3 text-sm ' +
                (i === index ? 'text-ink-900 font-semibold' : 'text-ink-500')
              }
            >
              <span className="w-6 tabular-nums">{i + 1}.</span>
              <span className="flex-1">{it.name}</span>
              <span className="text-xs">{it.durationSec ? `${it.durationSec}s` : it.reps ?? ''}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
