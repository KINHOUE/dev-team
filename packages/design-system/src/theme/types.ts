import type { AccentName } from '../tokens/colors';

export type Mode = 'dark' | 'light';

/**
 * Rôles sémantiques — le SEUL contrat consommé par les composants.
 * Chaque thème mappe ces rôles vers des valeurs concrètes (adaptées au mode).
 */
export interface SemanticTokens {
  background: string;
  surface: string;
  surfaceRaised: string;
  text: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  /** Accent plein (fonds de boutons, éléments actifs). */
  accent: string;
  /** Accent au survol. */
  accentHover: string;
  /** Accent adapté au texte (plus clair en sombre, plus foncé en clair). */
  accentMuted: string;
  /** Fond doux teinté accent (badges, sélection). */
  accentSoft: string;
  /** Texte lisible sur `accent`. */
  accentContrast: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
}

/** Configuration déclarative d'un thème (préset ou custom par projet). */
export interface ThemeConfig {
  name: string;
  mode: Mode;
  accent: AccentName;
  /** Surcharges libres : personnaliser n'importe quel rôle pour un projet précis. */
  overrides?: Partial<SemanticTokens>;
}

/** Thème résolu : valeurs concrètes + variables CSS prêtes à injecter. */
export interface ResolvedTheme {
  name: string;
  mode: Mode;
  tokens: SemanticTokens;
  cssVars: Record<string, string>;
}
