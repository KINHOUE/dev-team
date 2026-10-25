import { presetNames } from '@dev-team/design-system';
import type { User } from '../types';

const USER_KEY = 'todo.user';
const THEME_KEY = 'todo.theme';

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem(USER_KEY);
}

export function getStoredTheme(): string {
  const stored = localStorage.getItem(THEME_KEY);
  return stored && presetNames.includes(stored) ? stored : 'dark';
}

export function setStoredTheme(theme: string): void {
  localStorage.setItem(THEME_KEY, theme);
}
