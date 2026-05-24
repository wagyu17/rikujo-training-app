import { useEffect, useMemo, useState } from 'react';
import type { HistoryField, MenuCategory, MenuParams, PracticeLog, RestType } from '../types';
import {
  addPracticeLog,
  deleteHistory,
  deletePracticeLog,
  loadState,
  recordHistory,
  updateSettings,
} from '../store/localStore';
import { fetchWeather, windDirectionLabel } from '../utils/weather';
import { downloadCsv, logsToCsv } from '../utils/csv';
import { toIAAF, toJapaneseTitle } from '../utils/iaaf';
import { hrZones } from '../utils/hrZones';
import { CopyButton } from '../components/CopyButton';
import { QuickHistory } from '../components/QuickHistory';

const CATEGORIES: Array<{ key: MenuCategory; label: string }> = [
  { key: 'interval', label: 'インターバル' },
  { key: 'repetition', label: 'レペティション' },
  { key: 'tempo', label: 'テンポ走' },
  { key: 'pace', label: 'ペースラン' },
  { key: 'fartlek', label: 'ファルトレク' },
  { key: 'change', label: '変化走' },
  { key: 'hill', label: '坂ダッシュ' },
  { key: 'long', label: 'ロング走' },
  { key: 'jog', label: 'ジョグ' },
];

const REST_TYPES: Array<{ key: RestType; label: string }> = [
  { key: 'jog', label: 'jog (ジョグ繋ぎ)' },
  { key: 'walk', label: 'walk (歩き)' },
  { key: 'rest', label: 'rest (完全休息)' },
];

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function PracticeLogTab() {
  const initial = loadState();
  const [logs, setLogs] = useState<PracticeLog[]>(initial.practiceLogs);
  const [history, setHistory] = useState(initial.inputHistory);
  const [settings, setSettings] = useState(initial.settings);

  const [category, setCategory] = useState<MenuCategory>('interval');
  const [params, setParams] = useState<MenuParams>({
    category: 'interval',
    sets: 1,
    reps: 5,
    distanceM: 1000,
    restM: 200,
    restType: 'jog',
    environment: initial.settings.defaultEnvironment,
  });

  const [date, setDate] = useState<string>(todayStr());
  const [rpe, setRpe] = useState<number>(3);
  const [condition, setCondition] = useState<number>(3);
  const [pain, setPain] = useState<boolean>(false);
  const [details, setDetails] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [weatherEnabled, setWeatherEnabled] = useState(true);

  useEffect(() => {
    setParams((p) => ({ ...p, category }));
  }, [category]);

  const titleEn = useMemo(() => toIAAF({ ...params, category }), [params, category]);
  const titleJa = useMemo(() => toJapaneseTitle({ ...params, category }), [params, category]);

  const previous = useMemo(() => {
    return logs.find(
      (l) =>
        l.category === category &&
        (l.params.distanceM ?? null) === (params.distanceM ?? null) &&
        (l.params.reps ?? null) === (params.reps ?? null),
    );
  }, [logs, category, params.distanceM, params.reps]);

  function pushHistory(field: HistoryField, value: string | number | undefined | null) {
    const next = recordHistory(field, value);
    if (next) setHistory(next.inputHistory);
  }

  function removeHistory(field: HistoryField, value: string | number) {
    const next = deleteHistory(field, value);
    setHistory(next.inputHistory);
  }

  async function handleSave() {
    setSaving(true);
    const weather = weatherEnabled ? await fetchWeather() : null;
    const finalParams: MenuParams = { ...params, category };
    const log: PracticeLog = {
      id: Math.random().toString(36).slice(2),
      date,
      category,
      menuTitleJa: titleJa,
      menuTitleEn: titleEn,
      params: finalParams,
      rpe,
      condition,
      pain,
      weather,
      details,
      createdAt: Date.now(),
    };
    const after = addPracticeLog(log);
    setLogs(after.practiceLogs);

    // record histories
    pushHistory('distance', finalParams.distanceM);
    pushHistory('time', finalParams.timeSec);
    pushHistory('reps', finalParams.reps);
    pushHistory('sets', finalParams.sets);
    pushHistory('restM', finalParams.restM);
    pushHistory('restSec', finalParams.restSec);
    pushHistory('intensity', finalParams.intensity);
    pushHistory('environment', finalParams.environment);
    pushHistory('incline', finalParams.incline);
    pushHistory('load', finalParams.load);

    setSaving(false);
    setDetails('');
    setPain(false);
  }

  function handleExport() {
    const csv = logsToCsv(logs);
    downloadCsv(`training-log-${todayStr()}.csv`, csv);
  }

  function handleDelete(id: string) {
    if (!confirm('この記録を削除しますか？')) return;
    const next = deletePracticeLog(id);
    setLogs(next.practiceLogs);
  }

  function handleHrMaxChange(v: number) {
    if (!Number.isFinite(v) || v < 100 || v > 230) return;
    const st = updateSettings({ hrMax: v });
    setSettings(st.settings);
  }

  return (
    <div className="space-y-4">
      {/* Settings: HRmax */}
      <div className="card p-4 flex items-center gap-2">
        <label className="label shrink-0">最大心拍 (HRmax)</label>
        <input
          type="number"
          inputMode="numeric"
          className="input"
          value={settings.hrMax}
          min={100}
          max={230}
          onChange={(e) => handleHrMaxChange(Number(e.target.value))}
        />
        <span className="text-xs text-ink-500">bpm</span>
      </div>

      {/* Category */}
      <div className="card p-4 space-y-3">
        <div>
          <div className="label mb-2">ステップ 1 — カテゴリ</div>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={
                  'btn text-sm ' +
                  (category === c.key ? 'bg-accent text-white' : 'bg-paper-100 text-ink-700')
                }
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Detail fields with history */}
        <div className="space-y-4">
          <div className="label">ステップ 2 — 詳細（履歴ボタンから1タップで入力可能）</div>

          <NumberWithHistory
            label="距離 (m)"
            field="distance"
            history={history.distance}
            value={params.distanceM}
            onChange={(v) => setParams((p) => ({ ...p, distanceM: v, timeSec: undefined }))}
            onDeleteHistory={(v) => removeHistory('distance', v)}
            placeholder="例: 1000"
          />

          <NumberWithHistory
            label="時間 (秒) — 距離の代わりに"
            field="time"
            history={history.time}
            value={params.timeSec}
            onChange={(v) => setParams((p) => ({ ...p, timeSec: v, distanceM: undefined }))}
            onDeleteHistory={(v) => removeHistory('time', v)}
            placeholder="例: 1200 (= 20分)"
          />

          <div className="grid grid-cols-2 gap-2">
            <NumberWithHistory
              label="本数 (Reps)"
              field="reps"
              history={history.reps}
              value={params.reps}
              onChange={(v) => setParams((p) => ({ ...p, reps: v ?? 1 }))}
              onDeleteHistory={(v) => removeHistory('reps', v)}
            />
            <NumberWithHistory
              label="セット (Sets)"
              field="sets"
              history={history.sets}
              value={params.sets}
              onChange={(v) => setParams((p) => ({ ...p, sets: v ?? 1 }))}
              onDeleteHistory={(v) => removeHistory('sets', v)}
            />
          </div>

          {/* Intensity with HR zone helpers */}
          <div>
            <div className="label mb-1">強度 (Intensity / Pace / HR)</div>
            <input
              className="input"
              placeholder={`例: T 165-175bpm, 3'00", I, R`}
              value={params.intensity ?? ''}
              onChange={(e) => setParams((p) => ({ ...p, intensity: e.target.value || undefined }))}
            />
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <span className="text-[10px] text-ink-300 self-center mr-1">HRゾーン:</span>
              {hrZones(settings.hrMax).map((z) => (
                <button
                  key={z.key}
                  type="button"
                  onClick={() =>
                    setParams((p) => ({ ...p, intensity: `${z.shortEn} ${z.bpmLow}-${z.bpmHigh}bpm` }))
                  }
                  className="px-2.5 py-1 rounded-full text-xs bg-paper-100 border border-paper-300 text-ink-700 hover:bg-accent-soft"
                >
                  {z.shortEn} {z.bpmLow}-{z.bpmHigh}
                </button>
              ))}
            </div>
            <QuickHistory
              field="intensity"
              history={history.intensity}
              onPick={(v) => setParams((p) => ({ ...p, intensity: String(v) }))}
              onDelete={(v) => removeHistory('intensity', v)}
            />
          </div>

          {/* Rest */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <NumberWithHistory
                label="リカバリー (m) — jog/walk"
                field="restM"
                history={history.restM}
                value={params.restM}
                onChange={(v) =>
                  setParams((p) => ({ ...p, restM: v, restSec: v ? undefined : p.restSec }))
                }
                onDeleteHistory={(v) => removeHistory('restM', v)}
              />
              <NumberWithHistory
                label="リカバリー (秒) — rest"
                field="restSec"
                history={history.restSec}
                value={params.restSec}
                onChange={(v) =>
                  setParams((p) => ({ ...p, restSec: v, restM: v ? undefined : p.restM }))
                }
                onDeleteHistory={(v) => removeHistory('restSec', v)}
              />
            </div>
            <div>
              <div className="label mb-1">リカバリー種別</div>
              <div className="grid grid-cols-3 gap-1.5">
                {REST_TYPES.map((rt) => (
                  <button
                    key={rt.key}
                    type="button"
                    onClick={() => setParams((p) => ({ ...p, restType: rt.key }))}
                    className={
                      'btn text-xs ' +
                      (params.restType === rt.key ? 'bg-accent text-white' : 'bg-paper-100 text-ink-700')
                    }
                  >
                    {rt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Environment / Incline / Load */}
          <div className="space-y-2">
            <div>
              <div className="label mb-1">環境 (Environment)</div>
              <input
                className="input"
                placeholder="Track / Road / Trail / Hill / Treadmill"
                value={params.environment ?? ''}
                onChange={(e) => setParams((p) => ({ ...p, environment: e.target.value || undefined }))}
              />
              <QuickHistory
                field="environment"
                history={history.environment}
                onPick={(v) => setParams((p) => ({ ...p, environment: String(v) }))}
                onDelete={(v) => removeHistory('environment', v)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="label mb-1">傾斜 (Incline)</div>
                <input
                  className="input"
                  placeholder="例: 5%"
                  value={params.incline ?? ''}
                  onChange={(e) => setParams((p) => ({ ...p, incline: e.target.value || undefined }))}
                />
                <QuickHistory
                  field="incline"
                  history={history.incline}
                  onPick={(v) => setParams((p) => ({ ...p, incline: String(v) }))}
                  onDelete={(v) => removeHistory('incline', v)}
                />
              </div>
              <div>
                <div className="label mb-1">負荷 (Load)</div>
                <input
                  className="input"
                  placeholder="例: Vest 5kg"
                  value={params.load ?? ''}
                  onChange={(e) => setParams((p) => ({ ...p, load: e.target.value || undefined }))}
                />
                <QuickHistory
                  field="load"
                  history={history.load}
                  onPick={(v) => setParams((p) => ({ ...p, load: String(v) }))}
                  onDelete={(v) => removeHistory('load', v)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* IAAF title + copy */}
        <div className="bg-paper-50 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="label">IAAFスタイル英語タイトル</div>
            <CopyButton text={titleEn} />
          </div>
          <p className="text-lg font-semibold text-ink-900 break-words font-mono">{titleEn}</p>
          <div className="text-xs text-ink-500">日本語: {titleJa}</div>
        </div>

        {previous && (
          <div className="text-xs text-ink-500 bg-paper-100 rounded-lg px-3 py-2">
            Previous ({previous.date}): {previous.menuTitleEn}
            {previous.details ? ` ／ ${previous.details}` : ''}
          </div>
        )}
      </div>

      {/* Conditions */}
      <div className="card p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">日付</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={weatherEnabled}
                onChange={(e) => setWeatherEnabled(e.target.checked)}
              />
              気象を自動取得（GPS）
            </label>
          </div>
        </div>

        <Slider label="RPE（運動強度）" value={rpe} onChange={setRpe} min={1} max={5} leftLabel="楽" rightLabel="きつい" />
        <Slider label="体のキレ・調子" value={condition} onChange={setCondition} min={1} max={5} leftLabel="悪い" rightLabel="最高" />

        <div>
          <div className="label mb-1">足の痛み・違和感</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPain(false)}
              className={'btn ' + (!pain ? 'bg-emerald-100 text-emerald-800' : 'bg-paper-100 text-ink-500')}
            >
              なし
            </button>
            <button
              type="button"
              onClick={() => setPain(true)}
              className={'btn ' + (pain ? 'bg-red-100 text-red-700' : 'bg-paper-100 text-ink-500')}
            >
              あり
            </button>
          </div>
        </div>

        <div>
          <label className="label">メモ（補足）</label>
          <textarea
            className="input min-h-[80px]"
            placeholder="例: 1本目から良い感覚、200mは33秒で揃った"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </div>

        <button type="button" className="btn-primary w-full text-lg" onClick={handleSave} disabled={saving}>
          {saving ? '保存中…（気象データ取得）' : '保存'}
        </button>
      </div>

      {/* Log list */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="label">最近の練習ログ（{logs.length}件）</div>
          <button className="btn-soft text-sm" onClick={handleExport} disabled={logs.length === 0}>
            CSVエクスポート
          </button>
        </div>
        {logs.length === 0 ? (
          <p className="text-sm text-ink-500 py-6 text-center">まだ記録がありません。</p>
        ) : (
          <ul className="divide-y divide-paper-200">
            {logs.slice(0, 30).map((l) => (
              <li key={l.id} className="py-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs text-ink-500 tabular-nums">{l.date}</span>
                  <div className="flex items-center gap-1">
                    <CopyButton text={l.menuTitleEn} label="Copy" />
                    <button className="text-xs text-red-600 px-2" onClick={() => handleDelete(l.id)}>
                      削除
                    </button>
                  </div>
                </div>
                <p className="text-sm font-mono font-semibold text-ink-900 mt-0.5 break-words">{l.menuTitleEn}</p>
                <p className="text-xs text-ink-500 break-words">{l.menuTitleJa}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className="chip">RPE {l.rpe}</span>
                  <span className="chip">調子 {l.condition}</span>
                  {l.pain && <span className="chip bg-red-50 text-red-700 border-red-100">痛み</span>}
                  {l.weather && l.weather.temperatureC !== null && (
                    <span className="chip">{l.weather.temperatureC.toFixed(1)}℃</span>
                  )}
                  {l.weather && l.weather.humidity !== null && <span className="chip">湿{l.weather.humidity}%</span>}
                  {l.weather && l.weather.windSpeedMs !== null && (
                    <span className="chip">
                      風 {windDirectionLabel(l.weather.windDirectionDeg)} {l.weather.windSpeedMs.toFixed(1)}m/s
                    </span>
                  )}
                </div>
                {l.details && <p className="text-xs text-ink-500 mt-1.5 break-words">{l.details}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function NumberWithHistory({
  label,
  field,
  history,
  value,
  onChange,
  onDeleteHistory,
  placeholder,
}: {
  label: string;
  field: HistoryField;
  history: Array<string | number> | undefined;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  onDeleteHistory: (v: string | number) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <div className="label mb-1">{label}</div>
      <input
        type="number"
        inputMode="numeric"
        className="input"
        placeholder={placeholder}
        value={value ?? ''}
        onChange={(e) => {
          const s = e.target.value;
          if (s === '') onChange(undefined);
          else {
            const n = Number(s);
            if (Number.isFinite(n)) onChange(n);
          }
        }}
      />
      <QuickHistory
        field={field}
        history={history}
        onPick={(v) => onChange(Number(v))}
        onDelete={onDeleteHistory}
      />
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  leftLabel,
  rightLabel,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  leftLabel: string;
  rightLabel: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="label">{label}</span>
        <span className="text-sm font-semibold text-ink-900">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#5b9bd5]"
      />
      <div className="flex justify-between text-[10px] text-ink-300">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
