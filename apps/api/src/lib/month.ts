/**
 * Utilitaires de mois et de bornes de dates (UTC).
 * Les dépenses sont stockées en DateTime ; les agrégats mensuels sont bornés en UTC.
 */

export const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function currentMonth(now: Date = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function monthBounds(month: string): { start: Date; end: Date } {
  const [yearStr, monthStr] = month.split('-');
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  return {
    start: new Date(Date.UTC(year, monthIndex, 1)),
    end: new Date(Date.UTC(year, monthIndex + 1, 1)),
  };
}

/** Renvoie les `count` derniers mois (inclus le mois courant), du plus ancien au plus récent. */
export function lastMonths(count: number, now: Date = new Date()): string[] {
  const result: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    result.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
  }
  return result;
}

/** Normalise une date reçue (YYYY-MM-DD ou ISO) en Date UTC. */
export function parseExpenseDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00.000Z`);
  }
  return new Date(value);
}
