# @dev-team/api — Backend de la Todo App

API REST Node.js + Express + TypeScript + Prisma (SQLite en dev, PostgreSQL en prod).

## Prérequis
- Node.js ≥ 20

## Installation
```bash
cd apps/api
npm install
cp .env.example .env   # puis renseigner un JWT_SECRET (≥ 16 caractères)
npx prisma migrate dev --name init
```

## Lancer en développement
```bash
npm run dev
# → http://localhost:3000
```

## Build + démarrage production
```bash
npm run build
npm start
```

## Tests
```bash
npm test
```

## Endpoints
| Méthode | Route                | Description                          | Auth |
|---------|----------------------|--------------------------------------|------|
| POST    | /auth/register       | Créer un compte (email + password)   | non  |
| POST    | /auth/login          | Connexion → JWT                      | non  |
| GET     | /tasks               | Lister ses tâches                    | oui  |
| POST    | /tasks               | Créer une tâche (title)              | oui  |
| PUT     | /tasks/:id           | Modifier le titre                    | oui  |
| DELETE  | /tasks/:id           | Supprimer                            | oui  |
| PATCH   | /tasks/:id/complete  | Basculer « faite »                   | oui  |
| GET     | /health              | Sonde de santé                       | non  |

Auth : en-tête `Authorization: Bearer <token>` ou cookie httpOnly `token`.

## Sécurité
- Validation de toutes les entrées (zod).
- Requêtes SQL paramétrées via Prisma.
- Mots de passe hachés bcrypt (bcryptjs).
- JWT courte durée (15 min), cookie httpOnly, CORS limité par `CORS_ORIGINS`.
- `.env` ignoré par git.
