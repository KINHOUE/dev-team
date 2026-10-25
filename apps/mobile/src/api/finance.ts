import { request } from './client';
import type { Budget, Category, Dashboard, Expense, Forecast, User } from '../types';

export interface ExpenseInput {
  amountCents: number;
  date: string;
  categoryId?: string | null;
  note?: string | null;
  source?: 'manual' | 'voice';
}

export function listCategories(token: string): Promise<Category[]> {
  return request<Category[]>('/categories', { token });
}

export function createCategory(
  token: string,
  input: { name: string; icon: string },
): Promise<Category> {
  return request<Category>('/categories', { method: 'POST', token, body: input });
}

export function updateCategory(
  token: string,
  id: string,
  input: { name?: string; icon?: string },
): Promise<Category> {
  return request<Category>(`/categories/${id}`, { method: 'PUT', token, body: input });
}

export function deleteCategory(token: string, id: string): Promise<void> {
  return request<void>(`/categories/${id}`, { method: 'DELETE', token });
}

export function listExpenses(token: string, month: string): Promise<Expense[]> {
  return request<Expense[]>(`/expenses?month=${encodeURIComponent(month)}`, { token });
}

export function createExpense(token: string, input: ExpenseInput): Promise<Expense> {
  return request<Expense>('/expenses', { method: 'POST', token, body: input });
}

export function deleteExpense(token: string, id: string): Promise<void> {
  return request<void>(`/expenses/${id}`, { method: 'DELETE', token });
}

export interface BudgetsResponse {
  month: string;
  global: Budget | null;
  categories: Budget[];
}

export function getBudgets(token: string, month: string): Promise<BudgetsResponse> {
  return request<BudgetsResponse>(`/budgets?month=${encodeURIComponent(month)}`, { token });
}

export function upsertBudget(
  token: string,
  input: { month: string; categoryId?: string | null; amountCents: number },
): Promise<Budget> {
  return request<Budget>('/budgets', { method: 'PUT', token, body: input });
}

export function deleteBudget(token: string, id: string): Promise<void> {
  return request<void>(`/budgets/${id}`, { method: 'DELETE', token });
}

export interface ForecastsResponse {
  month: string;
  forecasts: Forecast[];
}

export function listForecasts(token: string, month: string): Promise<ForecastsResponse> {
  return request<ForecastsResponse>(`/forecasts?month=${encodeURIComponent(month)}`, { token });
}

export function createForecast(
  token: string,
  input: { month: string; categoryId?: string | null; amountCents: number; note?: string | null },
): Promise<Forecast> {
  return request<Forecast>('/forecasts', { method: 'POST', token, body: input });
}

export function deleteForecast(token: string, id: string): Promise<void> {
  return request<void>(`/forecasts/${id}`, { method: 'DELETE', token });
}

export function getDashboard(token: string, month: string): Promise<Dashboard> {
  return request<Dashboard>(`/stats/dashboard?month=${encodeURIComponent(month)}`, { token });
}

export function updateCurrency(token: string, currency: string): Promise<{ user: User }> {
  return request<{ user: User }>('/auth/me', {
    method: 'PATCH',
    token,
    body: { currency },
  });
}
