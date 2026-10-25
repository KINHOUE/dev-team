import type { Config } from 'tailwindcss';
import dsConfig from '@dev-team/design-system/tailwind';

// On réutilise la config Tailwind du design system (rôles sémantiques, spacing,
// typo, radius, ombres) et on complète `content` pour scanner à la fois le code
// de l'app et les composants du design system (Button, Card, Input, Badge…).
export default {
  ...dsConfig,
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../../packages/design-system/src/**/*.{ts,tsx}',
  ],
} satisfies Config;
