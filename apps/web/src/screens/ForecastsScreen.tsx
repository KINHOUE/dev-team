import { useState } from 'react';
import { Button, Card, Input } from '@dev-team/design-system';
import type { Category, Forecast } from '../types';
import CategoryIcon from '../components/CategoryIcon';
import { formatMoney, parseAmountToCents } from '../lib/money';

interface ForecastsScreenProps {
  forecasts: Forecast[];
  categories: Category[];
  currency: string;
  month: string;
  onAdd: (input: {
    month: string;
    categoryId: string | null;
    amountCents: number;
    note: string | null;
  }) => Promise<void>;
  onEdit: (id: string, input: { amountCents?: number; note?: string | null }) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export default function ForecastsScreen({
  forecasts,
  categories,
  currency,
  month,
  onAdd,
  onEdit,
  onRemove,
}: ForecastsScreenProps) {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = forecasts.reduce((sum, f) => sum + f.amountCents, 0);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const amountCents = parseAmountToCents(amount);
    if (amountCents <= 0) {
      setError('Saisissez un montant supérieur à zéro.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onAdd({
        month,
        categoryId: categoryId || null,
        amountCents,
        note: note.trim() ? note.trim() : null,
      });
      setAmount('');
      setNote('');
      setCategoryId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de l’enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (forecast: Forecast) => {
    const label = forecast.note || forecast.category?.name || 'cette prévision';
    if (!window.confirm(`Supprimer ${label} ?`)) return;
    await onRemove(forecast.id);
  };

  return (
    <div className="flex flex-col gap-5">
      <Card padding="md">
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-semibold">Ajouter une prévision</h2>
            <p className="text-xs text-text-muted">
              Anticipez vos dépenses du mois. Total prévu actuel :{' '}
              <strong className="text-text">{formatMoney(total, currency)}</strong>.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Montant prévu"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="forecast-category" className="text-sm font-medium text-text">
                Catégorie (optionnel)
              </label>
              <select
                id="forecast-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                <option value="">Prévision globale</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Input
            label="Note (optionnel)"
            placeholder="Ex. rentrée scolaire"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={255}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <div>
            <Button type="submit" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Ajouter la prévision'}
            </Button>
          </div>
        </form>
      </Card>

      <Card padding="md" className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Prévisions du mois</h2>
        {forecasts.length === 0 ? (
          <p className="py-4 text-sm text-text-muted">Aucune prévision enregistrée.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {forecasts.map((forecast) => (
              <li key={forecast.id} className="flex items-center gap-3 py-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-raised text-text-muted">
                  <CategoryIcon icon={forecast.category?.icon ?? 'tag'} className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">
                    {forecast.category?.name ?? 'Prévision globale'}
                  </div>
                  {forecast.note && (
                    <div className="truncate text-xs text-text-muted">{forecast.note}</div>
                  )}
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {formatMoney(forecast.amountCents, currency)}
                </span>
                <EditForecastButton
                  forecast={forecast}
                  currency={currency}
                  onEdit={onEdit}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-danger"
                  aria-label="Supprimer la prévision"
                  onClick={() => void handleRemove(forecast)}
                >
                  ✕
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function EditForecastButton({
  forecast,
  currency,
  onEdit,
}: {
  forecast: Forecast;
  currency: string;
  onEdit: ForecastsScreenProps['onEdit'];
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(forecast.amountCents / 100));
  const [saving, setSaving] = useState(false);

  if (!open) {
    return (
      <Button size="sm" variant="ghost" aria-label="Modifier la prévision" onClick={() => setOpen(true)}>
        ✎
      </Button>
    );
  }

  return (
    <form
      className="flex items-center gap-1"
      onSubmit={async (event) => {
        event.preventDefault();
        const amountCents = parseAmountToCents(value);
        if (amountCents <= 0) return;
        setSaving(true);
        try {
          await onEdit(forecast.id, { amountCents });
          setOpen(false);
        } finally {
          setSaving(false);
        }
      }}
    >
      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label={`Montant de la prévision en ${currency}`}
        className="h-8 w-24 rounded-md border border-border bg-surface px-2 text-right text-sm tabular-nums focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      <Button type="submit" size="sm" variant="secondary" disabled={saving}>
        OK
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
        ✕
      </Button>
    </form>
  );
}
