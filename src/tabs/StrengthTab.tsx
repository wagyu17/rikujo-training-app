import { useEffect, useMemo, useState } from 'react';
import {
  appendStrength,
  clearStrengthAll,
  loadState,
  resetStrengthForItem,
  saveStrengthRoutines,
} from '../store/localStore';
import { useVibration } from '../hooks/useVibration';
import { unlockAudio } from '../utils/beep';
import type { StrengthRoutine } from '../types';
import { StrengthEditor } from '../components/StrengthEditor';

export function StrengthTab() {
  const [routines, setRoutines] = useState<StrengthRoutine[]>(() => loadState().customStrengthRoutines);
  const [routineId, setRoutineId] = useState<string>(routines[0]?.id ?? '');
  const [editorOpen, setEditorOpen] = useState(false);

  const routine = useMemo(
    () => routines.find((r) => r.id === routineId) ?? routines[0],
    [routineId, routines],
  );

  const [index, setIndex] = useState(0);
  const item = routine?.items[index];

  const [reps, setReps] = useState<number>(item?.defaultReps ?? 0);
  const [manualReps, setManualReps] = useState<string>('');
  const [log, setLog] = useState(() => loadState().strengthLog);

  const vibe = useVibration();

  useEffect(() => {
    setIndex(0);
  }, [routine?.id]);

  useEffect(() => {
    setReps(item?.defaultReps ?? 0);
    setManualReps('');
  }, [item?.id, item?.defaultReps]);

  function handleEditorSave(next: StrengthRoutine[]) {
    const st = saveStrengthRoutines(next);
    setRoutines(st.customStrengthRoutines);
    if (!st.customStrengthRoutines.find((r) => r.id === routineId)) {
      setRoutineId(st.customStrengthRoutines[0]?.id ?? '');
    }
  }

  if (!routine || !item) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 items-stretch">
          <div className="card p-4 flex items-center gap-2 flex-1">
            <label className="label">ルーティン</label>
            <span className="text-sm text-ink-500">なし</span>
          </div>
          <button
            onClick={() => setEditorOpen(true)}
            className="shrink-0 w-12 h-12 rounded-xl bg-paper-100 text-ink-700 hover:bg-paper-200 text-lg self-stretch"
            aria-label="筋トレを編集"
          >
            ✎
          </button>
        </div>
        <div className="card p-6 text-center text-ink-500 text-sm">
          ルーティン／種目がありません。右上の ✎ から追加してください。
        </div>
        <StrengthEditor open={editorOpen} onClose={() => setEditorOpen(false)} routines={routines} onSave={handleEditorSave} />
      </div>
    );
  }

  const sets = log[item.id] ?? [];
  const setsDone = sets.length;

  function plusOne() {
    setReps((r) => r + 1);
    vibe.vibrate(10);
  }
  function minusOne() {
    setReps((r) => Math.max(0, r - 1));
  }
  function recordSet(n: number) {
    if (n <= 0 || !item) return;
    unlockAudio();
    const next = appendStrength(item.id, n);
    setLog(next.strengthLog);
    vibe.vibrate([60, 40, 60]);
    setReps(item.defaultReps);
    setManualReps('');
  }
  function clearItem() {
    if (!item) return;
    if (!confirm(`${item.name} の今日のセット記録をクリアしますか？`)) return;
    const next = resetStrengthForItem(item.id);
    setLog(next.strengthLog);
  }
  function clearAll() {
    if (!confirm('全種目の筋トレ記録をクリアしますか？')) return;
    const next = clearStrengthAll();
    setLog(next.strengthLog);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-stretch">
        <div className="card p-4 flex items-center gap-2 flex-1">
          <label className="label shrink-0">ルーティン</label>
          <select className="input" value={routineId} onChange={(e) => setRoutineId(e.target.value)}>
            {routines.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setEditorOpen(true)}
          className="shrink-0 w-12 rounded-xl bg-paper-100 text-ink-700 hover:bg-paper-200 text-lg"
          aria-label="筋トレを編集"
        >
          ✎
        </button>
      </div>

      <div className="card p-4 space-y-4">
        <div className="flex items-center justify-between text-xs text-ink-500">
          <span>
            {index + 1} / {routine.items.length}
          </span>
          <span className="chip">
            目安 {item.defaultReps} × {item.defaultSets}
          </span>
        </div>

        <div className="space-y-1">
          <div className="label">意識すべきポイント</div>
          <p className="text-3xl sm:text-4xl font-extrabold leading-tight text-ink-900">{item.cue}</p>
        </div>

        <div>
          <div className="label">種目</div>
          <p className="text-xl font-semibold text-ink-900">{item.name}</p>
        </div>

        <div className="bg-paper-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="label">回数（このセット）</span>
            <span className="text-xs text-ink-500">完了セット: {setsDone}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={minusOne} className="btn-outline w-14 text-2xl" aria-label="マイナス1">
              −
            </button>
            <span className="text-6xl font-bold tabular-nums text-ink-900">{reps}</span>
            <button type="button" onClick={plusOne} className="btn-primary w-24 text-2xl" aria-label="プラス1">
              +1
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              className="input"
              placeholder="直接入力（回数）"
              value={manualReps}
              onChange={(e) => setManualReps(e.target.value)}
            />
            <button
              type="button"
              className="btn-soft"
              onClick={() => {
                const n = Number(manualReps);
                if (Number.isFinite(n) && n > 0) recordSet(Math.floor(n));
              }}
            >
              記録
            </button>
          </div>
          <button type="button" className="btn-primary w-full" onClick={() => recordSet(reps)}>
            このセットを記録（{reps}回）
          </button>
        </div>

        {sets.length > 0 && (
          <div className="bg-white border border-paper-200 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="label">記録済みセット</span>
              <button className="text-xs text-red-600" onClick={clearItem}>
                この種目をクリア
              </button>
            </div>
            <ul className="mt-2 flex flex-wrap gap-2">
              {sets.map((s, i) => (
                <li key={i} className="chip bg-accent-soft text-accent-ink">
                  {i + 1}set: {s.reps}回
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button className="btn-outline" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
            ← 前の種目
          </button>
          <button
            className="btn-outline"
            onClick={() => setIndex((i) => Math.min(routine.items.length - 1, i + 1))}
            disabled={index === routine.items.length - 1}
          >
            次の種目 →
          </button>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="label">今日のサマリー</div>
          <button className="text-xs text-red-600" onClick={clearAll}>
            全クリア
          </button>
        </div>
        <ul className="mt-2 divide-y divide-paper-200 text-sm">
          {routine.items.map((it) => {
            const ss = log[it.id] ?? [];
            return (
              <li key={it.id} className="py-2 flex items-center justify-between">
                <span className="text-ink-700">{it.name}</span>
                <span className="text-ink-500 text-xs">
                  {ss.length > 0 ? `${ss.length}set / 合計${ss.reduce((a, b) => a + b.reps, 0)}回` : '未実施'}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <StrengthEditor open={editorOpen} onClose={() => setEditorOpen(false)} routines={routines} onSave={handleEditorSave} />
    </div>
  );
}
