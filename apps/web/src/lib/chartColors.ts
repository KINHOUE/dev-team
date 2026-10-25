/**
 * Palette de séries pour les graphiques, dérivée des rôles sémantiques du thème
 * (variables CSS injectées par le ThemeProvider) — jamais de couleur figée.
 */
export const SERIES_COLORS = [
  'rgb(var(--ds-accent))',
  'rgb(var(--ds-info))',
  'rgb(var(--ds-success))',
  'rgb(var(--ds-warning))',
  'rgb(var(--ds-danger))',
  'rgb(var(--ds-accent-muted))',
  'rgb(var(--ds-border-strong))',
  'rgb(var(--ds-text-muted))',
];

export function seriesColor(index: number): string {
  return SERIES_COLORS[index % SERIES_COLORS.length];
}
