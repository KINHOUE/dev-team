# Rapport — Agents & Projets réalisés

Date : 25 octobre 2026
Périmètre : équipe multi-agents `dev-team` (10 profils Hermes) et projets livrés.

---

## 1. L'équipe d'agents

| Profil | Rôle | Modèle / provider | État | Tâches réalisées |
|---|---|---|---|---|
| **default** | Orchestrateur + agent fullstack (web/mobile/backend) | `deepseek-flash` (session) — non défini dans `config.yaml` | ✅ actif | Toutes les itérations du 25/10 ; orchestration, vérifications, déploiements |
| **architecte** | System design, architecture | `deepseek/deepseek-v4-pro` — deepseek | ✅ | 2 tâches (1 doublon archivé) |
| **dev-web** | Backend API + frontend web | `deepseek/deepseek-v4-pro` — deepseek | ✅ | 3 tâches (test d'environnement, API, frontend) |
| **dev-mobile** | Application Expo | `deepseek/deepseek-v4-pro` — deepseek | ✅ | 1 tâche |
| **qa** | Tests, rapport de bugs | `deepseek/deepseek-v4-pro` — deepseek | ✅ | 1 tâche |
| **devops** | Déploiement, CI/CD | `deepseek/deepseek-v4-pro` — deepseek | ✅ | 1 tâche |
| **secu** | Audit sécurité, hacking éthique | `deepseek/deepseek-v4-pro` — deepseek | ✅ (réparé le 25/10) | 2 audits (25/10), hors board |
| **maintenance** | Maintenance applicative | `deepseek/deepseek-v4-pro` — deepseek | ✅ configuré | **0** |
| **video** | Production vidéo | `deepseek/deepseek-v4-pro` — deepseek | ✅ | **0** |
| **marketing** | Marketing, growth | `deepseek/deepseek-v4-pro` — deepseek | ✅ configuré | **0** |

### Notes sur l'état des agents

- **`secu` était cassé** jusqu'au 25/10 : il pointait encore sur Fireworks `kimi-k2p6` (modèle retiré le 17/10). Toute invocation échouait en `HTTP 404`. Migré sur DeepSeek.
- **`video`** : signalé à tort comme incohérent dans la première version de ce rapport (extraction `grep` fautive). Vérification faite : `provider: deepseek`, modèle cohérent, profil opérationnel. Voir `docs/rapport-agents-corriges.md`.
- **4 agents n'ont jamais produit de livrable** : `maintenance`, `video`, `marketing` (jamais sollicités) et `secu` (sollicité seulement le 25/10).

---

## 2. Comment fonctionne l'équipe

- **Orchestrateur** : le profil `default` (celui auquel l'utilisateur parle). Il découpe, assigne, vérifie et déploie.
- **Dispatcher kanban** : intégré au gateway Hermes ; il exécute les tâches du board et les attribue aux profils. Il ne crée rien.
- **Pipeline standard** (corrigé le 25/10) :
  `architecte → dev-web / dev-mobile → qa → secu → devops`

> **Cause racine du retard sécurité** : le pipeline initial s'arrêtait à `devops`. Aucune tâche `secu` n'a été créée, donc l'agent est resté inactif. Correction portée dans `AGENTS.md` (audit obligatoire avant toute production) et dans le skill `web-mobile-dev`.

---

## 3. Projet 1 — Todo App (17 octobre 2026)

**But** : valider la pipeline multi-agents sur une application complète et déployable.

### Tâches du board kanban (8 entrées)

| ID | Tâche | Assigné | Statut |
|---|---|---|---|
| `t_8dbb31c1` | System design — Todo App | architecte | archived (doublon) |
| `t_c91a2189` | Backend API (Express + Prisma + auth) | dev-web | done |
| `t_404a35d0` | Frontend web (Vite + React + design system) | dev-web | done |
| `t_3a962ea0` | App mobile (Expo + design system) | dev-mobile | done |
| `t_6b5e78f5` | Tests & rapport de bugs | qa | done |
| `t_36309ae0` | Déploiement web (Vercel) | devops | done |
| `t_28601c84` | System design — Todo App (reprise) | architecte | done |
| `t_cccc9d86` | Test de démarrage (environnement) | dev-web | done |

### Résultat

**RÉUSSI** : application fonctionnelle de bout en bout (compte → tâches → filtres → thèmes → persistance), déployée sur Vercel avec une base Neon.

### Points de friction corrigés

1. Skill `multi-agent-dev-team` absente du profil architecte → remplacée par `web-mobile-dev`.
2. Clé Fireworks morte (401) → 4 profils basculés sur DeepSeek.
3. Processus serveur impossibles à tuer (`taskkill //F`) → contournement `netstat` + `taskkill /PID`.
4. Vercel non connecté → `vercel login` (device flow).
5. SQLite non viable en cloud → migration PostgreSQL/Neon.
6. Routage serverless Express incorrect → pattern `api/index.ts` + `@vercel/node`.

---

## 4. Projet 2 — Mon Budget (25 octobre 2026)

**But** : transformer la Todo App en application de finances personnelles à deux modules, avec PWA et parité mobile.

> ⚠️ **Ces itérations n'ont pas été tracées sur le board kanban.** Elles ont été conduites directement par l'orchestrateur (`default`) : aucune tâche créée, aucun dispatch vers `dev-web`, `dev-mobile`, `qa` ou `devops`. Les agents n'ont donc pas contribué — seul `secu` a été missionné (audits).

### Itération 1 — Module Finances

- Base : 4 tables (`Category`, `Expense`, `Budget`, `Forecast`) + colonne `currency` sur `User`, migration **additive**.
- API : 6 groupes de routes (catégories, dépenses, budgets, prévisions, stats, réglages), montants en centimes entiers, validation Zod.
- Web : 6 écrans, graphiques SVG custom (donut, histogramme), saisie vocale Web Speech API, multi-devise (10 devises).
- PWA : manifest, service worker, icônes générées localement (Pillow).
- Mobile : écran Finances complet + navigation 2 modules.
- Tests : 17 (dont 6 finance), tous verts.

### Itération 2 — Ajustements d'interface

- `Synthèse` → **Dashboard**, `Réglages` → **Paramètres**.
- Icônes colorées par catégorie dans la répartition.
- Carte des dépenses à deux modes : **Globale** (3 mois) / **Détails** (par catégorie, 6 mois).
- API enrichie : `monthsDetails`.
- Correction : couleurs donut/légende désynchronisées ; devise non rafraîchie.

### Itération 3 — Durcissement

- **Rate limiting** : global 600/15 min, connexion 10 échecs/15 min, inscription 5/h.
- **helmet** : HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`.
- `trust proxy = 1` pour l'IP réelle derrière Vercel.

### Itération 4 — Audit sécurité (agent `secu`)

| # | Faille | Sévérité | Statut |
|---|---|---|---|
| V-01 | `body-parser` < 1.20.9 (DoS) | Élevée | Corrigé |
| V-02 | `zod` < 4.6.6 (épuisement mémoire) | Élevée | Corrigé |
| V-03 | Algorithme JWT non épinglé | Faible | Corrigé |

semgrep : **0 finding** (API 24 fichiers / web 37 fichiers). Contrôles propres : IDOR, injections SQL, XSS, validation, secrets.

### Itération 5 — Failles résiduelles

| # | Faille | Statut | Correctif |
|---|---|---|---|
| V-04 | Dépendances Expo (`uuid`, `zod`, `node-forge`) | Atténué | `overrides` uuid 11.1.1 + zod 4.6.7 ; `node-forge` impossible (aucune version corrigée publiée) |
| V-05 | Jeton JWT dans le corps JSON | Corrigé | Uniquement si `X-Client: mobile` |
| V-06 | CSRF sur la déconnexion | Corrigé | Middleware `csrfOriginCheck` (403 hors liste blanche) |
| V-07 | Énumération d'emails | Corrigé | Réponse 201 identique + hash systématique |
| V-08 | Rate limiting non distribué | Corrigé | Store PostgreSQL (`RateLimit`, `ON CONFLICT DO UPDATE`) |

### Corrections de processus

- `AGENTS.md` : pipeline `architecte → dev → qa → secu → devops`, audit `secu` **obligatoire** avant production ; définition de « terminé » mise à jour.
- Skill `web-mobile-dev` : critères de fin alignés.
- Tables de test : base `neondb_test` dédiée (garde-fou anti-production) ; reset en `globalSetup` Vitest (plus de course entre fichiers).

---

## 5. Chiffres consolidés

| Indicateur | Valeur |
|---|---|
| Profils Hermes | 10 (9 opérationnels, 1 incohérent) |
| Tâches tracées sur le board | 8 (toutes projet 1) |
| Agents ayant livré via le board | 5 (`architecte`, `dev-web`, `dev-mobile`, `qa`, `devops`) |
| Code — API | 33 fichiers, 1 842 lignes |
| Code — Web | 36 fichiers, 3 777 lignes |
| Code — Mobile | 20 fichiers, 2 202 lignes |
| Code — Design system | 18 fichiers, 571 lignes |
| **Total** | **107 fichiers, 8 392 lignes** |
| Tests API | **25/25** (4 fichiers) |
| `npm audit --omit=dev` | API **0**, web **0**, mobile **4 high** (node-forge, impossible à corriger) |
| semgrep | **0 finding** |
| Documentation projet | 944 lignes (`docs/todo/`) |
| Déploiements Vercel | API + web, **HTTP 200** |

---

## 6. Constats et écarts

1. **Le board kanban s'est arrêté le 17/10.** Les 5 itérations du 25/10 ont été faites en direct par l'orchestrateur, sans tâches ni dispatch. Conséquence : pas de traçabilité, et `dev-web` / `dev-mobile` / `qa` / `devops` n'ont pas contribué à la v2 — alors qu'ils existent et fonctionnent.
2. **L'étape sécurité a été oubliée au départ**, découverte seulement à la question de l'utilisateur. Corrigée dans les règles, pas seulement dans le code.
3. **Le profil `secu` était cassé depuis le 17/10** (Fireworks retiré) sans que personne ne le détecte : aucun test de santé des profils n'existe.
4. **Le profil `video` était signalé à tort** comme incohérent (erreur d'extraction de ma part) ; il est en réalité opérationnel. Le profil `maintenance`, lui, manquait réellement de skills métier — corrigé depuis.
5. **3 agents n'ont jamais servi** (`maintenance`, `video`, `marketing`) : l'équipe est surdimensionnée par rapport aux projets livrés.

---

## 7. Recommandations

1. **Repasser par le board** pour tout nouveau projet : une tâche par agent, avec preuves en pièce jointe. C'est ce qui rend l'équipe utile plutôt que décorative.
2. **Ajouter un contrôle de santé des profils** (modèle résolu, provider cohérent, clé valide) avant de lancer une campagne de tâches.
3. **Corriger `video`** : fait — vérification a montré qu'il était déjà correct.
4. **Documenter la Definition of Done** dans chaque projet dès la spec (déjà dans `AGENTS.md`).
5. **Trancher sur `node-forge`** : accepter le résidu (outillage de build) ou planifier une montée d'Expo.
