import { presetNames, useTheme } from '@dev-team/design-system';
import type { ChangeEvent } from 'react';
import { setStoredTheme } from '../lib/storage';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value;
    setTheme(next);
    setStoredTheme(next);
  };

  return (
    <label className="flex items-center gap-2 text-sm text-text-muted">
      <span className="sr-only">Thème</span>
      <select
        value={theme.name}
        onChange={handleChange}
        className="h-9 rounded-md border border-border bg-surface px-2 text-sm text-text transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40"
      >
        {presetNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
