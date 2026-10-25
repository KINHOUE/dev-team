# Mon Budget — monorepo dev-team

Application complète de **gestion de tâches et de finances personnelles**, déclinée en web (PWA installable) et en mobile (Expo), avec un backend Node/Express et une base PostgreSQL.

## Aperçu

| Module | Fonctionnalités |
|---|---|
| **Tâches** | création, édition, filtres, priorés, persistance |
| **Finances** | dépenses, budget global et par catégorie, prévisions, catégories avec icônes, graphiques, note vocale, multi-devise |

Trois interfaces partagent le même backend et le même design system à 7 thèmes.

## Architecture

```
dev-team/
├── apps/
│   ├── api/                 Express + Prisma + PostgreSQL
│   ├── web/                 Vite + React + TypeScript + Tailwind (PWA)
│   └── mobile/              Expo (React Native)
├── packages/
│   └── design-system/       7 thèmes, tokens sémantiques partagés web/mobile
├── docs/                    rapports de livraison, audit sécurité, architecture
└── AGENTS.md                conventions de l'équipe d'agents
```

## Stack

| Couche | Technologie |
|---|---|
| Frontend web | Vite, React, TypeScript, Tailwind CSS, PWA (service worker) |
| Mobile | React Native, Expo |
| Backend | Node.js, Express, TypeScript |
| Base de données | PostgreSQL (Neon) via Prisma |
| Authentification | JWT (httpOnly cookie), bcrypt |
| Graphiques | SVG maison (aucune librairie lourde) |
| Déploiement | Vercel (API + web), Expo EAS (mobile) |

## Démarrage

### Prérequis
- Node.js 20+
- PostgreSQL (ou une base Neon gratuite)

### API

```bash
cd apps/api
cp .env.example .env      # renseigner DATABASE_URL et JWT_SECRET
npm install
npx prisma migrate dev
npm run dev               # http://localhost:3000
```

### Web

```bash
cd apps/web
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

### Mobile

```bash
cd apps/mobile
cp .env.example .env
npm install
npx expo start
```

## Tests

```bash
cd apps/api
npm test
```

La suite couvre l'authentification, les tâches, le module finances, la sécurité (CSRF, rate limiting) et les statistiques.

## Sécurité

- Mots de passe hachés (bcrypt), jetons JWT signés HS256 et épinglés
- Jetons en cookie `httpOnly` (le web ne les voit jamais)
- Validation systématique des entrées (Zod)
- Rate limiting distribué (PostgreSQL)
- Protection CSRF par vérification d'origine
- Réponses d'inscription non énumérables
- **Aucun secret dans ce dépôt** : seuls les `.env.example` sont versionnés

Voir [`docs/todo/audit-securite.md`](docs/todo/audit-securite.md) pour le rapport d'audit complet.

## Documentation

| Fichier | Contenu |
|---|---|
| [`docs/todo/rapport-livraison-finance.md`](docs/todo/rapport-livraison-finance.md) | livraison du module finances, itérations |
| [`docs/todo/audit-securite.md`](docs/todo/audit-securite.md) | audit de sécurité et correctifs |
| [`docs/saas-agents/architecture-mvp.md`](docs/saas-agents/architecture-mvp.md) | architecture d'un SaaS d'agents |
| [`docs/saas-agents/deux-equipes.md`](docs/saas-agents/deux-equipes.md) | séparation des unités Dev et Média |

## Licence

MIT — voir [LICENSE](LICENSE).
