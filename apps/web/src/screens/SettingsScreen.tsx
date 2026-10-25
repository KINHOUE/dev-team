import { useState } from 'react';
import { Button, Card, cx } from '@dev-team/design-system';
import { CURRENCY_OPTIONS, currencySymbol } from '../lib/money';

interface SettingsScreenProps {
  currency: string;
  onCurrencyChange: (currency: string) => Promise<void>;
}

export default function SettingsScreen({ currency, onCurrencyChange }: SettingsScreenProps) {
  const [draft, setDraft] = useState(currency);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const changed = draft !== currency;

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await onCurrencyChange(draft);
      setMessage('Devise enregistrée. Les montants sont désormais affichés dans cette devise.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de l’enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Card padding="md" className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold">Devise du compte</h2>
          <p className="text-xs text-text-muted">
            Tous vos budgets, dépenses et prévisions sont affichés dans cette devise.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {CURRENCY_OPTIONS.map((option) => (
            <button
              key={option.code}
              type="button"
              onClick={() => setDraft(option.code)}
              className={cx(
                'flex items-center justify-between rounded-md border px-3 py-2.5 text-left text-sm transition-colors',
                draft === option.code
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-border bg-surface text-text hover:border-border-strong',
              )}
              aria-pressed={draft === option.code}
            >
              <span>{option.label}</span>
              <span className="font-semibold">{currencySymbol(option.code)}</span>
            </button>
          ))}
        </div>

        {changed && (
          <p className="text-xs text-warning">
            Les montants existants ne sont pas convertis — seule la devise d'affichage change.
          </p>
        )}
        {message && <p className="text-xs text-success">{message}</p>}
        {error && <p className="text-sm text-danger">{error}</p>}

        <div>
          <Button onClick={() => void save()} disabled={!changed || saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer la devise'}
          </Button>
        </div>
      </Card>

      <Card padding="md" className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">À propos</h2>
        <p className="text-xs text-text-muted">
          Application de finances personnelles et de gestion de tâches. Saisie vocale via le
          navigateur, aucun enregistrement audio n'est envoyé à un serveur : la transcription
          est fournie par le navigateur.
        </p>
      </Card>
    </div>
  );
}
