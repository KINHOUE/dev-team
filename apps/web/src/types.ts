export interface User {
  id: string;
  email: string;
  currency: string;
}

export interface Task {
  id: string;
  title: string;
  done: boolean;
  dueAt: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type Filter = 'all' | 'todo' | 'done';

export type AppModule = 'tasks' | 'finance';

export type FinanceTab =
  | 'overview'
  | 'expenses'
  | 'budget'
  | 'forecasts'
  | 'categories'
  | 'settings';

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string | null;
  createdAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  categoryId: string | null;
  category: Category | null;
  amountCents: number;
  date: string;
  note: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  month: string;
  categoryId: string | null;
  category: Category | null;
  amountCents: number;
}

export interface Forecast {
  id: string;
  userId: string;
  month: string;
  categoryId: string | null;
  category: Category | null;
  amountCents: number;
  note: string | null;
}

export interface CategoryStat {
  categoryId: string | null;
  name: string;
  icon: string;
  color: string | null;
  spentCents: number;
  budgetCents: number | null;
  forecastCents: number | null;
}

export interface MonthStat {
  month: string;
  spentCents: number;
}

export interface MonthCategoryStat {
  categoryId: string | null;
  name: string;
  icon: string;
  color: string | null;
  spentCents: number;
}

export interface MonthDetail {
  month: string;
  totalCents: number;
  categories: MonthCategoryStat[];
}

export interface Dashboard {
  month: string;
  currency: string;
  expenseCount: number;
  totalSpentCents: number;
  budgetTotalCents: number | null;
  remainingCents: number | null;
  forecastTotalCents: number;
  byCategory: CategoryStat[];
  months: MonthStat[];
  monthsDetails: MonthDetail[];
}
