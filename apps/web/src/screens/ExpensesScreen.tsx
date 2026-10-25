import { useMemo, useState } from 'react';
import { Button, Card } from '@dev-team/design-system';
import type { Category, Expense } from '../types';
import CategoryIcon from '../components/CategoryIcon';
import ExpenseForm, { type ExpenseFormValue } from '../components/ExpenseForm';
import { formatDate, formatMoney } from '../lib/money';

interface ExpensesScreenProps {
  expenses: Expense[];
  categories: Category[];
  currency: string;
  loading: boolean;
  onAdd: (value: ExpenseFormValue) => Promise<void>;
  onEdit: (id: string, value: Partial<ExpenseFormValue>) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export default function ExpensesScreen({
  expenses,
  categories,
  currency,
  loading,
  onAdd,
  onEdit,
  onRemove,
}: ExpensesScreenProps) {
  const [editing, setEditing] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');

  const visible = useMemo(() => {
    if (!filterCategory) return expenses;
    return expenses.filter((e) => e.categoryId === filterCategory);
  }, [expenses, filterCategory]);

  const visibleTotal = visible.reduce((sum, e) => sum + e.amountCents, 0);

  const handleSubmit = async (value: ExpenseFormValue) => {
    if (editing) {
      await onEdit(editing.id, value);
      setEditing(null);
    } else {
      await onAdd(value);
    }
  };

  const handleRemove = async (expense: Expense) => {
    const label = expense.note?.trim() || expense.category?.name || 'cette dépense';
    if (!window.confirm(`Supprimer ${label} (${formatMoney(expense.amountCents, currency)}) ?`)) {
      return;
    }
    await onRemove(expense.id);
    if (editing?.id === expense.id) setEditing(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <ExpenseForm
        key={editing?.id ?? 'new'}
        categories={categories}
        currency={currency}
        initial={editing}
        submitLabel={editing ? 'Enregistrer les modifications' : 'Ajouter la dépense'}
        onSubmit={handleSubmit}
        onCancel={editing ? () => setEditing(null) : undefined}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="filter-category" className="text-sm text-text-muted">
            Filtrer
          </label>
          <select
            id="filter-category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-9 rounded-md border border-border bg-surface px-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <span className="text-sm text-text-muted">
          {visible.length} dépense{visible.length > 1 ? 's' : ''} ·{' '}
          <span className="font-medium text-text">{formatMoney(visibleTotal, currency)}</span>
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-text-muted">Chargement…</p>
      ) : visible.length === 0 ? (
        <Card padding="lg" className="text-center text-sm text-text-muted">
          Aucune dépense pour ce mois. Ajoutez votre première dépense ci-dessus — ou dictez-la
          avec le bouton micro.
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((expense) => (
            <li
              key={expense.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-raised text-text-muted">
                <CategoryIcon icon={expense.category?.icon ?? 'tag'} className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">
                    {expense.category?.name ?? 'Sans catégorie'}
                  </span>
                  {expense.source === 'voice' && (
                    <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-medium text-accent">
                      vocal
                    </span>
                  )}
                </div>
                <div className="truncate text-xs text-text-muted">
                  {formatDate(expense.date)}
                  {expense.note ? ` · ${expense.note}` : ''}
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums">
                −{formatMoney(expense.amountCents, currency)}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditing(expense)}
                  aria-label="Modifier"
                >
                  ✎
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-danger"
                  onClick={() => void handleRemove(expense)}
                  aria-label="Supprimer"
                >
                  ✕
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
