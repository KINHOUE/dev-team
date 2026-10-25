# @dev-team/design-system

Design system partagé de l'équipe dev — **source unique de vérité** pour le style des applications web et mobiles, **multi-thème et adaptable par projet**.

## Principe

Les composants ne contiennent **aucune couleur en dur** : ils consomment des **rôles sémantiques** (`background`, `surface`, `text`, `accent`, `success`…). Chaque thème mappe ces rôles vers des valeurs concrètes. Changer de thème (accent, mode clair/sombre) réadapte tout, sans toucher au code des composants.

```
tokens/          → palettes (échelles d'accent + neutres) — matière première
theme/           → rôles sémantiques + résolution de thème (buildSemantic, resolveTheme)
ThemeProvider    → injecte les variables CSS (--ds-*) au runtime
components/      → composants React neutres vis-à-vis du thème
tailwind.config  → expose les rôles sémantiques comme utilitaires
```

## Thèmes disponibles

| Préset | Mode | Accent |
|---|---|---|
| `dark` | sombre | indigo |
| `light` | clair | indigo |
| `ocean` | sombre | cyan |
| `forest` | sombre | emerald |
| `sunset` | sombre | amber |
| `rose` | sombre | rose |
| `violet` | sombre | violet |

## Utilisation — Web (apps/web)

```tsx
import { ThemeProvider, Button, useTheme } from '@dev-team/design-system';

function App() {
  return (
    <ThemeProvider theme="dark">
      <Page />
    </ThemeProvider>
  );
}

function Page() {
  const { setTheme } = useTheme();
  return (
    <>
      <Button onClick={() => setTheme('ocean')}>Passer en Ocean</Button>
    </>
  );
}
```

Importer `src/styles.css` au point d'entrée, et réutiliser la config Tailwind du package dans `apps/web/tailwind.config.ts`.

## Utilisation — Mobile (React Native)

```ts
import { resolveTheme } from '@dev-team/design-system';
const t = resolveTheme('ocean').tokens; // objet de couleurs hex
// ou les thèmes prêts à l'emploi :
import { dark, light } from '@dev-team/design-system';
```

## Thème custom par projet

```ts
import { resolveTheme } from '@dev-team/design-system';

const monTheme = resolveTheme({
  name: 'mon-projet',
  mode: 'dark',
  accent: 'cyan',
  overrides: { background: '#050510', surface: '#0d0d1a' },
});
```

Accents disponibles : `indigo`, `violet`, `blue`, `cyan`, `emerald`, `amber`, `rose`.

## Conventions

- **Jamais de couleur en dur** dans une app ou un composant : toujours un rôle sémantique.
- Nouvelle valeur de style → `tokens/` d'abord, jamais directement dans un composant.
- Les échelles (`accentScales`) sont la matière première des thèmes, pas un raccourci à utiliser dans les composants.
- Garder `src/styles.css` (fallback) synchronisé avec `theme/build.ts`.

## Vérifier

```bash
npm install
npm run typecheck
```
