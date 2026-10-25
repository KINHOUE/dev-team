# Spec produit — Todo App (projet de test #1)

## Objectif
Valider la pipeline multi-agents (architecte → dev → qa → devops) sur une application de gestion de tâches complète, fonctionnelle et déployable.

## Fonctionnalités (MVP)
1. Inscription / connexion (JWT + bcrypt).
2. Créer, lister, modifier, supprimer une tâche.
3. Marquer une tâche « faite » ; filtrer (à faire / faite).
4. Changement de thème (design system multi-thème).

## Stack imposée
- Backend : Node.js + Express + TypeScript + Prisma (SQLite en développement).
- Web : Vite + React + TypeScript + Tailwind + `@dev-team/design-system`.
- Mobile : React Native + Expo + `@dev-team/design-system` (tokens + thème).
- Authentification : JWT + bcrypt.

## Design (obligatoire)
- Utiliser `@dev-team/design-system` partout ; **aucune couleur, espacement ou rayon en dur**.
- Thème par défaut : `dark`. L'utilisateur peut changer de thème (ex. `ocean`, `forest`, `light`).

## Critères de fin
- API testée : entrées validées côté serveur, erreurs structurées, codes HTTP corrects.
- Web responsive et fonctionnel sur mobile ET desktop.
- Déployé sur Vercel (URL réelle vérifiée).
- Aucun secret commité (`.env` ignoré).

## Hors périmètre (v1)
- Partage de tâches entre utilisateurs (multi-tenant).
- Notifications, réinitialisation de mot de passe, upload de fichiers.
