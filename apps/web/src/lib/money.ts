/** Devises sans décimales (les centimes sont arrondis à l'unité). */
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

export function currencySymbol(currency: string): string {
  return SYMBOLS[currency] ?? currency;
}

/** Formate un montant stocké en centimes. */
export function formatMoney(cents: number, currency = 'XOF'): string {
  const zero = ZERO_DECIMAL.has(currency);
  const value = zero ? Math.round(cents / 100) : cents / 100;
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: zero ? 0 : 2,
    maximumFractionDigits: zero ? 0 : 2,
  }).format(value);
  return `${formatted} ${currencySymbol(currency)}`;
}

/** Version courte pour les axes de graphiques (ex. 12,5 k). */
export function formatCompact(cents: number, currency = 'XOF'): string {
  const zero = ZERO_DECIMAL.has(currency);
  const value = zero ? Math.round(cents / 100) : cents / 100;
  const symbol = currencySymbol(currency);
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} M ${symbol}`;
  }
  if (Math.abs(value) >= 10_000) {
    return `${(value / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} k ${symbol}`;
  }
  return formatMoney(cents, currency);
}

/** Convertit une saisie utilisateur (« 5 000 », « 12,5 ») en centimes. */
export function parseAmountToCents(input: string): number {
  const cleaned = input.replace(/[^\d,.\-]/g, '').replace(',', '.');
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value * 100);
}

/** Valeur à pré-remplir dans un champ de saisie. */
export function centsToInput(cents: number): string {
  if (!Number.isFinite(cents)) return '';
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}

/** Clé « AAAA-MM » du mois courant (heure locale). */
export function currentMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Libellé lisible d'un mois « 2026-10 » → « octobre 2026 ». */
export function monthLabel(month: string): string {
  const [year, m] = month.split('-').map(Number);
  if (!year || !m) return month;
  return new Date(year, m - 1, 1).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });
}

/** Libellé court d'un mois pour les graphiques → « oct. » */
export function monthShortLabel(month: string): string {
  const [year, m] = month.split('-').map(Number);
  if (!year || !m) return month;
  return new Date(year, m - 1, 1).toLocaleDateString('fr-FR', { month: 'short' });
}

/** Date locale au format AAAA-MM-JJ (valeur d'un input date). */
export function todayInputValue(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Date lisible : « 25 oct. 2026 ». */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
