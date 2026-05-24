import type { HistoryField } from '../types';

interface Props<T extends string | number> {
  field: HistoryField;
  history: Array<string | number> | undefined;
  onPick: (v: T) => void;
  onDelete?: (v: string | number) => void;
  format?: (v: T) => string;
  className?: string;
}

export function QuickHistory<T extends string | number>({
  history,
  onPick,
  onDelete,
  format,
  className = '',
}: Props<T>) {
  if (!history || history.length === 0) return null;
  return (
    <div className={'flex flex-wrap gap-1.5 mt-1.5 ' + className}>
      <span className="text-[10px] text-ink-300 self-center mr-1">履歴:</span>
      {history.map((v) => {
        const display = format ? format(v as T) : String(v);
        return (
          <span key={String(v)} className="inline-flex">
            <button
              type="button"
              onClick={() => onPick(v as T)}
              className="px-2.5 py-1 rounded-l-full text-xs bg-paper-100 text-ink-700 border border-paper-300 hover:bg-accent-soft active:scale-[0.97]"
            >
              {display}
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(v)}
                className="px-1.5 py-1 rounded-r-full text-[10px] bg-paper-100 text-ink-300 border border-l-0 border-paper-300 hover:text-red-600"
                aria-label={`${display} を履歴から削除`}
              >
                ×
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}
