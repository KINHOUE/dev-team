import { useState } from 'react';
import type { FinanceTab } from '../types';
import { useFinance } from '../hooks/useFinance';
import { currentMonthKey } from '../lib/money';
import AppNav from '../components/AppNav';
import MonthPicker from '../components/MonthPicker';
import OverviewScreen from './OverviewScreen';
import ExpensesScreen from './ExpensesScreen';
import BudgetScreen from './BudgetScreen';
import ForecastsScreen from './ForecastsScreen';
import CategoriesScreen from './CategoriesScreen';
import SettingsScreen from './SettingsScreen';

interface FinanceScreenProps {
  currency: string;
  onCurrencyChange: (currency: string) => Promise<void>;
}

const TABS: { id: FinanceTab; label: string }[] = [
  { id: 'overview', label: 'Dashboard' },
  { id: 'expenses', label: 'Dépenses' },
  { id: 'budget', label: 'Budget' },
  { id: 'forecasts', label: 'Prévisions' },
  { id: 'categories', label: 'Catégories' },
  { id: 'settings', label: 'Paramètres' },
];

export default function FinanceScreen({ currency, onCurrencyChange }: FinanceScreenProps) {
  const [tab, setTab] = useState<FinanceTab>('overview');
  const [month, setMonth] = useState(currentMonthKey());
  const finance = useFinance(month);

  const showMonthPicker = tab !== 'categories' && tab !== 'settings';

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AppNav items={TABS} active={tab} onChange={setTab} />
        {showMonthPicker && <MonthPicker month={month} onChange={setMonth} />}
      </div>

      {finance.error && (
        <p className="text-sm text-danger" role="alert">
          {finance.error}
        </p>
      )}

      {tab === 'overview' && (
        <OverviewScreen
          dashboard={finance.dashboard}
          loading={finance.loading}
          currency={currency}
        />
      )}

      {tab === 'expenses' && (
        <ExpensesScreen
          expenses={finance.expenses}
          categories={finance.categories}
          currency={currency}
          loading={finance.loading}
          onAdd={finance.addExpense}
          onEdit={finance.editExpense}
          onRemove={finance.removeExpense}
        />
      )}

      {tab === 'budget' && (
        <BudgetScreen
          globalBudget={finance.budgets.global}
          categoryBudgets={finance.budgets.categories}
          categories={finance.categories}
          currency={currency}
          month={month}
          onSave={finance.saveBudget}
          onRemove={finance.removeBudget}
        />
      )}

      {tab === 'forecasts' && (
        <ForecastsScreen
          forecasts={finance.forecasts}
          categories={finance.categories}
          currency={currency}
          month={month}
          onAdd={finance.addForecast}
          onEdit={finance.editForecast}
          onRemove={finance.removeForecast}
        />
      )}

      {tab === 'categories' && (
        <CategoriesScreen
          categories={finance.categories}
          onAdd={finance.addCategory}
          onEdit={finance.editCategory}
          onRemove={finance.removeCategory}
        />
      )}

      {tab === 'settings' && (
        <SettingsScreen currency={currency} onCurrencyChange={onCurrencyChange} />
      )}
    </div>
  );
}
