# Livraison — Module Finances + PWA (Todo App v2)

Date : 25 octobre 2026
Périmètre : transformation de la Todo App en application à **deux modules** (Finances + Tâches), avec PWA et parité mobile.

## URLs de production

- Web / PWA : https://web-blond-zeta-0qhsvs6qxj.vercel.app
- API : https://api-seven-vert-95.vercel.app/api
- Base : Neon PostgreSQL, projet `todo-app`, base `neondb` (+ base de test `neondb_test`)

## Fonctionnalités livrées

### Module Finances
1. **Dépenses** : création, édition, suppression, filtrage par catégorie, mois navigable.
2. **Saisie vocale** (web/PWA) : Web Speech API `fr-FR`, bouton micro dans le champ montant.
   - Dicter « 5 000 taxi » remplit le montant (5 000) et la catégorie (Transport).
   - Extraction du montant : chiffres, espaces, points de milliers, virgule décimale, suffixes FCFA/€.
   - Correspondance par mots-clés par catégorie, avec repli sur le nom de la catégorie.
3. **Budget** : budget global mensuel **et** budgets par catégorie (les deux configurables séparément).
4. **Prévisions** : saisie manuelle, globale ou par catégorie, avec note.
5. **Catégories** : 8 catégories par défaut créées automatiquement (Alimentation, Transport, Logement, Santé, Loisirs, Factures, Shopping, Autres) + création/édition/suppression avec icônes.
6. **Graphiques** (SVG custom, aucune dépendance) : donut de répartition par catégorie, histogramme des 6 derniers mois, barres de progression budget vs réel.
7. **Multi-devise** : choix dans les réglages (XOF, XAF, EUR, USD, GBP, NGN, GHS, MAD, CAD, CHF).
8. **Synthèse** : dépensé, budget, reste/dépassement, prévisions, alertes de dépassement.

### Module Tâches
Conservé tel quel (création, édition, échéance, filtres, bascule fait/à faire).

### PWA
- `manifest.webmanifest` complet (nom, icônes 192/512/maskable, `display: standalone`, `theme_color`, `lang: fr`).
- Service worker généré par VitePWA (`autoUpdate`), app shell précachée (13 entrées).
- Les appels API ne sont **jamais** mis en cache (données financières personnelles).
- Icônes générées localement (`scripts/generate-icons.py`, Pillow) — aucun service externe.

### Mobile (Expo)
- Écran **Finances** complet : synthèse, dépenses, budget, prévisions, catégories, réglages.
- Navigation par onglets Finances / Tâches (`AppTabs`).
- Graphiques en barres proportionnelles (Views, sans dépendance SVG).
- **Limitation assumée** : pas de dictée vocale sur mobile (nécessite un module natif et un dev build EAS) ; message explicite affiché dans le formulaire.

## Architecture technique

### Base de données (Prisma / PostgreSQL)
| Table | Rôle |
|---|---|
| `User` | + colonne `currency` (devise du compte, défaut `XOF`) |
| `Category` | nom, clé d'icône, couleur, unique (userId, name) |
| `Expense` | `amountCents` (entier, jamais de flottant), date, note, `source` (`manual`/`voice`) |
| `Budget` | `month` (`AAAA-MM`), `categoryId` nullable (null = budget global) |
| `Forecast` | `month`, `categoryId` nullable, note |

Migration appliquée en **additif uniquement** (`prisma/migration-add-finance.sql`) : 1 colonne + 4 tables + index + clés étrangères. La table de démonstration Neon `playing_with_neon` a été **préservée** (le `DROP` proposé par Prisma a été exclu volontairement).

### API (Express + TypeScript)
- `GET/POST/PUT/DELETE /categories` — catégories par défaut créées au premier accès.
- `GET/POST/PUT/DELETE /expenses` — filtres `month`, `categoryId`, pagination implicite 500.
- `GET/PUT/DELETE /budgets` — upsert global ou par catégorie (unicité applicative, les NULL n'étant pas dédupliqués par un index PostgreSQL).
- `GET/POST/PUT/DELETE /forecasts`.
- `GET /stats/dashboard?month=` — agrégats : total, par catégorie, budget, reste, prévisions, historique 6 mois.
- `GET /auth/me` renvoie `currency` ; `PATCH /auth/me` change la devise (validation d'une liste fermée).

Toutes les entrées sont validées par Zod côté serveur. Les montants sont stockés en **centimes entiers** (aucune erreur d'arrondi flottant).

### Frontend web (Vite + React + TypeScript + design system)
- `screens/OverviewScreen`, `ExpensesScreen`, `BudgetScreen`, `ForecastsScreen`, `CategoriesScreen`, `SettingsScreen`.
- `components/ExpenseForm` (avec micro), `CategoryIcon` (SVG maison), `charts/DonutChart`, `charts/BarChart`, `AppNav`, `MonthPicker`.
- `lib/money.ts` (formatage par devise, parsing de saisie), `lib/voice.ts` (Web Speech + extraction montant/catégorie), `lib/chartColors.ts`.
- Aucune couleur en dur : les graphiques consomment les variables CSS `--ds-*` du thème actif.

## Preuves d'exécution (25/10/2026)

| Vérification | Résultat |
|---|---|
| Tests API (`npm test`) | **17/17 passent** (auth 7, tâches 4, finances 6) |
| Typecheck API | ✅ |
| Typecheck web | ✅ |
| Build web + PWA | ✅ (`sw.js`, 13 fichiers précachés) |
| Typecheck mobile | ✅ |
| Export Android (Metro) | ✅ (1176 modules, bundle 2,6 Mo) |
| API prod `/health` | HTTP 200 |
| API prod : register → catégories → dépense → dashboard | ✅ (8 catégories auto, dépense 201, total correct) |
| Web prod | HTTP 200, titre correct, manifest 200, `sw.js` 200 |
| Service worker prod | `active` |
| Parcours navigateur (inscription, dépense, budget, prévision, catégorie, devise) | ✅ testé sur les données réelles |

## Corrections apportées pendant la validation

1. **Tests API cassés depuis le passage à PostgreSQL** : `setup.ts` utilisait SQLite (`file:./test.db`). Remplacé par une base de test dédiée `neondb_test` (dérivée de `DATABASE_URL`), avec garde-fou refusant la base de production.
2. **Reset de base exécuté en parallèle** par chaque fichier de test → déplacé dans `globalSetup` Vitest (une seule fois).
3. **Couleurs du donut et de la légende désynchronisées** (tri différent) → tri unique partagé et `seriesColor(index)`.
4. **Devise non rafraîchie sur la synthèse** (elle lisait la valeur du dernier chargement) → la synthèse consomme désormais la devise du compte.

## Limites connues

- **Pas de conversion de devise** : changer de devise change l'affichage, pas les montants.
- **Notes vocales sur mobile** : indisponibles sans dev build EAS (module natif de reconnaissance vocale).
- **Hors périmètre v1** (inchangé) : partage de tâches/dépenses entre utilisateurs, notifications, réinitialisation de mot de passe, upload de fichiers.
- **Édition des catégories sur mobile** : création et suppression disponibles ; le renommage se fait sur le web.
- Le service worker met en cache l'app shell mais **pas** les données : hors-ligne, l'app s'ouvre mais les données nécessitent le réseau (pas de synchro offline).

## Itération 2 — ajustements d'interface (25/10/2026)

1. Onglets renommés : **Synthèse → Dashboard**, **Réglages → Paramètres** (web et mobile).
2. Répartition par catégorie : chaque catégorie affiche désormais son **icône SVG colorée** (couleur de série stable, partagée avec le donut).
3. Carte des dépenses : deux modes via boutons —
   - **Globale** : histogramme des **3 derniers mois** ;
   - **Détails** : barres **horizontales par catégorie** (une ligne par catégorie : icône colorée, part en %, total sur 6 mois).
4. Nouvel endpoint enrichi : `/stats/dashboard` renvoie `monthsDetails` (total et répartition par catégorie pour chacun des 6 mois).
5. Tests API : nouvelle assertion sur `monthsDetails` — **17/17** passent.
6. API et web redéployés en production et vérifiés.

## Itération 3 — durcissement sécurité (25/10/2026)

Audit du code réel → deux protections absentes comblées :

1. **Rate limiting** (`express-rate-limit`) :
   - global : 600 requêtes / 15 min par IP ;
   - connexion : 10 échecs / 15 min par IP (`skipSuccessfulRequests` : une connexion réussie ne consomme pas de quota) ;
   - inscription : 5 comptes / heure par IP.
   - Désactivé en `NODE_ENV=test` pour ne pas casser la suite de tests ; les préflight CORS (OPTIONS) ne consomment pas de quota.
2. **helmet** : HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options`, `Referrer-Policy`, `X-Dns-Prefetch-Control`, `crossOriginResourcePolicy: cross-origin` (API appelée depuis le web).
3. `trust proxy = 1` : l'IP client réelle est lue dans `X-Forwarded-For` (proxy Vercel).

Vérifié en production : en-têtes présents, et 11ᵉ tentative de connexion échouée → **429**.

**Limite assumée** : le store de `express-rate-limit` est en mémoire, donc par instance serverless — le quota est approximatif si Vercel scale plusieurs instances. Pour un quota strict, brancher un store partagé (Upstash Redis).

**Reste à faire (sécurité)** : vérification d'email à l'inscription, audit complet par l'agent `secu` (semgrep + `npm audit` + OWASP Top 10). L'agent sécurité n'avait jamais été missionné sur ce projet — aucune tâche sécurité dans le pipeline T1–T6.

## Itération 4 — audit par l'agent `secu` (25/10/2026)

Rapport complet : `docs/todo/audit-securite.md`.

Corrigé et vérifié :
1. **V-01 (élevée)** — `body-parser` < 1.20.9, DoS via octets de fin après corps compressé → monté en 1.20.9.
2. **V-02 (élevée)** — `zod` < 4.6.6, épuisement mémoire sur tableaux non bornés → monté en 4.6.7.
3. **V-03 (faible)** — algorithme JWT non épinglé → `jwt.verify(..., { algorithms: ['HS256'] })`.

Vérifié en production après déploiement : register, login, catégories, création de dépense (201), rejet d'un montant négatif (400), dashboard — tous corrects avec zod 4.

Résiduels documentés (non corrigés, avec justification) : dépendances transitives Expo (outils de build), jeton dans le corps JSON (requis par le mobile), CSRF limité à la déconnexion, énumération d'emails (atténuée par le rate limiting d'inscription), rate limiting en mémoire (store Redis nécessaire pour un quota global).

Contrôles sans défaut : IDOR (isolation `userId` sur toutes les routes), injections SQL (aucun `$queryRaw`), XSS, validation Zod, secrets, helmet/CORS/rate-limit. semgrep : **0 finding** sur l'API (24 fichiers, 80 règles) et le web (37 fichiers, 79 règles).

**Correctif de processus** : `AGENTS.md` impose désormais `architecte → dev → qa → secu → devops`, l'audit `secu` étant obligatoire avant tout déploiement en production. Le skill `web-mobile-dev` a été aligné.

**Bug d'infrastructure trouvé** : le profil `secu` pointait encore sur Fireworks `kimi-k2p6` (modèle mort depuis le 17/10, HTTP 404) alors que les 8 autres profils étaient sur DeepSeek → migré sur `deepseek/deepseek-v4-pro`.

## Itération 5 — failles résiduelles V-04 → V-08 (25/10/2026)

| # | Statut | Correctif |
|---|---|---|
| V-04 | **ATTÉNUÉ** | `overrides` npm : `uuid` 7.0.3→11.1.1, `zod` 3.25.76→4.6.7 ; export Android inchangé. `node-forge` impossible : la dernière version publiée (1.4.0) est la version vulnérable, aucune corrigée n'existe. |
| V-05 | **CORRIGÉ** | Le jeton n'est plus dans le corps JSON que si `X-Client: mobile` ; le web ne l'obtient que par le cookie httpOnly. |
| V-06 | **CORRIGÉ** | Middleware `csrfOriginCheck` : toute mutation portant un `Origin` hors liste blanche sans Bearer → 403. |
| V-07 | **CORRIGÉ** | `register` renvoie 201 identique que l'email existe ou non, hash bcrypt systématique (égalisation temporelle) ; session via `/auth/login`. |
| V-08 | **CORRIGÉ** | Store `express-rate-limit` sur PostgreSQL (table `RateLimit`, `INSERT … ON CONFLICT DO UPDATE` atomique) pour login/register ; global en mémoire (compromis documenté). Migration additive appliquée. |

Vérifications indépendantes après déploiement :
- Tests API : **25/25** (4 fichiers, dont `rateLimitStore.test.ts`).
- Typecheck API / web / mobile : **OK**. Build web : **OK**. Export Android : **OK**.
- `npm audit --omit=dev` : API **0**, web **0**, mobile **4 high** (node-forge uniquement — résidu documenté).
- Table `RateLimit` présente en base.
- Smoke test production : register 201 (message neutre), login web sans jeton dans le corps, login mobile avec jeton, logout origine malveillante **403**, origine autorisée **204**, dépense 201, dashboard correct.
- Anti force-brute en production : 10 tentatives ratées → **429**.

Résidu final : `node-forge` (dépendance de build Expo, aucune version corrigée publiée) — à surveiller lors d'une prochaine mise à jour d'Expo.
