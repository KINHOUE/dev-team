# Todo App — Web

Frontend web de la Todo App (projet de test de pipeline multi-agents).

## Stack

- Vite + React + TypeScript + Tailwind CSS
- `@dev-team/design-system` (tokens, thèmes, composants `Button`/`Input`/`Card`/`Badge`, `ThemeProvider`)

## Prérequis

- Node.js ≥ 18
- L'API backend (`apps/api`) démarrée sur `http://localhost:3000`

## Installation

```bash
cd apps/web
npm install
cp .env.example .env   # ajuster VITE_API_URL si besoin
```

## Scripts

| Commande            | Effet                                    |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Serveur de dev Vite (http://localhost:5173) |
| `npm run build`     | Typecheck + build de production (`dist/`)  |
| `npm run preview`   | Sert le build (`dist/`)                  |
| `npm run typecheck` | TypeScript strict, sans émission         |

## Architecture

```
src/
├── main.tsx            # point d'entrée (importe styles.css du design system + index.css)
├── App.tsx             # ThemeProvider (thème persisté) + AuthProvider + routage auth/todo
├── types.ts            # User, Task, Filter
├── lib/
│   ├── api.ts          # client fetch de l'API (Bearer token, erreurs typées)
│   └── storage.ts      # persistance locale (token, user, thème)
├── context/
│   └── AuthContext.tsx # état d'authentification (login/register/logout)
├── hooks/
│   └── useTasks.ts     # chargement + mutations des tâches
└── components/
    ├── Header.tsx      # titre + email + sélecteur de thème + déconnexion
    ├── ThemeSwitcher.tsx
    ├── AuthScreen.tsx  # inscription / connexion
    ├── TodoScreen.tsx  # liste + filtres + formulaire
    ├── TaskForm.tsx    # création de tâche
    ├── FilterTabs.tsx  # filtre toutes / à faire / faites
    ├── TaskList.tsx
    └── TaskItem.tsx    # toggle, édition inline, suppression
```

## Thème

Le thème est persité dans `localStorage` (`todo.theme`) et appliqué via
`ThemeProvider` + `useTheme`. Aucune couleur/espacement en dur : uniquement les
rôles sémantiques du design system (`background`, `surface`, `text`, `accent`,
`success`, `danger`…).

## Authentification

Le JWT renvoyé par l'API est conservé en `localStorage` et transmis via l'en-tête
`Authorization: Bearer <token>`. Le cookie httpOnly posé par l'API n'est pas
exploité par ce client (alternative possible si un endpoint de session est ajouté).
