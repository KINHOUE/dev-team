# Rapport QA — Todo App

Date : 2026-10-17
Profil : qa
Périmètre : backend `apps/api`, web `apps/web`, mobile `apps/mobile` (monorepo `C:/Users/PC/dev-team`).
Références : `docs/todo/spec.md`, `docs/todo/system-design.md`.

## Verdict global

**RÉUSSI** — l'application est fonctionnelle de bout en bout. Aucun bug bloquant ni majeur
n'a été trouvé. Deux anomalies mineures sont documentées (absence de dépôt Git, JWT en
localStorage côté web).

Tous les résultats ci-dessous proviennent d'exécutions réelles (tests, builds, navigateur,
requêtes HTTP), jamais de valeurs inventées.

## Environnement de test

- OS : Windows 11
- Node : v24.12.0
- API testée : `http://localhost:3000` (démarrée via `tsx src/index.ts`)
- Web testé : `http://localhost:5173` (Vite dev)
- Navigateur : Chromium piloté (browser harness)
- Mobile : bundle Metro `expo export --platform android` + revue de code + `tsc --noEmit`

---

## 1. API (apps/api)

### 1.1 Suite de tests existante (vitest)

Exécution réelle : `npm test`

- 2 fichiers, **11 tests, tous réussis**.
- Couverture : register (201 / 400 email invalide / 400 mdp court / 409 doublon),
  login (200 / 401 mauvais mdp / 401 email inconnu), auth requise (401), CRUD complet
  + bascule « faite », titre vide (400), isolation inter-utilisateurs (404).

### 1.2 Tests d'intégration complémentaires (smoke, 45 cas)

Exécution réelle : script Node `fetch` contre le serveur en marche — **45 PASS / 0 FAIL**.

| Domaine | Cas vérifiés | Statut |
|---|---|---|
| Inscription | 201 + token, pas de fuite de `passwordHash` | réussi |
| Validation email | email invalide → 400, erreur structurée | réussi |
| Validation mdp | < 8 → 400, > 72 → 400, absent → 400 | réussi |
| Doublon | email déjà utilisé → 409 (y compris casse différente) | réussi |
| Connexion | 200 valide, 401 mauvais mdp, 401 email inconnu | réussi |
| Auth | GET/POST `/tasks` sans token → 401, token invalide → 401 | réussi |
| Création tâche | 201, titre trimé, `done=false` par défaut | réussi |
| Validation titre | vide → 400, blanc → 400, > 255 → 400, absent → 400 | réussi |
| Lecture | GET `/tasks` → 200, contenu correct | réussi |
| Modification | PUT → 200, titre mis à jour, blanc → 400, inexistant → 404 | réussi |
| Bascule « faite » | PATCH → 200, `true` puis `false`, inexistant → 404 | réussi |
| Suppression | DELETE → 204, re-suppression → 404, liste vide après | réussi |
| Isolation multi-utilisateur | B ne voit pas / ne modifie pas / ne supprime pas / ne toggle pas la tâche de A (404) | réussi |
| Route inconnue | 404 avec erreur structurée | réussi |
| Santé | GET `/health` → 200 `{status:ok}` | réussi |
| CORS | origine non listée refusée, origine listée autorisée | réussi |

### 1.3 Typecheck

`npm run typecheck` → **exit 0**.

### 1.4 Statut API : **RÉUSSI**

---

## 2. Web (apps/web)

### 2.1 Build

`npm run build` (tsc --noEmit + vite build) → **exit 0** (62 modules, 158 kB JS / 13 kB CSS).

### 2.2 Parcours nominal (navigateur réel)

Exécution réelle, pas de données inventées :

| Étape | Observation | Statut |
|---|---|---|
| Inscription | compte créé, écran tâches affiché | réussi |
| Création | 2 tâches ajoutées, compteurs « Toutes / À faire / Faites » corrects | réussi |
| Marquer faite | toggle → badge « Faite », compteur « Faites » = 1 | réussi |
| Filtre | « Faites » → 1 seul résultat, « À faire » → 1, « Toutes » → 2 | réussi |
| Modification | édition inline → titre mis à jour | réussi |
| Suppression | tâche supprimée, compteurs recalculés | réussi |
| Changement de thème | dark → ocean : `--ds-accent` 99 102 241 → 6 182 212, fond bouton `rgb(6,182,212)` | réussi |
| Déconnexion | retour à l'écran de connexion | réussi |
| Session | reconnexion puis rechargement → session restaurée (localStorage) | réussi |

### 2.3 Scénarios d'erreur

| Scénario | Observation | Statut |
|---|---|---|
| Connexion mauvais mot de passe | message « Email ou mot de passe incorrect » (role=alert) | réussi |

### 2.4 Responsive

Viewport mobile 375×667 (deviceScaleFactor 2) :

- Email utilisateur du header masqué (`display:none`, classe `hidden sm:inline`) : **réussi**.
- Formulaire d'ajout passe en `flex-direction: column` : **réussi**.

### 2.5 Design system

Recherche de couleurs en dur dans `apps/web/src` : seule occurrence `rgb(var(--ds-accent))`
dans `index.css` (variable sémantique, pas une couleur en dur). **Conforme.**

### 2.6 Statut Web : **RÉUSSI**

---

## 3. Mobile (apps/mobile)

### 3.1 Compilation

- `npx tsc --noEmit` → **exit 0**.
- `npx expo export --platform android` → **exit 0** (1171 modules, bundle hbc 2,5 Mo).

### 3.2 Revue de câblage API

Vérifié écran par écran que chaque appel correspond exactement aux routes de l'API :

| Écran / module | Endpoint câblé | Route API | Statut |
|---|---|---|---|
| `src/api/auth.ts` | register, login | POST `/auth/register`, POST `/auth/login` | câblé |
| `src/api/tasks.ts` | list, create, update, delete, toggle | GET/POST/PUT/DELETE `/tasks`, PATCH `/tasks/:id/complete` | câblé |
| `src/app/index.tsx` | redirection selon session | `/tasks` si token, sinon `/login` | câblé |
| `src/app/login.tsx` | signIn → `router.replace('/tasks')` | — | câblé |
| `src/app/register.tsx` | signUp + confirmation mdp → `/tasks` | — | câblé |
| `src/app/tasks.tsx` | CRUD + bascule + filtre + thème + déconnexion | — | câblé |
| `src/auth/AuthContext.tsx` | JWT persisté via expo-secure-store | — | câblé |
| `src/theme/index.tsx` | tokens + thèmes via `@dev-team/design-system` | — | câblé |

Aucune couleur / espacement / rayon / valeur `px` en dur dans `apps/mobile/src`
(recherche `#hex`, `rgb(`, chaînes `px` → aucune occurrence).

### 3.3 Statut Mobile : **RÉUSSI** (compilation + revue)

Note : pas de test E2E sur émulateur/appareil physique — hors périmètre de la tâche
(« compilation + revue » demandés). Les écrans sont correctement câblés mais n'ont pas
été exercés sur un device réel.

---

## 4. Bugs & anomalies

### ANO-01 — Absence de dépôt Git (sévérité : mineur, processus)

- **Résumé** : le monorepo `C:/Users/PC/dev-team` n'est pas un dépôt Git (aucun `.git`
  à la racine ni dans les sous-dossiers).
- **Étapes de reproduction** : `git status` → `fatal: not a git repository`.
- **Attendu** : AGENTS.md §5 impose branches/PR ; spec §« Critères de fin » exige
  « aucun secret commité (`.env` ignoré) ».
- **Observé** : impossible de vérifier par Git qu'aucun secret n'est commité. Le fichier
  `apps/api/.env` existe localement (avec un JWT_SECRET non-placeholder) et est bien listé
  dans `apps/api/.gitignore`, mais sans dépôt rien ne protège ni ne prouve l'absence de fuite.
- **Environnement** : Windows 11, racine du monorepo.
- **Recommandation** : initialiser Git (et un remote) avant le déploiement, puis vérifier
  `git ls-files | grep -iE '\.env|secret'` vide.

### ANO-02 — JWT stocké en localStorage côté web (sévérité : mineur, sécurité)

- **Résumé** : le client web stocke le token JWT dans `localStorage` et l'envoie en header
  `Authorization: Bearer`, au lieu de s'appuyer sur le cookie httpOnly posé par l'API.
- **Étapes de reproduction** : s'inscrire → inspecter `localStorage['todo.token']` ; la
  valeur est lisible par n'importe quel script de la page.
- **Attendu** : system-design §3 — « JWT courte durée + refresh, cookies httpOnly » ;
  AGENTS.md §6 — « cookies httpOnly ».
- **Observé** : l'API pose bien un cookie httpOnly (`res.cookie('token', …)`), mais le
  client web l'ignore et duplique le token en localStorage (exposé au vol par XSS).
- **Environnement** : web, Chromium ; code : `apps/web/src/lib/storage.ts`,
  `apps/web/src/lib/api.ts`, `apps/web/src/context/AuthContext.tsx`.
- **Impact réel** : faible pour cette démo (JWT 15 min, pas de données sensibles), mais
  c'est une déviation documentée de l'architecture à corriger avant mise en production.
- **Recommandation** : utiliser le cookie httpOnly pour l'authentification des requêtes
  (avec `credentials: 'include'`), ou ajouter une route `GET /auth/me` pour restaurer la
  session depuis le cookie — la décision a été notée par le dev web dans son handoff.

Aucun bug fonctionnel bloquant ou majeur n'a été observé.

---

## 5. Critères de fin (spec)

| Critère | Statut |
|---|---|
| API testée : entrées validées, erreurs structurées, codes HTTP corrects | réussi |
| Web responsive et fonctionnel mobile + desktop | réussi |
| Design system respecté (aucune couleur/espacement/rayon en dur) | réussi |
| Auth : accès non autorisé refusé | réussi |
| Aucun secret commité | **non vérifiable** (absence de dépôt Git — ANO-01) |
| Déployé sur Vercel (URL réelle) | **non testé** (tâche devops suivante, hors périmètre QA) |

---

## 6. Preuves

- Sortie réelle `npm test` (11 tests) : `apps/api` — conservée dans ce run.
- Script smoke API (45 cas) : `C:/Users/PC/AppData/Local/hermes/profiles/qa/cache/scratch/api-smoke.mjs`.
- Build web : `npm run build` exit 0.
- Bundle mobile : `npx expo export --platform android` exit 0 (1171 modules).
- Captures (dossier `docs/todo/screenshots-qa/`) :
  - `qa-web-tasks.png` — liste de tâches (desktop)
  - `qa-web-mobile.png` — vue mobile 375×667
  - `qa-web-login-error.png` — message d'erreur de connexion
  - `qa-web-theme-ocean.png` — thème ocean appliqué

## 7. Limitations restantes

- Mobile : pas de test sur émulateur/appareil réel (compilation + revue uniquement,
  conformément au périmètre de la tâche).
- Déploiement Vercel : à vérifier par le devops (tâche suivante).
- Absence de dépôt Git : empêche la vérification automatique de l'absence de secret commité.
