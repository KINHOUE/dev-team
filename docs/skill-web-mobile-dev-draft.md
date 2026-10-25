---
name: web-mobile-dev
description: "Use when building websites, web apps or mobile apps."
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [web-dev, mobile-dev, react, tailwind, expo, deployment, testing]
    related_skills: [multi-agent-dev-team]
---

# Web & Mobile Dev — procédures

## When to Use

Créer un site web, une application web ou mobile ; modifier ou améliorer une application existante ; ajouter une fonctionnalité ; corriger un bug ; créer une interface utilisateur.

## Stack par défaut
- Web : Vite + React + TypeScript + Tailwind, composants séparés, SVG custom.
- Mobile : React Native + Expo (builds via EAS).
- Backend : Node.js (Express) ou Next.js (API routes), TypeScript.
- Base de données : PostgreSQL + Prisma (SQLite en développement) ; Supabase / Firebase pour les projets légers.
- Authentification : JWT + bcrypt (ou Supabase Auth pour le léger).
- Cartes : Leaflet / OpenStreetMap — jamais de clé Google Maps.
- Déploiement : Vercel / Netlify (web), Expo EAS (mobile), Railway / Render (backend).

## Avant de commencer
Si des informations essentielles manquent (type de projet, fonctionnalités, utilisateurs ciblés, design, technologies imposées, contraintes), demander des précisions d'abord.

## Workflow
1. Analyser le besoin et définir les fonctionnalités du projet.
2. Définir l'architecture, les technologies et la structure du projet.
3. Concevoir l'interface utilisateur et développer les fonctionnalités.
4. Tester, identifier et corriger les erreurs.
5. Livrer une version fonctionnelle + instructions d'utilisation et de déploiement.

## Backend — règles et procédures
- API REST propres : routes claires, codes HTTP corrects, erreurs structurées.
- Valider toutes les entrées côté serveur (jamais confiance au client) ; requêtes SQL paramétrées via Prisma (anti-injection).
- Mots de passe : bcrypt ou argon2 uniquement, jamais en clair ; secrets dans .env, jamais commités.
- Migrations Prisma versionnées et réversibles ; jamais de drop destructif sans sauvegarde.
- Auth : JWT courte durée + refresh, cookies httpOnly, CORS limité, rate limiting de base.
- Tester les endpoints (tests d'intégration) avant livraison ; documenter l'API.

## Human gate — s'arrêter et demander l'humain
- Décision importante concernant le produit.
- Action irréversible (suppression de données, paiement, achat).
- Déploiement en production.
- Exigences contradictoires ou insuffisantes.
Avant de s'arrêter : expliquer le blocage, préciser les informations ou autorisations nécessaires, proposer la prochaine étape.

## Comportement en cas d'échec
- Identifier la cause probable : messages d'erreur, journaux, documentation, code concerné.
- Reproduire le problème si possible pour confirmer son origine.
- Proposer et appliquer une correction, en respectant les exigences.
- Tester que la correction fonctionne et ne provoque pas de régression.
- Préserver les fichiers, données et fonctionnalités existants.
- Si le problème persiste : expliquer ce qui a échoué, les causes possibles, les solutions déjà vérifiées, les prochaines étapes.
- Ne jamais inventer un résultat de test, déclarer un bug corrigé sans vérification, ni déclarer une fonctionnalité opérationnelle sans preuve.

## Critères de fin (tous requis avant de déclarer la mission réussie)
- Les fonctionnalités demandées sont présentes et répondent aux besoins.
- L'interface est moderne, intuitive, responsive et compatible avec les appareils ciblés.
- Le code est propre, structuré, maintenable et respecte les bonnes pratiques de sécurité.
- Les fonctionnalités principales ont été testées et fonctionnent.
- Les bugs bloquants et erreurs critiques sont corrigés.
- Le projet se compile / s'installe / se lance selon les exigences.
- Instructions d'installation, d'utilisation et de déploiement fournies.
- Limitations restantes clairement signalées.
- Aucune modification importante non autorisée.
- API : routes et codes HTTP corrects, entrées validées côté serveur, erreurs structurées.
- Base de données : migrations versionnées et appliquées, requêtes paramétrées (pas d'injection).
- Authentification testée (connexion, sessions, autorisations) ; aucun secret commité.

## Preuves à fournir à chaque livraison
- Résumé des fichiers créés ou modifiés et des fonctionnalités livrées.
- Résultats des tests exécutés, avec statut : réussis / échoués / non exécutés.
- Résultats de compilation ou de build quand applicable.
- Erreurs restantes, limitations connues, fonctionnalités non vérifiées.
- Captures d'écran de l'interface quand pertinent.
- Instructions pour lancer, installer ou tester.
- Lien de déploiement uniquement si l'application a réellement été déployée.
