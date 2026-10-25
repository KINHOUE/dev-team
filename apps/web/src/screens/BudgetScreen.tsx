import { useState } from 'react';
import { Button, Card, Input } from '@dev-team/design-system';
import type { Budget, Category } from '../types';
import CategoryIcon from '../components/CategoryIcon';
import { centsToInput, formatMoney, parseAmountToCents } from '../lib/money';

interface BudgetScreenProps {
  globalBudget: Budget | null;
  categoryBudgets: Budget[];
  categories: Category[];
  currency: string;
  month: string;
  onSave: (input: {
    month: string;
    categoryId: string | null;
    amountCents: number;
  }) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

function GlobalBudgetCard({
  budget,
  currency,
  month,
  onSave,
  onRemove,
}: {
  budget: Budget | null;
  currency: string;
  month: string;
  onSave: BudgetScreenProps['onSave'];
  onRemove: BudgetScreenProps['onRemove'];
}) {
  const [editing, setEditing] = useState(!budget);
  const [value, setValue] = useState(budget ? centsToInput(budget.amountCents) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = () => {
    setEditing(false);
    setValue(budget ? centsToInput(budget.amountCents) : '');
    setError(null);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const amountCents = parseAmountToCents(value);
    if (amountCents <= 0) {
      setError('Saisissez un montant supérieur à zéro.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave({ month, categoryId: null, amountCents });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de l’enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!budget) return;
    if (
      !window.confirm(
        `Supprimer le budget global de ${formatMoney(budget.amountCents, currency)} pour ce mois ?`,
      )
    ) {
      return;
    }
    await onRemove(budget.id);
  };

  return (
    <Card padding="md" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Budget global du mois</h2>
          <p className="text-xs text-text-muted">
            Plafond total de dépenses pour le mois sélectionné.
          </p>
        </div>
        {budget && !editing && (
          <div className="flex shrink-0 items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              aria-label="Modifier le budget global"
              onClick={() => setEditing(true)}
            >
              ✎
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-danger"
              aria-label="Supprimer le budget global"
              onClick={() => void remove()}
            >
              ✕
            </Button>
          </div>
        )}
      </div>

      {editing ? (
        <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[12rem] flex-1">
            <Input
              label="Montant"
              inputMode="decimal"
              placeholder="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
          {budget && (
            <Button type="button" variant="ghost" onClick={cancel} disabled={saving}>
              Annuler
            </Button>
          )}
        </form>
      ) : (
        <p className="text-xl font-semibold tabular-nums">
          {budget ? formatMoney(budget.amountCents, currency) : '—'}
        </p>
      )}

      {!budget && !editing && (
        <p className="text-xs text-text-muted">Aucun budget défini pour ce mois.</p>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </Card>
  );
}

function CategoryBudgetRow({
  category,
  budget,
  currency,
  month,
  onSave,
  onRemove,
}: {
  category: Category;
  budget: Budget | undefined;
  currency: string;
  month: string;
  onSave: BudgetScreenProps['onSave'];
  onRemove: BudgetScreenProps['onRemove'];
}) {
  const [editing, setEditing] = useState(!budget);
  const [value, setValue] = useState(budget ? centsToInput(budget.amountCents) : '');
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const amountCents = parseAmountToCents(value);
    if (amountCents <= 0) return;
    setSaving(true);
    try {
      await onSave({ month, categoryId: category.id, amountCents });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!budget) return;
    if (
      !window.confirm(
        `Supprimer le budget « ${category.name} » (${formatMoney(budget.amountCents, currency)}) ?`,
      )
    ) {
      return;
    }
    await onRemove(budget.id);
  };

  return (
    <div className="flex items-center gap-3 border-b border-border py-2 last:border-0">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-raised text-text-muted">
        <CategoryIcon icon={category.icon} className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm">{category.name}</span>

      {editing ? (
        <form onSubmit={submit} className="flex items-center gap-2">
          <input
            inputMode="decimal"
            placeholder="—"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label={`Budget ${category.name}`}
            className="h-9 w-28 rounded-md border border-border bg-surface px-2 text-right text-sm tabular-nums text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <Button type="submit" size="sm" variant="secondary" disabled={saving}>
            {saving ? '…' : 'OK'}
          </Button>
          {budget && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={saving}
              onClick={() => {
                setEditing(false);
                setValue(centsToInput(budget.amountCents));
              }}
            >
              Annuler
            </Button>
          )}
        </form>
      ) : (
        <>
          <span className="text-sm font-medium tabular-nums">
            {budget ? formatMoney(budget.amountCents, currency) : '—'}
          </span>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              aria-label={`Modifier le budget ${category.name}`}
              onClick={() => setEditing(true)}
            >
              ✎
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-danger"
              aria-label={`Supprimer le budget ${category.name}`}
              onClick={() => void remove()}
            >
              ✕
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function BudgetScreen({
  globalBudget,
  categoryBudgets,
  categories,
  currency,
  month,
  onSave,
  onRemove,
}: BudgetScreenProps) {
  const byCategory = new Map(categoryBudgets.map((b) => [b.categoryId, b]));
  const totalCategoryBudget = categoryBudgets.reduce((sum, b) => sum + b.amountCents, 0);

  return (
    <div className="flex flex-col gap-5">
      <GlobalBudgetCard
        key={`global-${month}-${globalBudget?.amountCents ?? 0}`}
        budget={globalBudget}
        currency={currency}
        month={month}
        onSave={onSave}
        onRemove={onRemove}
      />

      <Card padding="md" className="flex flex-col gap-2">
        <div>
          <h2 className="text-sm font-semibold">Budgets par catégorie</h2>
          <p className="text-xs text-text-muted">
            Facultatif. Total des budgets catégorie :{' '}
            {formatMoney(totalCategoryBudget, currency)}.
          </p>
        </div>
        <div className="flex flex-col">
          {categories.length === 0 ? (
            <p className="py-4 text-sm text-text-muted">
              Créez d'abord des catégories dans l'onglet Catégories.
            </p>
          ) : (
            categories.map((category) => (
              <CategoryBudgetRow
                key={`${category.id}-${byCategory.get(category.id)?.amountCents ?? 0}`}
                category={category}
                budget={byCategory.get(category.id)}
                currency={currency}
                month={month}
                onSave={onSave}
                onRemove={onRemove}
              />
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
