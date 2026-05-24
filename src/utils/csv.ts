import type { PracticeLog } from '../types';

const COLUMNS = [
  'date',
  'category',
  'menu_title_ja',
  'menu_title_en',
  'sets',
  'reps',
  'distance_m',
  'time_sec',
  'intensity',
  'rest_m',
  'rest_sec',
  'rest_type',
  'environment',
  'incline',
  'load',
  'rpe',
  'condition',
  'pain',
  'temperature',
  'humidity',
  'wind_direction',
  'wind_speed',
  'details',
] as const;

function escapeCell(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function logsToCsv(logs: PracticeLog[]): string {
  const header = COLUMNS.join(',');
  const rows = logs.map((l) =>
    [
      l.date,
      l.category,
      l.menuTitleJa,
      l.menuTitleEn,
      l.params.sets ?? '',
      l.params.reps ?? '',
      l.params.distanceM ?? '',
      l.params.timeSec ?? '',
      l.params.intensity ?? '',
      l.params.restM ?? '',
      l.params.restSec ?? '',
      l.params.restType ?? '',
      l.params.environment ?? '',
      l.params.incline ?? '',
      l.params.load ?? '',
      l.rpe,
      l.condition,
      l.pain ? 'yes' : 'no',
      l.weather?.temperatureC ?? '',
      l.weather?.humidity ?? '',
      l.weather?.windDirectionDeg ?? '',
      l.weather?.windSpeedMs ?? '',
      l.details ?? '',
    ]
      .map(escapeCell)
      .join(','),
  );
  return [header, ...rows].join('\r\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const bom = '﻿';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
