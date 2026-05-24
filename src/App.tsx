import { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import type { TabKey } from './types';
import { DrillsTab } from './tabs/DrillsTab';
import { StrengthTab } from './tabs/StrengthTab';
import { PracticeLogTab } from './tabs/PracticeLogTab';
import { unlockAudio } from './utils/beep';

const TITLES: Record<TabKey, string> = {
  drills: 'ドリル',
  strength: '筋トレ',
  log: '練習記録',
};

export default function App() {
  const [tab, setTab] = useState<TabKey>('drills');

  return (
    <div className="min-h-full bg-paper-50 text-ink-700" onPointerDownCapture={() => unlockAudio()}>
      <header
        className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-paper-200"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="mx-auto max-w-screen-sm px-4 h-14 flex items-center justify-between">
          <h1 className="text-base font-semibold text-ink-900">{TITLES[tab]}</h1>
          <span className="text-[11px] text-ink-300">Training Log</span>
        </div>
      </header>

      <main className="mx-auto max-w-screen-sm px-4 pt-4 pb-28">
        {tab === 'drills' && <DrillsTab />}
        {tab === 'strength' && <StrengthTab />}
        {tab === 'log' && <PracticeLogTab />}
      </main>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
