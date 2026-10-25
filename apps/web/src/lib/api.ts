import type {
  Budget,
  Category,
  Dashboard,
  Expense,
  Forecast,
  Task,
  User,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

interface ApiErrorBody {
  error?: { message?: string; details?: unknown };
}

export interface AuthResponse {
  user: User;
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    // Le JWT est dans un cookie httpOnly ; on l'envoie automatiquement.
    credentials: 'include',
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = (await res.json().catch(() => null)) as (T & ApiErrorBody) | null;

  if (!res.ok) {
    const details = data?.error?.details;
    let message = data?.error?.message ?? `Erreur ${res.status}`;
    // Affiche la raison précise (ex. "Le mot de passe doit contenir au moins 8 caractères")
    // plutôt qu'un simple "Données invalides" quand des détails de champ existent.
    if (details && typeof details === 'object') {
      const parts = Object.values(details as Record<string, unknown>)
        .flat()
        .filter((v): v is string => typeof v === 'string' && v.length > 0);
      if (parts.length > 0) {
        message = parts.join(' · ');
      }
    }
    throw new ApiError(res.status, message, details);
  }

  return data as T;
}

export function register(email: string, password: string): Promise<void> {
  return request<void>('/auth/register', {
    method: 'POST',
    body: { email, password },
  });
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function me(): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/me');
}

export function logout(): Promise<void> {
  return request<void>('/auth/logout', { method: 'POST' });
}

export function listTasks(): Promise<Task[]> {
  return request<Task[]>('/tasks');
}

export function createTask(title: string, dueAt?: string | null): Promise<Task> {
  return request<Task>('/tasks', {
    method: 'POST',
    body: { title, ...(dueAt ? { dueAt } : {}) },
  });
}

export function updateTask(
  id: string,
  title: string,
  dueAt?: string | null,
): Promise<Task> {
  const body: Record<string, unknown> = { title };
  if (dueAt !== undefined) {
    body.dueAt = dueAt;
  }
  return request<Task>(`/tasks/${id}`, { method: 'PUT', body });
}

export function deleteTask(id: string): Promise<void> {
  return request<void>(`/tasks/${id}`, { method: 'DELETE' });
}

export function toggleTask(id: string): Promise<Task> {
  return request<Task>(`/tasks/${id}/complete`, { method: 'PATCH' });
}

// ─────────────────────────── Module Finances ───────────────────────────

export interface ExpenseInput {
  amountCents: number;
  date: string;
  categoryId?: string | null;
  note?: string | null;
  source?: 'manual' | 'voice';
}

export interface CategoryInput {
  name: string;
  icon: string;
  color?: string | null;
}

export interface BudgetInput {
  month: string;
  categoryId?: string | null;
  amountCents: number;
}

export interface ForecastInput {
  month: string;
  categoryId?: string | null;
  amountCents: number;
  note?: string | null;
}

export function listCategories(): Promise<Category[]> {
  return request<Category[]>('/categories');
}

export function createCategory(input: CategoryInput): Promise<Category> {
  return request<Category>('/categories', { method: 'POST', body: input });
}

export function updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
  return request<Category>(`/categories/${id}`, { method: 'PUT', body: input });
}

export function deleteCategory(id: string): Promise<void> {
  return request<void>(`/categories/${id}`, { method: 'DELETE' });
}

export function listExpenses(params: { month?: string; categoryId?: string } = {}): Promise<
  Expense[]
> {
  const query = new URLSearchParams();
  if (params.month) query.set('month', params.month);
  if (params.categoryId) query.set('categoryId', params.categoryId);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<Expense[]>(`/expenses${suffix}`);
}

export function createExpense(input: ExpenseInput): Promise<Expense> {
  return request<Expense>('/expenses', { method: 'POST', body: input });
}

export function updateExpense(id: string, input: Partial<ExpenseInput>): Promise<Expense> {
  return request<Expense>(`/expenses/${id}`, { method: 'PUT', body: input });
}

export function deleteExpense(id: string): Promise<void> {
  return request<void>(`/expenses/${id}`, { method: 'DELETE' });
}

export interface BudgetsResponse {
  month: string;
  global: Budget | null;
  categories: Budget[];
}

export function getBudgets(month: string): Promise<BudgetsResponse> {
  return request<BudgetsResponse>(`/budgets?month=${encodeURIComponent(month)}`);
}

export function upsertBudget(input: BudgetInput): Promise<Budget> {
  return request<Budget>('/budgets', { method: 'PUT', body: input });
}

export function deleteBudget(id: string): Promise<void> {
  return request<void>(`/budgets/${id}`, { method: 'DELETE' });
}

export interface ForecastsResponse {
  month: string;
  forecasts: Forecast[];
}

export function listForecasts(month: string): Promise<ForecastsResponse> {
  return request<ForecastsResponse>(`/forecasts?month=${encodeURIComponent(month)}`);
}

export function createForecast(input: ForecastInput): Promise<Forecast> {
  return request<Forecast>('/forecasts', { method: 'POST', body: input });
}

export function updateForecast(
  id: string,
  input: { amountCents?: number; note?: string | null },
): Promise<Forecast> {
  return request<Forecast>(`/forecasts/${id}`, { method: 'PUT', body: input });
}

export function deleteForecast(id: string): Promise<void> {
  return request<void>(`/forecasts/${id}`, { method: 'DELETE' });
}

export function getDashboard(month: string): Promise<Dashboard> {
  return request<Dashboard>(`/stats/dashboard?month=${encodeURIComponent(month)}`);
}

export function updateCurrency(currency: string): Promise<{ user: User }> {
  return request<{ user: User }>('/auth/me', { method: 'PATCH', body: { currency } });
}
