import type { Filter } from '../types';

const tabs: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'todo', label: 'À faire' },
  { value: 'done', label: 'Faites' },
];

interface FilterTabsProps {
  filter: Filter;
  onChange: (filter: Filter) => void;
  total: number;
  todo: number;
  done: number;
}

export default function FilterTabs({
  filter,
  onChange,
  total,
  todo,
  done,
}: FilterTabsProps) {
  const counts: Record<Filter, number> = { all: total, todo, done };

  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtre des tâches">
      {tabs.map((tab) => {
        const active = filter === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? 'border-transparent bg-accent text-accent-contrast'
                : 'border-border bg-surface text-text-muted hover:text-text'
            }`}
          >
            {tab.label}
            <span className={`text-xs ${active ? 'opacity-80' : 'opacity-60'}`}>
              {counts[tab.value]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
