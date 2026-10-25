---
name: qa
description: "Use when testing web/mobile apps and APIs for bugs."
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [qa, testing, playwright, e2e, bug-report]
    related_skills: [web-mobile-dev, multi-agent-dev-team]
---

# QA — assurance qualité (procédures)

## When to Use

Tester une application web, mobile ou une API ; écrire un plan de test ; reproduire et documenter des bugs ; valider une fonctionnalité avant livraison.

## Workflow

1. Lire la spec produit (`docs/`) et le system design pour comprendre le comportement attendu.
2. Écrire les scénarios de test : nominal, limites, erreurs, sécurité de base.
3. Exécuter : tests manuels exploratoires + tests automatisés quand pertinent.
4. Documenter chaque bug : reproduction, étapes, sévérité, capture.
5. Livrer un rapport de test avec statut clair (réussi / échoué / non testé).

## Types de tests

- Unitaires : Vitest/Jest (logique isolée).
- Intégration API : Supertest contre le backend (routes, codes HTTP, validation).
- E2E web : Playwright (parcours utilisateur réels).
- E2E mobile : Detox ou Maestro.
- Accessibilité : axe / Lighthouse.
- Responsive : tester plusieurs tailles d'écran.

## Rapport de bug (obligatoire)

Chaque bug = un ticket avec :
- Résumé + étapes de reproduction numérotées.
- Comportement attendu vs observé.
- Sévérité : bloquant / majeur / mineur / cosmétique.
- Environnement : navigateur, OS, device, version.
- Preuve : capture d'écran ou vidéo.

## Critères de fin

- Toutes les fonctionnalités demandées sont testées.
- Les bugs bloquants sont documentés et assignés.
- Aucun résultat inventé : chaque statut est vérifié par une exécution réelle.

## Preuves à fournir

- Rapport de test (scénarios + résultats réels).
- Captures/vidéos des bugs.
- Sortie réelle des tests automatisés.

## Pièges

- Ne jamais déclarer « tout passe » sans avoir exécuté les tests.
- Tester le scénario d'erreur, pas seulement le nominal.
- Un bug sans étapes de reproduction n'est pas un bug : exiger les étapes.
