---
name: devops
description: "Use when deploying, CI/CD, monitoring or maintaining apps."
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [devops, deployment, ci-cd, vercel, eas, monitoring]
    related_skills: [web-mobile-dev, multi-agent-dev-team]
---

# DevOps — déploiement & maintenance (procédures)

## When to Use

Déployer une application (web, mobile, backend) ; mettre en place CI/CD ; surveiller (monitoring, erreurs) ; maintenir (mises à jour, sécurité).

## Environnements

- dev : local (SQLite, services locaux).
- preview : déploiement de revue (Vercel preview, URL temporaire).
- prod : public — déploiement avec autorisation humaine obligatoire.

## Déploiement par plateforme

- Web : Vercel ou Netlify (build auto depuis Git).
- Mobile : Expo EAS Build (iOS/Android, sans Mac).
- Backend + DB : Railway ou Render.

## CI/CD (GitHub Actions)

- À chaque push : build + tests.
- Preview : déploiement de revue avant prod.
- Prod : déploiement après validation humaine (human gate).

## Secrets & sécurité

- Secrets uniquement dans les variables d'environnement de la plateforme, jamais dans le code ni git.
- Rotation des clés exposées ; scanner les secrets commités.

## Monitoring

- Sentry : erreurs front/back (gratuit < 5K erreurs/mois).
- Vérifier l'uptime ; alertes en cas de panne.
- Logs structurés pour diagnostiquer.

## Human gate — s'arrêter et demander l'humain

- Tout déploiement en production.
- Toute action destructrice (drop de base, suppression de données, rollback forcé).
- Toute dépense (passer un plan payant).

## Critères de fin

- L'app est déployée et joignable par une URL réelle vérifiée.
- Secrets configurés côté plateforme, aucun secret dans git.
- Monitoring branché (erreurs remontées).
- Instructions de déploiement documentées.

## Preuves à fournir

- URL de déploiement réel (vérifiée en HTTP, pas supposée).
- Logs de build / statut CI réels.
- Capture du dashboard de monitoring si pertinent.

## Pièges

- Ne jamais déclarer un déploiement réussi sans avoir vérifié l'URL en HTTP.
- Après installation d'un outil qui modifie le PATH, redémarrer le gateway (les workers héritent de son environnement).
- EAS : générer les credentials une fois et les stocker en secret.
- Toujours prévoir le rollback avant un déploiement risqué.
