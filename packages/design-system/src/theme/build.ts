import { accentScales, type ColorScale } from '../tokens/colors';
import { presets } from './presets';
import type { Mode, ResolvedTheme, SemanticTokens, ThemeConfig } from './types';

/** Construit les rôles sémantiques depuis une échelle d'accent + un mode. */
export function buildSemantic(accent: ColorScale, mode: Mode): SemanticTokens {
  const d = mode === 'dark';
  return {
    background: d ? '#09090b' : '#fafafa',
    surface: d ? '#18181b' : '#ffffff',
    surfaceRaised: d ? '#1f1f23' : '#ffffff',
    text: d ? '#f4f4f5' : '#18181b',
    textMuted: d ? '#a1a1aa' : '#71717a',
    border: d ? '#27272a' : '#e4e4e7',
    borderStrong: d ? '#3f3f46' : '#d4d4d8',
    accent: accent[d ? 500 : 600],
    accentHover: accent[d ? 400 : 700],
    accentMuted: accent[d ? 300 : 700],
    accentSoft: accent[d ? 950 : 100],
    accentContrast: '#ffffff',
    success: d ? '#22c55e' : '#16a34a',
    successSoft: d ? '#052e16' : '#dcfce7',
    warning: d ? '#f59e0b' : '#d97706',
    warningSoft: d ? '#451a03' : '#fef3c7',
    danger: d ? '#ef4444' : '#dc2626',
    dangerSoft: d ? '#450a0a' : '#fee2e2',
    info: d ? '#3b82f6' : '#2563eb',
    infoSoft: d ? '#172554' : '#dbeafe',
  };
}

/** Mapping rôle sémantique → nom de variable CSS. */
const VAR_MAP: Record<keyof SemanticTokens, string> = {
  background: '--ds-background',
  surface: '--ds-surface',
  surfaceRaised: '--ds-surface-raised',
  text: '--ds-text',
  textMuted: '--ds-text-muted',
  border: '--ds-border',
  borderStrong: '--ds-border-strong',
  accent: '--ds-accent',
  accentHover: '--ds-accent-hover',
  accentMuted: '--ds-accent-muted',
  accentSoft: '--ds-accent-soft',
  accentContrast: '--ds-accent-contrast',
  success: '--ds-success',
  successSoft: '--ds-success-soft',
  warning: '--ds-warning',
  warningSoft: '--ds-warning-soft',
  danger: '--ds-danger',
  dangerSoft: '--ds-danger-soft',
  info: '--ds-info',
  infoSoft: '--ds-info-soft',
};

/** '#aabbcc' → '170 187 204' (format attendu par rgb(var(--x) / alpha)). */
export function hexToRgb(hex: string): string {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `${r} ${g} ${b}`;
}

export function toCssVars(tokens: SemanticTokens): Record<string, string> {
  const out: Record<string, string> = {};
  (Object.keys(VAR_MAP) as Array<keyof SemanticTokens>).forEach((key) => {
    out[VAR_MAP[key]] = hexToRgb(tokens[key]);
  });
  return out;
}

/**
 * Résout un thème depuis un nom de préset ('dark', 'ocean', ...) ou une
 * configuration custom (mode + accent + surcharges).
 */
export function resolveTheme(input: string | ThemeConfig): ResolvedTheme {
  if (typeof input === 'string') {
    const preset = presets[input];
    if (!preset) {
      throw new Error(
        `Thème inconnu « ${input} ». Disponibles : ${Object.keys(presets).join(', ')}.`,
      );
    }
    return resolveTheme(preset);
  }

  const { name, mode, accent, overrides } = input;
  const scale = accentScales[accent];
  if (!scale) {
    throw new Error(`Accent inconnu « ${accent} ». Disponibles : ${Object.keys(accentScales).join(', ')}.`);
  }

  const tokens: SemanticTokens = { ...buildSemantic(scale, mode), ...overrides };
  return { name, mode, tokens, cssVars: toCssVars(tokens) };
}

/** Thèmes prêts à l'emploi (pratique pour React Native, sans provider). */
export const dark = resolveTheme('dark');
export const light = resolveTheme('light');
