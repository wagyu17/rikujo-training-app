export interface HRZone {
  key: 'recovery' | 'easy' | 'lt' | 'vo2';
  label: string;
  shortEn: string;
  pctLow: number;
  pctHigh: number;
  bpmLow: number;
  bpmHigh: number;
}

export function hrZones(hrMax: number): HRZone[] {
  const at = (pct: number) => Math.round((hrMax * pct) / 100);
  return [
    {
      key: 'recovery',
      label: 'Recovery Jog',
      shortEn: 'E-rec',
      pctLow: 50,
      pctHigh: 70,
      bpmLow: at(50),
      bpmHigh: at(70),
    },
    {
      key: 'easy',
      label: 'Easy Run',
      shortEn: 'E',
      pctLow: 70,
      pctHigh: 80,
      bpmLow: at(70),
      bpmHigh: at(80),
    },
    {
      key: 'lt',
      label: 'Threshold (LT)',
      shortEn: 'T',
      pctLow: 82,
      pctHigh: 88,
      bpmLow: at(82),
      bpmHigh: at(88),
    },
    {
      key: 'vo2',
      label: 'VO2max',
      shortEn: 'I',
      pctLow: 90,
      pctHigh: 95,
      bpmLow: at(90),
      bpmHigh: at(95),
    },
  ];
}

export function intensityChoicesFromHR(hrMax: number): string[] {
  const zs = hrZones(hrMax);
  return zs.map((z) => `${z.shortEn} ${z.bpmLow}-${z.bpmHigh}bpm`);
}
