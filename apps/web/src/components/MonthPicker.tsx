import { Button } from '@dev-team/design-system';
import { monthLabel } from '../lib/money';

interface MonthPickerProps {
  month: string;
  onChange: (month: string) => void;
}

function shiftMonth(month: string, delta: number): string {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(year, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export default function MonthPicker({ month, onChange }: MonthPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="secondary"
        aria-label="Mois précédent"
        onClick={() => onChange(shiftMonth(month, -1))}
      >
        ‹
      </Button>
      <span className="min-w-[9rem] text-center text-sm font-medium capitalize">
        {monthLabel(month)}
      </span>
      <Button
        size="sm"
        variant="secondary"
        aria-label="Mois suivant"
        onClick={() => onChange(shiftMonth(month, 1))}
      >
        ›
      </Button>
    </div>
  );
}
