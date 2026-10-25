import type { Config } from 'tailwindcss';
import {
  spacing,
  fontSize,
  fontWeight,
  fontFamily,
  radius,
  shadows,
} from './src/tokens';

/**
 * Config Tailwind du design system — consommée par apps/web.
 * Les couleurs exposées sont les RÔLES SÉMANTIQUES (variables CSS --ds-*),
 * jamais les échelles d'accent : un composant reste neutre vis-à-vis du thème,
 * et changer de thème (accent, mode clair/sombre) ne casse aucun composant.
 */
const cssVar = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
    '../../apps/web/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: cssVar('--ds-background'),
        surface: cssVar('--ds-surface'),
        'surface-raised': cssVar('--ds-surface-raised'),
        text: cssVar('--ds-text'),
        'text-muted': cssVar('--ds-text-muted'),
        border: cssVar('--ds-border'),
        'border-strong': cssVar('--ds-border-strong'),
        accent: cssVar('--ds-accent'),
        'accent-hover': cssVar('--ds-accent-hover'),
        'accent-muted': cssVar('--ds-accent-muted'),
        'accent-soft': cssVar('--ds-accent-soft'),
        'accent-contrast': cssVar('--ds-accent-contrast'),
        success: cssVar('--ds-success'),
        'success-soft': cssVar('--ds-success-soft'),
        warning: cssVar('--ds-warning'),
        'warning-soft': cssVar('--ds-warning-soft'),
        danger: cssVar('--ds-danger'),
        'danger-soft': cssVar('--ds-danger-soft'),
        info: cssVar('--ds-info'),
        'info-soft': cssVar('--ds-info-soft'),
      },
      spacing,
      fontSize: Object.fromEntries(
        Object.entries(fontSize).map(([k, v]) => [k, [v.size, v.lineHeight]]),
      ),
      fontWeight: Object.fromEntries(
        Object.entries(fontWeight).map(([k, v]) => [k, String(v)]),
      ),
      fontFamily: {
        sans: fontFamily.sans.join(', '),
        mono: fontFamily.mono.join(', '),
      },
      borderRadius: radius,
      boxShadow: shadows,
    },
  },
  plugins: [],
};

export default config;
