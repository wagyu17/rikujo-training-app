export type TabKey = 'drills' | 'strength' | 'log';

export interface DrillItem {
  id: string;
  name: string;
  cue: string;
  durationSec?: number;
  reps?: string;
}

export interface DrillRoutine {
  id: string;
  name: string;
  items: DrillItem[];
  referenceUrl?: string;
}

export interface StrengthItem {
  id: string;
  name: string;
  cue: string;
  defaultReps: number;
  defaultSets: number;
}

export interface StrengthRoutine {
  id: string;
  name: string;
  items: StrengthItem[];
}

export type StrengthLog = Record<string, Array<{ reps: number; ts: number }>>;

export type MenuCategory =
  | 'interval'
  | 'repetition'
  | 'tempo'
  | 'fartlek'
  | 'pace'
  | 'change'
  | 'jog'
  | 'long'
  | 'hill';

export type RestType = 'jog' | 'walk' | 'rest';

export interface MenuParams {
  category: MenuCategory;
  sets: number;
  reps: number;
  distanceM?: number;
  timeSec?: number;
  intensity?: string;
  restM?: number;
  restSec?: number;
  restType?: RestType;
  environment?: string;
  incline?: string;
  load?: string;
  note?: string;
}

export interface WeatherSnapshot {
  temperatureC: number | null;
  humidity: number | null;
  windDirectionDeg: number | null;
  windSpeedMs: number | null;
  fetchedAt: number;
  lat?: number;
  lon?: number;
  error?: string;
}

export interface PracticeLog {
  id: string;
  date: string;
  category: MenuCategory;
  menuTitleJa: string;
  menuTitleEn: string;
  params: MenuParams;
  rpe: number;
  condition: number;
  pain: boolean;
  weather: WeatherSnapshot | null;
  details: string;
  createdAt: number;
}

export type HistoryField =
  | 'distance'
  | 'time'
  | 'reps'
  | 'sets'
  | 'restM'
  | 'restSec'
  | 'intensity'
  | 'environment'
  | 'incline'
  | 'load';

export type InputHistory = Partial<Record<HistoryField, Array<string | number>>>;

export interface UserSettings {
  hrMax: number;
  defaultEnvironment: string;
  defaultRestType: RestType;
}

export interface AppState {
  practiceLogs: PracticeLog[];
  strengthLog: StrengthLog;
  customDrillRoutines: DrillRoutine[];
  customStrengthRoutines: StrengthRoutine[];
  inputHistory: InputHistory;
  settings: UserSettings;
  seeded: boolean;
  appliedSeeds: string[];
}
