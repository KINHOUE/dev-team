import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { resolveTheme, spacing, radius, fontSize, fontWeight } from '@dev-team/design-system';
import type { SemanticTokens } from '@dev-team/design-system';

/**
 * Thèmes disponibles (pré sets du design system). Le thème par défaut est
 * `dark`, conformément à la spec produit.
 */
export const THEME_NAMES = ['dark', 'light', 'ocean', 'forest', 'sunset', 'rose', 'violet'] as const;
export type ThemeName = (typeof THEME_NAMES)[number];

/** Convertit une valeur « 16px » du design system en nombre React Native. */
function toNumber(value: string): number {
  return Number(value.replace('px', ''));
}

// Métriques dérivées des tokens du design system — aucune valeur en dur.
// (le design system expose espacements / rayons / tailles en « px », React
// Native attend des nombres : on convertit uniquement l'unité, pas la valeur.)
const space = {
  xs: toNumber(spacing[1]),
  sm: toNumber(spacing[2]),
  md: toNumber(spacing[4]),
  lg: toNumber(spacing[6]),
  xl: toNumber(spacing[8]),
  xxl: toNumber(spacing[12]),
} as const;

const radii = {
  sm: toNumber(radius.sm),
  md: toNumber(radius.md),
  lg: toNumber(radius.lg),
  xl: toNumber(radius.xl),
  full: toNumber(radius.full),
} as const;

const fontSizes = {
  sm: toNumber(fontSize.sm.size),
  base: toNumber(fontSize.base.size),
  lg: toNumber(fontSize.lg.size),
  xl: toNumber(fontSize.xl.size),
  xxl: toNumber(fontSize['2xl'].size),
} as const;

export interface AppTheme {
  name: ThemeName;
  mode: 'dark' | 'light';
  /** Rôles sémantiques (couleurs) du design system. */
  colors: SemanticTokens;
  space: typeof space;
  radii: typeof radii;
  fontSizes: typeof fontSizes;
  fontWeights: typeof fontWeight;
}

function buildTheme(name: ThemeName): AppTheme {
  const resolved = resolveTheme(name);
  return {
    name,
    mode: resolved.mode,
    colors: resolved.tokens,
    space,
    radii,
    fontSizes,
    fontWeights: fontWeight,
  };
}

interface ThemeContextValue {
  theme: AppTheme;
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('dark');

  const value = useMemo<ThemeContextValue>(
    () => ({ theme: buildTheme(themeName), themeName, setThemeName }),
    [themeName],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme() doit être appelé dans un <ThemeProvider>.');
  }
  return ctx;
}
