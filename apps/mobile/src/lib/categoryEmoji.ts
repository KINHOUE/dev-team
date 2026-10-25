/** Correspondance clé d'icône (stockée en base) → emoji (rendu mobile, sans SVG). */
export const CATEGORY_EMOJI: Record<string, string> = {
  food: '🍽️',
  transport: '🚗',
  home: '🏠',
  health: '💊',
  fun: '🎬',
  bill: '🧾',
  shopping: '🛍️',
  tag: '🏷️',
};

export const ICON_KEYS = Object.keys(CATEGORY_EMOJI);

export function categoryEmoji(icon: string): string {
  return CATEGORY_EMOJI[icon] ?? '🏷️';
}
