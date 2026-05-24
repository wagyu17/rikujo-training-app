import {
  drillRoutines as seedDrills,
  strengthRoutines as seedStrength,
  seedInputHistory,
  runningDrill22,
} from '../data/presets';
import type {
  AppState,
  DrillRoutine,
  HistoryField,
  InputHistory,
  PracticeLog,
  StrengthLog,
  StrengthRoutine,
  UserSettings,
} from '../types';

const KEY = 'training-app:v2';

const DEFAULT_SETTINGS: UserSettings = {
  hrMax: 187,
  defaultEnvironment: 'Track',
  defaultRestType: 'jog',
};

const emptyState: AppState = {
  practiceLogs: [],
  strengthLog: {},
  customDrillRoutines: [],
  customStrengthRoutines: [],
  inputHistory: {},
  settings: DEFAULT_SETTINGS,
  seeded: false,
  appliedSeeds: [],
};

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function migrateV1(): Partial<AppState> | null {
  try {
    const old = localStorage.getItem('training-app:v1');
    if (!old) return null;
    const parsed = JSON.parse(old) as Partial<AppState>;
    return {
      practiceLogs: Array.isArray(parsed.practiceLogs) ? parsed.practiceLogs : [],
      strengthLog: parsed.strengthLog ?? {},
    };
  } catch {
    return null;
  }
}

export function loadState(): AppState {
  if (typeof window === 'undefined') return emptyState;
  let parsed: Partial<AppState> | null = null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) parsed = JSON.parse(raw) as Partial<AppState>;
  } catch {
    parsed = null;
  }

  if (!parsed) {
    parsed = migrateV1() ?? {};
  }

  const state: AppState = {
    practiceLogs: Array.isArray(parsed.practiceLogs) ? parsed.practiceLogs : [],
    strengthLog: parsed.strengthLog && typeof parsed.strengthLog === 'object' ? parsed.strengthLog : {},
    customDrillRoutines: Array.isArray(parsed.customDrillRoutines) ? parsed.customDrillRoutines : [],
    customStrengthRoutines: Array.isArray(parsed.customStrengthRoutines)
      ? parsed.customStrengthRoutines
      : [],
    inputHistory: (parsed.inputHistory ?? {}) as InputHistory,
    settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    seeded: !!parsed.seeded,
    appliedSeeds: Array.isArray(parsed.appliedSeeds) ? parsed.appliedSeeds : [],
  };

  let mutated = false;

  if (!state.seeded) {
    if (state.customDrillRoutines.length === 0) state.customDrillRoutines = deepClone(seedDrills);
    if (state.customStrengthRoutines.length === 0)
      state.customStrengthRoutines = deepClone(seedStrength);
    if (Object.keys(state.inputHistory).length === 0)
      state.inputHistory = deepClone(seedInputHistory);
    state.seeded = true;
    mutated = true;
  }

  // Idempotent additional seeds. Add a routine only once; if the user later deletes it,
  // it stays deleted because the seed id remains in appliedSeeds.
  const additional: Array<{ key: string; apply: (s: AppState) => void }> = [
    {
      key: 'drill-22-running',
      apply: (s) => {
        s.customDrillRoutines = [...s.customDrillRoutines, deepClone(runningDrill22)];
      },
    },
  ];
  for (const seed of additional) {
    if (!state.appliedSeeds.includes(seed.key)) {
      seed.apply(state);
      state.appliedSeeds = [...state.appliedSeeds, seed.key];
      mutated = true;
    }
  }

  if (mutated) saveState(state);
  return state;
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

export function updateState(updater: (s: AppState) => AppState): AppState {
  const cur = loadState();
  const next = updater(cur);
  saveState(next);
  return next;
}

// --- practice logs ---
export function addPracticeLog(log: PracticeLog): AppState {
  return updateState((s) => ({ ...s, practiceLogs: [log, ...s.practiceLogs] }));
}

export function deletePracticeLog(id: string): AppState {
  return updateState((s) => ({ ...s, practiceLogs: s.practiceLogs.filter((l) => l.id !== id) }));
}

// --- strength ---
export function appendStrength(itemId: string, reps: number): AppState {
  return updateState((s) => {
    const arr = s.strengthLog[itemId] ?? [];
    const next: StrengthLog = { ...s.strengthLog, [itemId]: [...arr, { reps, ts: Date.now() }] };
    return { ...s, strengthLog: next };
  });
}

export function resetStrengthForItem(itemId: string): AppState {
  return updateState((s) => ({ ...s, strengthLog: { ...s.strengthLog, [itemId]: [] } }));
}

export function clearStrengthAll(): AppState {
  return updateState((s) => ({ ...s, strengthLog: {} }));
}

// --- routines CRUD ---
export function saveDrillRoutines(routines: DrillRoutine[]): AppState {
  return updateState((s) => ({ ...s, customDrillRoutines: routines }));
}

export function saveStrengthRoutines(routines: StrengthRoutine[]): AppState {
  return updateState((s) => ({ ...s, customStrengthRoutines: routines }));
}

// --- input history ---
const MAX_HISTORY = 12;
export function recordHistory(
  field: HistoryField,
  value: string | number | undefined | null,
): AppState | null {
  if (value === undefined || value === null || value === '') return null;
  return updateState((s) => {
    const arr = s.inputHistory[field] ?? [];
    const exists = arr.findIndex((v) => String(v) === String(value));
    const next = exists >= 0 ? [value, ...arr.filter((_, i) => i !== exists)] : [value, ...arr];
    return {
      ...s,
      inputHistory: { ...s.inputHistory, [field]: next.slice(0, MAX_HISTORY) },
    };
  });
}

export function deleteHistory(field: HistoryField, value: string | number): AppState {
  return updateState((s) => {
    const arr = s.inputHistory[field] ?? [];
    return {
      ...s,
      inputHistory: { ...s.inputHistory, [field]: arr.filter((v) => String(v) !== String(value)) },
    };
  });
}

// --- settings ---
export function updateSettings(patch: Partial<UserSettings>): AppState {
  return updateState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
}

// --- reset ---
export function resetAll(): AppState {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  return loadState();
}
