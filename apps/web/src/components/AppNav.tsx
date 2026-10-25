import { cx } from '@dev-team/design-system';
import type { ReactNode } from 'react';

export interface NavItem<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
}

interface AppNavProps<T extends string> {
  items: NavItem<T>[];
  active: T;
  onChange: (id: T) => void;
  /** Variante d'affichage : onglets principaux ou sous-navigation. */
  variant?: 'primary' | 'sub';
  className?: string;
}

export default function AppNav<T extends string>({
  items,
  active,
  onChange,
  variant = 'sub',
  className,
}: AppNavProps<T>) {
  const isPrimary = variant === 'primary';

  return (
    <nav
      className={cx(
        'flex gap-1 overflow-x-auto',
        isPrimary
          ? 'rounded-lg border border-border bg-surface p-1'
          : 'border-b border-border pb-px',
        className,
      )}
      aria-label={isPrimary ? 'Modules' : 'Sections'}
    >
      {items.map((item) => {
        const selected = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cx(
              'inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors',
              isPrimary ? 'rounded-md px-3 py-2' : 'border-b-2 px-3 py-2',
              selected
                ? isPrimary
                  ? 'bg-accent text-accent-contrast'
                  : 'border-accent text-accent'
                : isPrimary
                  ? 'text-text-muted hover:text-text'
                  : 'border-transparent text-text-muted hover:text-text',
            )}
            aria-current={selected ? 'page' : undefined}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
