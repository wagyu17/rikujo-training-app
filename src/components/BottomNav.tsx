import type { TabKey } from '../types';

const items: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: 'drills', label: 'ドリル', icon: '🏃' },
  { key: 'strength', label: '筋トレ', icon: '🏋️' },
  { key: 'log', label: '練習記録', icon: '📝' },
];

interface Props {
  active: TabKey;
  onChange: (k: TabKey) => void;
}

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur border-t border-paper-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto max-w-screen-sm grid grid-cols-3">
        {items.map((it) => {
          const on = active === it.key;
          return (
            <li key={it.key}>
              <button
                type="button"
                onClick={() => onChange(it.key)}
                className={
                  'w-full h-16 flex flex-col items-center justify-center gap-0.5 text-xs ' +
                  (on ? 'text-accent-ink' : 'text-ink-500')
                }
                aria-current={on ? 'page' : undefined}
              >
                <span className="text-xl leading-none" aria-hidden>
                  {it.icon}
                </span>
                <span className={on ? 'font-semibold' : ''}>{it.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
