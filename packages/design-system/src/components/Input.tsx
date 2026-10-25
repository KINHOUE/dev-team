import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label optionnel affiché au-dessus du champ. */
  label?: string;
  /** Message d'erreur (rend le champ rouge). */
  error?: string;
  /** Élément affiché à droite, dans le champ (ex. bouton afficher/masquer le mot de passe). */
  trailing?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, trailing, ...props },
  ref,
) {
  const inputId = id ?? (label ? undefined : undefined);
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          className={cx(
            'h-10 w-full rounded-md border bg-surface px-3 text-sm text-text placeholder:text-text-muted ' +
              'focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors',
            trailing ? 'pr-10' : '',
            error ? 'border-danger' : 'border-border',
            className,
          )}
          {...props}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {trailing}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
});
