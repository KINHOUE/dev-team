import {
  createContext,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { resolveTheme } from './theme/build';
import type { ResolvedTheme, ThemeConfig } from './theme/types';

export type ThemeInput = string | ThemeConfig;

interface ThemeContextValue {
  theme: ResolvedTheme;
  setTheme: (t: ThemeInput) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  /** Nom de préset ('dark', 'ocean', ...) ou config custom. Défaut : 'dark'. */
  theme?: ThemeInput;
  children: ReactNode;
}

/**
 * Applique le thème en injectant les variables CSS (--ds-*) sur le sous-arbre.
 * Changer de thème au runtime (setTheme) met à jour tout l'arbre sans recompiler.
 */
export function ThemeProvider({ theme: initial = 'dark', children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ResolvedTheme>(() => resolveTheme(initial));

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: (t: ThemeInput) => setThemeState(resolveTheme(t)),
    }),
    [theme],
  );

  const style = useMemo(() => theme.cssVars as CSSProperties, [theme]);

  return (
    <ThemeContext.Provider value={value}>
      <div data-theme={theme.mode} style={style}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme() doit être appelé dans un <ThemeProvider>.');
  }
  return ctx;
}
