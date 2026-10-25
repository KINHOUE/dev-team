/** Types partagés — miroir des réponses de l'API (apps/api). */

export interface User {
  id: string;
  email: string;
  currency: string;
}

export interface Task {
  id: string;
  title: string;
  done: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface Dashboard {
  month: string;
  currency: string;
  expenseCount: number;
  totalSpentCents: number;
  budgetTotalCents: number | null;
  remainingCents: number | null;
  forecastTotalCents: number;
  byCategory: CategoryStat[];
  months: { month: string; spentCents: number }[];
  monthsDetails: {
    month: string;
    totalCents: number;
    categories: {
      categoryId: string | null;
      name: string;
      icon: string;
      color: string | null;
      spentCents: number;
    }[];
  }[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiErrorBody {
  error?: {
    message?: string;
    details?: unknown;
  };
}
