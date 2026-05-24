import { useState } from 'react';
import type { DrillItem, DrillRoutine } from '../types';
import { Modal } from './Modal';

interface Props {
  open: boolean;
  onClose: () => void;
  routines: DrillRoutine[];
  onSave: (routines: DrillRoutine[]) => void;
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function DrillEditor({ open, onClose, routines, onSave }: Props) {
  const [list, setList] = useState<DrillRoutine[]>(routines);
  const [activeId, setActiveId] = useState<string>(routines[0]?.id ?? '');

  const active = list.find((r) => r.id === activeId) ?? list[0];

  function commit(next: DrillRoutine[]) {
    setList(next);
  }

  function updateItems(routineId: string, items: DrillItem[]) {
    commit(list.map((r) => (r.id === routineId ? { ...r, items } : r)));
  }

  function addItem() {
    if (!active) return;
    const newItem: DrillItem = { id: uid(), name: '新しい種目', cue: '意識ポイント', durationSec: 30 };
    updateItems(active.id, [...active.items, newItem]);
  }

  function removeItem(id: string) {
    if (!active) return;
    updateItems(active.id, active.items.filter((i) => i.id !== id));
  }

  function patchItem(id: string, patch: Partial<DrillItem>) {
    if (!active) return;
    updateItems(active.id, active.items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function move(id: string, dir: -1 | 1) {
    if (!active) return;
    const idx = active.items.findIndex((i) => i.id === id);
    if (idx < 0) return;
    const target = idx + dir;
    if (target < 0 || target >= active.items.length) return;
    const next = [...active.items];
    [next[idx], next[target]] = [next[target], next[idx]];
    updateItems(active.id, next);
  }

  function addRoutine() {
    const r: DrillRoutine = { id: uid(), name: '新しいルーティン', items: [] };
    const next = [...list, r];
    commit(next);
    setActiveId(r.id);
  }

  function renameRoutine(routineId: string, name: string) {
    commit(list.map((r) => (r.id === routineId ? { ...r, name } : r)));
  }

  function setReferenceUrl(routineId: string, url: string) {
    commit(list.map((r) => (r.id === routineId ? { ...r, referenceUrl: url || undefined } : r)));
  }

  function deleteRoutine(routineId: string) {
    if (!confirm('このルーティンを削除しますか？')) return;
    const next = list.filter((r) => r.id !== routineId);
    commit(next);
    if (activeId === routineId) setActiveId(next[0]?.id ?? '');
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="ドリルを編集"
      footer={
        <div className="flex gap-2">
          <button className="btn-ghost flex-1" onClick={onClose}>
            キャンセル
          </button>
          <button
            className="btn-primary flex-1"
            onClick={() => {
              onSave(list);
              onClose();
            }}
          >
            保存
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <div className="label mb-1">ルーティン</div>
          <div className="flex flex-wrap gap-2 items-center">
            {list.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveId(r.id)}
                className={
                  'px-3 py-1.5 rounded-full text-sm border ' +
                  (r.id === activeId
                    ? 'bg-accent text-white border-accent'
                    : 'bg-white text-ink-700 border-paper-300')
                }
              >
                {r.name}
              </button>
            ))}
            <button onClick={addRoutine} className="px-3 py-1.5 rounded-full text-sm bg-paper-100 text-ink-700">
              + 追加
            </button>
          </div>
        </div>

        {active && (
          <>
            <div>
              <label className="label">ルーティン名</label>
              <div className="flex gap-2">
                <input
                  className="input"
                  value={active.name}
                  onChange={(e) => renameRoutine(active.id, e.target.value)}
                />
                <button className="btn-danger px-3" onClick={() => deleteRoutine(active.id)}>
                  削除
                </button>
              </div>
            </div>

            <div>
              <label className="label">参考動画URL（任意）</label>
              <input
                className="input"
                placeholder="例: https://youtu.be/xxxx"
                value={active.referenceUrl ?? ''}
                onChange={(e) => setReferenceUrl(active.id, e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="label">種目（{active.items.length}）</span>
                <button onClick={addItem} className="btn-soft text-sm">
                  + 種目を追加
                </button>
              </div>
              <ul className="space-y-3">
                {active.items.map((it, idx) => (
                  <li key={it.id} className="card p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="chip">{idx + 1}</span>
                      <input
                        className="input"
                        placeholder="種目名"
                        value={it.name}
                        onChange={(e) => patchItem(it.id, { name: e.target.value })}
                      />
                    </div>
                    <textarea
                      className="input min-h-[60px]"
                      placeholder="意識ポイント"
                      value={it.cue}
                      onChange={(e) => patchItem(it.id, { cue: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="label">タイマー(秒)</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          className="input"
                          value={it.durationSec ?? ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            patchItem(it.id, {
                              durationSec: v === '' ? undefined : Math.max(0, Number(v)),
                            });
                          }}
                        />
                      </div>
                      <div>
                        <span className="label">回数表記（任意）</span>
                        <input
                          className="input"
                          placeholder="例: 左右 各10回"
                          value={it.reps ?? ''}
                          onChange={(e) => patchItem(it.id, { reps: e.target.value || undefined })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between gap-2">
                      <div className="flex gap-1">
                        <button className="btn-outline px-3 text-sm" onClick={() => move(it.id, -1)}>
                          ↑
                        </button>
                        <button className="btn-outline px-3 text-sm" onClick={() => move(it.id, 1)}>
                          ↓
                        </button>
                      </div>
                      <button className="btn-danger text-sm" onClick={() => removeItem(it.id)}>
                        この種目を削除
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
