import { useCallback, useEffect, useState } from 'react';
import type { Budget, Category, Dashboard, Expense, Forecast } from '../types';
import * as api from '../lib/api';

export interface BudgetsState {
  global: Budget | null;
  categories: Budget[];
}

/** État complet du module Finances pour un mois donné. */
export function useFinance(month: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<BudgetsState>({ global: null, categories: [] });
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, exp, bud, fc, dash] = await Promise.all([
        api.listCategories(),
        api.listExpenses({ month }),
        api.getBudgets(month),
        api.listForecasts(month),
        api.getDashboard(month),
      ]);
      setCategories(cats);
      setExpenses(exp);
      setBudgets({ global: bud.global, categories: bud.categories });
      setForecasts(fc.forecasts);
      setDashboard(dash);
    } catch (err) {
      setError(err instanceof api.ApiError ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    void load();
  }, [load]);

  const addExpense = useCallback(
    async (input: api.ExpenseInput) => {
      await api.createExpense(input);
      await load();
    },
    [load],
  );

  const editExpense = useCallback(
    async (id: string, input: Partial<api.ExpenseInput>) => {
      await api.updateExpense(id, input);
      await load();
    },
    [load],
  );

  const removeExpense = useCallback(
    async (id: string) => {
      await api.deleteExpense(id);
      await load();
    },
    [load],
  );

  const addCategory = useCallback(
    async (input: api.CategoryInput) => {
      await api.createCategory(input);
      await load();
    },
    [load],
  );

  const editCategory = useCallback(
    async (id: string, input: Partial<api.CategoryInput>) => {
      await api.updateCategory(id, input);
      await load();
    },
    [load],
  );

  const removeCategory = useCallback(
    async (id: string) => {
      await api.deleteCategory(id);
      await load();
    },
    [load],
  );

  const saveBudget = useCallback(
    async (input: api.BudgetInput) => {
      await api.upsertBudget(input);
      await load();
    },
    [load],
  );

  const removeBudget = useCallback(
    async (id: string) => {
      await api.deleteBudget(id);
      await load();
    },
    [load],
  );

  const addForecast = useCallback(
    async (input: api.ForecastInput) => {
      await api.createForecast(input);
      await load();
    },
    [load],
  );

  const editForecast = useCallback(
    async (id: string, input: { amountCents?: number; note?: string | null }) => {
      await api.updateForecast(id, input);
      await load();
    },
    [load],
  );

  const removeForecast = useCallback(
    async (id: string) => {
      await api.deleteForecast(id);
      await load();
    },
    [load],
  );

  return {
    categories,
    expenses,
    budgets,
    forecasts,
    dashboard,
    loading,
    error,
    reload: load,
    addExpense,
    editExpense,
    removeExpense,
    addCategory,
    editCategory,
    removeCategory,
    saveBudget,
    removeBudget,
    addForecast,
    editForecast,
    removeForecast,
  };
}

export type FinanceApi = ReturnType<typeof useFinance>;
