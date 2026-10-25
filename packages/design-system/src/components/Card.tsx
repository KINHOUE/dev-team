import type { HTMLAttributes } from 'react';
import { cx } from '../utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Padding interne : 'none' | 'sm' | 'md' | 'lg'. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
} as const;

export function Card({ padding = 'md', className, ...props }: CardProps) {
  return (
    <div
      className={cx(
        'bg-surface border border-border rounded-lg',
        paddings[padding],
        className,
      )}
      {...props}
    />
  );
}
