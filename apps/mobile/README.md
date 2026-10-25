# @dev-team/mobile — Todo App (Expo)

Application mobile React Native + Expo + TypeScript de la Todo App. Elle consomme
l'API REST de `apps/api` et le design system `@dev-team/design-system`
(tokens + thèmes uniquement — aucune couleur/espacement/rayon/police en dur).

## Prérequis

- Node.js ≥ 20
- L'API `apps/api` démarrée (voir `apps/api/README.md`) sur `http://localhost:3000`

## Installation

```bash
cd apps/mobile
npm install
```

## Configuration de l'URL de l'API

Copier `.env.example` vers `.env` et adapter `EXPO_PUBLIC_API_URL` :

```bash
cp .env.example .env
```

- Simulateur iOS / web : `http://localhost:3000`
- Émulateur Android : `http://10.0.2.2:3000`
- Appareil physique (Expo Go) : `http://<IP-LAN-de-la-machine>:3000`

## Lancer

```bash
npm start          # serveur de dev Expo (Metro)
npm run android    # lancer sur émulateur Android
npm run ios        # lancer sur simulateur iOS (macOS uniquement)
npm run web        # lancer en web (react-native-web)
```

## Vérifications

```bash
npm run typecheck  # npx tsc --noEmit
```

## Écrans

| Route (expo-router) | Écran | Description |
|---|---|---|
| `/` (index) | Redirection | Redirige vers `/tasks` si connecté, sinon `/login`. |
| `/login` | Connexion | Email + mot de passe → `POST /auth/login`. |
| `/register` | Inscription | Email + mot de passe (+ confirmation) → `POST /auth/register`. |
| `/tasks` | Mes tâches | Liste + filtre (toutes / à faire / faites), création, édition, suppression, bascule « faite », sélecteur de thème, déconnexion. |

## Structure

```
src/
├── app/                 # routes expo-router (écrans)
│   ├── _layout.tsx      # providers (thème + auth) + Stack
│   ├── index.tsx        # redirection selon la session
│   ├── login.tsx
│   ├── register.tsx
│   └── tasks.tsx
├── api/                 # client HTTP + appels /auth et /tasks
├── auth/AuthContext.tsx # session (JWT + user) persistée via expo-secure-store
├── theme/index.tsx      # thème (resolveTheme + métriques dérivées des tokens)
├── components/          # Button, Input, TaskItem, ThemePicker
└── types.ts             # types partagés (miroir de l'API)
```

## Notes

- **Design system** : le package `@dev-team/design-system` est consommé en source
  (symlink `file:`). `metro.config.js` ajoute la racine du monorepo aux
  `watchFolders` pour que Metro transpile son TS/TSX.
- **Thème** : `resolveTheme(...).tokens` fournit les rôles sémantiques ; les
  espacements/rayons/tailles sont dérivés des tokens `spacing`, `radius` et
  `fontSize` (conversion « px » → nombre, sans valeur en dur).
- **Sécurité** : le JWT est stocké dans `expo-secure-store` (jamais en clair
  dans AsyncStorage), envoyé via l'en-tête `Authorization: Bearer`.
