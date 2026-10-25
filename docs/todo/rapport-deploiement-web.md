# Rapport déploiement web — Todo App (Vercel)

Date : 2026-10-17
Profil : devops
Périmètre : `apps/web` (Vite + React + TS) — déploiement PREVIEW (hors production).

## URL de déploiement

https://temporary-snappy-oxygen-qemgy92.vercel.app

Vérifiée en HTTP : **200 OK** (curl + navigateur réel, React monté, écran de
connexion rendu : sélecteur de thème, champs email/mot de passe, bouton
« Se connecter »).

## Méthode

`vercel deploy --temporary --yes` depuis `apps/web` (Vercel CLI 64.4.0,
Node 24.12.0). Build local puis upload du dossier `dist` (221,1 KB).

Contraintes d'environnement constatées :
- `gh` absent (command not found).
- Vercel CLI non authentifié (aucun `auth.json`, aucun `VERCEL_TOKEN`).

Le déploiement est donc **anonyme** (« Deploying anonymously »), sous le projet
`anonymous/prj_I2vEazR8EehX4l7Y1ZPQTUHeXGG2`. Il s'agit d'un déploiement
temporaire non rattaché à un compte : son URL peut expirer et ne permet pas de
configurer de variables d'environnement côté Vercel.

## Logs de build (extraits réels)

```
Running "npm run build"
> web@0.1.0 build
> tsc --noEmit && vite build
vite v5.4.21 building for production...
✓ 62 modules transformed.
dist/index.html                   0.39 kB │ gzip:  0.26 kB
dist/assets/index-plPugsNu.css   13.00 kB │ gzip:  3.27 kB
dist/assets/index-FkK0kDxw.js   158.02 kB │ gzip: 51.20 kB
✓ built in 2.49s
Uploading (221.1KB/221.1KB)
Building…  Completing…
▲ Temporary  https://temporary-snappy-oxygen-qemgy92.vercel.app
{"status":"ok","deployment":{"id":"dpl_3jnYj89sA2M96fjkBSbLteHMw7fd", ...}}
```

## Secrets — vérification

- `apps/web` ne contient aucun secret en dur : scan du source et du bundle
  (aucune clé, token, mot de passe ou `api_key`).
- Seule variable : `VITE_API_URL` (défaut `http://localhost:3000`), non secrète.
- `apps/web/.gitignore` ignore bien `.env`, `.env.local`, `*.local`.
- Rappel ANO-01 (QA) : le monorepo n'a pas de dépôt Git, la vérification
  `git ls-files` reste impossible ; l'absence de secret a été contrôlée par
  scan direct des fichiers.

## Limites restantes (explicites)

1. Déploiement anonyme/temporaire : pas de compte Vercel → pas d'env vars
   configurables, URL potentiellement expirante. Un déploiement de revue
   durable nécessite un `vercel login` (ou `VERCEL_TOKEN`) + `vercel link`.
2. API non déployée : l'app web pointe par défaut sur `http://localhost:3000`.
   Depuis le preview, les appels API (inscription/connexion/tâches) échouent.
   Déployer `apps/api` (Railway/Render) puis renseigner `VITE_API_URL` côté
   Vercel avant toute mise en production.
3. ANO-02 (QA) toujours ouvert : JWT en localStorage côté web — à corriger
   avant production (cookie httpOnly).
