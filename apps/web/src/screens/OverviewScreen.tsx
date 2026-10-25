import { useState } from 'react';
import { Card, cx } from '@dev-team/design-system';
import type { Dashboard } from '../types';
import { formatMoney, monthShortLabel } from '../lib/money';
import { seriesColor } from '../lib/chartColors';
import DonutChart from '../components/charts/DonutChart';
import BarChart from '../components/charts/BarChart';
import CategoryBars from '../components/charts/CategoryBars';
import CategoryIcon from '../components/CategoryIcon';

interface OverviewScreenProps {
  dashboard: Dashboard | null;
  loading: boolean;
  currency: string;
}

function KpiCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'danger' | 'success';
}) {
  return (
    <Card padding="sm" className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-text-muted">{label}</span>
      <span
        className={cx(
          'text-lg font-semibold tabular-nums',
          tone === 'danger' && 'text-danger',
          tone === 'success' && 'text-success',
        )}
      >
        {value}
      </span>
      {hint && <span className="text-xs text-text-muted">{hint}</span>}
    </Card>
  );
}

export default function OverviewScreen({ dashboard, loading, currency }: OverviewScreenProps) {
  const [chartMode, setChartMode] = useState<'global' | 'details'>('global');

  if (loading || !dashboard) {
    return <p className="py-6 text-sm text-text-muted">Chargement des données…</p>;
  }

  const {
    totalSpentCents,
    budgetTotalCents,
    remainingCents,
    forecastTotalCents,
    byCategory,
    months,
    monthsDetails,
    expenseCount,
  } = dashboard;

  // Couleur stable par catégorie — partagée par le donut, la légende et les barres empilées.
  const colorByName = new Map(
    byCategory.map((category, index) => [category.name, seriesColor(index)]),
  );

  const spendByCategory = byCategory.filter((c) => c.spentCents > 0);
  // Tri unique partagé par le donut ET la légende : les couleurs restent cohérentes.
  const sortedSpend = spendByCategory
    .slice()
    .sort((a, b) => b.spentCents - a.spentCents);
  const slices = sortedSpend.map((c) => ({
    label: c.name,
    value: c.spentCents,
    color: colorByName.get(c.name),
  }));

  // Vue « Globale » : 3 derniers mois — vue « Détails » : totaux par catégorie sur 6 mois.
  const globalMonths = months.slice(-3);

  const categoryTotals = new Map<string, { name: string; icon: string; value: number }>();
  for (const detail of monthsDetails) {
    for (const category of detail.categories) {
      const previous = categoryTotals.get(category.name);
      categoryTotals.set(category.name, {
        name: category.name,
        icon: category.icon,
        value: (previous?.value ?? 0) + category.spentCents,
      });
    }
  }
  const categoryDetail = [...categoryTotals.values()]
    .sort((a, b) => b.value - a.value)
    .map((item) => ({
      ...item,
      color: colorByName.get(item.name) ?? seriesColor(0),
    }));
  const overBudget = remainingCents !== null && remainingCents < 0;
  const budgetUsedPct =
    budgetTotalCents && budgetTotalCents > 0
      ? Math.min(999, Math.round((totalSpentCents / budgetTotalCents) * 100))
      : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Dépensé"
          value={formatMoney(totalSpentCents, currency)}
          hint={`${expenseCount} dépense${expenseCount > 1 ? 's' : ''}`}
        />
        <KpiCard
          label="Budget du mois"
          value={budgetTotalCents === null ? '—' : formatMoney(budgetTotalCents, currency)}
          hint={budgetUsedPct === null ? 'Non défini' : `${budgetUsedPct} % utilisé`}
        />
        <KpiCard
          label={overBudget ? 'Dépassement' : 'Reste'}
          value={remainingCents === null ? '—' : formatMoney(Math.abs(remainingCents), currency)}
          hint={remainingCents === null ? 'Définissez un budget' : overBudget ? 'Attention' : 'Disponible'}
          tone={remainingCents === null ? 'default' : overBudget ? 'danger' : 'success'}
        />
        <KpiCard
          label="Prévisions"
          value={formatMoney(forecastTotalCents, currency)}
          hint="Saisie manuelle"
        />
      </div>

      {overBudget && (
        <div className="rounded-lg border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger">
          Budget dépassé de {formatMoney(Math.abs(remainingCents ?? 0), currency)} ce mois-ci.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card padding="md" className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold">Répartition par catégorie</h2>
          {slices.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">
              Aucune dépense ce mois. Ajoutez-en une depuis l'onglet Dépenses.
            </p>
          ) : (
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="h-44 w-44 shrink-0">
                <DonutChart
                  data={slices}
                  centerValue={formatMoney(totalSpentCents, currency)}
                  centerLabel="total"
                />
              </div>
              <ul className="flex w-full flex-col gap-2">
                {sortedSpend.map((category, index) => {
                    const percent = totalSpentCents > 0
                      ? Math.round((category.spentCents / totalSpentCents) * 100)
                      : 0;
                    return (
                      <li key={category.categoryId ?? `none-${index}`} className="flex items-center gap-2 text-sm">
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-raised"
                          style={{ color: colorByName.get(category.name) ?? seriesColor(index) }}
                        >
                          <CategoryIcon icon={category.icon} className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1 truncate">{category.name}</span>
                        <span className="text-xs text-text-muted">{percent} %</span>
                        <span className="tabular-nums">{formatMoney(category.spentCents, currency)}</span>
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
        </Card>

        <Card padding="md" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">
              {chartMode === 'global'
                ? 'Dépenses des 3 derniers mois'
                : 'Dépenses par catégorie (6 mois)'}
            </h2>
            <div
              className="flex items-center gap-1 rounded-md border border-border p-0.5"
              role="group"
              aria-label="Mode d'affichage des dépenses"
            >
              <button
                type="button"
                onClick={() => setChartMode('global')}
                aria-pressed={chartMode === 'global'}
                className={cx(
                  'rounded px-2.5 py-1 text-xs font-medium transition-colors',
                  chartMode === 'global'
                    ? 'bg-accent text-accent-contrast'
                    : 'text-text-muted hover:text-text',
                )}
              >
                Globale
              </button>
              <button
                type="button"
                onClick={() => setChartMode('details')}
                aria-pressed={chartMode === 'details'}
                className={cx(
                  'rounded px-2.5 py-1 text-xs font-medium transition-colors',
                  chartMode === 'details'
                    ? 'bg-accent text-accent-contrast'
                    : 'text-text-muted hover:text-text',
                )}
              >
                Détails
              </button>
            </div>
          </div>

          {chartMode === 'global' ? (
            <BarChart
              data={globalMonths.map((m) => ({
                label: monthShortLabel(m.month),
                value: m.spentCents,
                highlight: m.month === dashboard.month,
              }))}
              formatValue={(value) => formatMoney(value, currency)}
            />
          ) : categoryDetail.length === 0 ? (
            <p className="text-xs text-text-muted">
              Aucune dépense sur les 6 derniers mois.
            </p>
          ) : (
            <CategoryBars
              items={categoryDetail}
              formatValue={(value) => formatMoney(value, currency)}
            />
          )}
        </Card>
      </div>

      <Card padding="md" className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Budget par catégorie</h2>
        {byCategory.filter((c) => c.budgetCents !== null).length === 0 ? (
          <p className="text-sm text-text-muted">
            Aucun budget par catégorie défini pour ce mois.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {byCategory
              .filter((c) => c.budgetCents !== null)
              .map((category) => {
                const budget = category.budgetCents ?? 0;
                const ratio = budget > 0 ? (category.spentCents / budget) * 100 : 0;
                const over = category.spentCents > budget;
                return (
                  <li key={category.categoryId ?? 'global'} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-raised"
                        style={{ color: colorByName.get(category.name) ?? seriesColor(0) }}
                      >
                        <CategoryIcon icon={category.icon} className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex-1 truncate">{category.name}</span>
                      <span className={cx('tabular-nums', over && 'text-danger')}>
                        {formatMoney(category.spentCents, currency)} / {formatMoney(budget, currency)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-raised">
                      <div
                        className={cx('h-full rounded-full', over ? 'bg-danger' : 'bg-accent')}
                        style={{ width: `${Math.min(100, ratio)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
          </ul>
        )}
      </Card>
    </div>
  );
}
