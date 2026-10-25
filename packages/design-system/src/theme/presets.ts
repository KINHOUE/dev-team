import type { ThemeConfig } from './types';

/**
 * Thèmes prédéfinis.
 * Un projet peut en choisir un directement, ou créer le sien :
 * resolveTheme({ name, mode: 'dark', accent: 'cyan', overrides: {...} }).
 */
export const presets: Record<string, ThemeConfig> = {
  dark: { name: 'dark', mode: 'dark', accent: 'indigo' },
  light: { name: 'light', mode: 'light', accent: 'indigo' },
  ocean: { name: 'ocean', mode: 'dark', accent: 'cyan' },
  forest: { name: 'forest', mode: 'dark', accent: 'emerald' },
  sunset: { name: 'sunset', mode: 'dark', accent: 'amber' },
  rose: { name: 'rose', mode: 'dark', accent: 'rose' },
  violet: { name: 'violet', mode: 'dark', accent: 'violet' },
};

export const presetNames = Object.keys(presets);
