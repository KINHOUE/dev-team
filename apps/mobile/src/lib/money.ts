const ZERO_DECIMAL = new Set(['XOF', 'XAF', 'JPY', 'KRW', 'VND', 'CLP']);

const SYMBOLS: Record<string, string> = {
  XOF: 'FCFA',
  XAF: 'FCFA',
  EUR: '€',
  USD: '$',
  GBP: '£',
  NGN: '₦',
  GHS: 'GH₵',
  MAD: 'DH',
  CAD: 'CA$',
  CHF: 'CHF',
};

export const CURRENCY_OPTIONS = [
  { code: 'XOF', label: 'FCFA — XOF' },
  { code: 'XAF', label: 'FCFA — XAF' },
  { code: 'EUR', label: 'Euro — EUR' },
  { code: 'USD', label: 'Dollar US — USD' },
  { code: 'GBP', label: 'Livre — GBP' },
  { code: 'NGN', label: 'Naira — NGN' },
  { code: 'GHS', label: 'Cedi — GHS' },
  { code: 'MAD', label: 'Dirham — MAD' },
  { code: 'CAD', label: 'Dollar CA — CAD' },
  { code: 'CHF', label: 'Franc CH — CHF' },
] as const;

export function formatMoney(cents: number, currency = 'XOF'): string {
  const zero = ZERO_DECIMAL.has(currency);
  const value = zero ? Math.round(cents / 100) : cents / 100;
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: zero ? 0 : 2,
    maximumFractionDigits: zero ? 0 : 2,
  }).format(value);
  return `${formatted} ${SYMBOLS[currency] ?? currency}`;
}

export function parseAmountToCents(input: string): number {
  const cleaned = input.replace(/[^\d,.\-]/g, '').replace(',', '.');
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value * 100);
}

export function centsToInput(cents: number): string {
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}

export function currentMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function todayInputValue(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

export function monthLabel(month: string): string {
  const [year, m] = month.split('-').map(Number);
  if (!year || !m) return month;
  return new Date(year, m - 1, 1).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });
}

export function monthShortLabel(month: string): string {
  const [year, m] = month.split('-').map(Number);
  if (!year || !m) return month;
  return new Date(year, m - 1, 1).toLocaleDateString('fr-FR', { month: 'short' });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}
