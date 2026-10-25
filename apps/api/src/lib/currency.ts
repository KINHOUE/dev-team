export const SUPPORTED_CURRENCIES = [
  'XOF',
  'XAF',
  'EUR',
  'USD',
  'GBP',
  'NGN',
  'GHS',
  'MAD',
  'CAD',
  'CHF',
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export function isSupportedCurrency(value: unknown): value is CurrencyCode {
  return (
    typeof value === 'string' &&
    (SUPPORTED_CURRENCIES as readonly string[]).includes(value.toUpperCase())
  );
}
