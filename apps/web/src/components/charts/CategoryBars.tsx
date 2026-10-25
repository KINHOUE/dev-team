import CategoryIcon from '../CategoryIcon';

export interface CategoryBarItem {
  name: string;
  icon: string;
  value: number;
  color: string;
}

interface CategoryBarsProps {
  items: CategoryBarItem[];
  formatValue: (value: number) => string;
}

/** Barres horizontales : une ligne par catégorie, longueur proportionnelle au montant. */
export default function CategoryBars({ items, formatValue }: CategoryBarsProps) {
  const max = Math.max(1, ...items.map((item) => item.value));
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <ul className="flex flex-col gap-3" aria-label="Dépenses par catégorie">
      {items.map((item) => {
        const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
        return (
          <li key={item.name} className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-raised"
                style={{ color: item.color }}
              >
                <CategoryIcon icon={item.icon} className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 truncate">{item.name}</span>
              <span className="text-xs text-text-muted">{percent} %</span>
              <span className="tabular-nums">{formatValue(item.value)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-raised">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(3, (item.value / max) * 100)}%`,
                  background: item.color,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
