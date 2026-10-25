---
name: web-security-audit
description: "Use when auditing or securing websites, APIs, applications."
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [security, audit, owasp, pentest, vulnerabilities, cve, hardening]
    related_skills: [multi-agent-dev-team]
---

# Web Security & Ethical Hacking — procédures

## When to Use
Auditer la sécurité d'un site, d'une application ou d'une API ; analyse de code source ; sécurité d'une authentification ; injections SQL, XSS, contrôle d'accès ; configurations serveur ; dépendances vulnérables ; en-têtes HTTP ; audit OWASP Top 10 ; plan de remédiation ; vérification qu'une faille corrigée n'est plus détectable ; rapport de sécurité.

## Avant tout test
Recueillir : l'URL ou les fichiers, la preuve de propriété ou d'autorisation, le périmètre exact et les exclusions, les technologies, l'environnement (dev / préprod / prod), les limites de fréquence et horaires, les actions interdites, le niveau de détail attendu. Si le périmètre ou l'autorisation est ambigu : suspendre les tests actifs et demander des précisions. Privilégier les environnements de test et les méthodes non destructives, surtout en production.

## Stratégie d'audit — 5 phases progressives

**Phase 1 — Analyse non intrusive** : code source et configurations, dépendances (CVE), en-têtes HTTP et TLS visibles, mécanismes d'authentification/autorisation/sessions dans le code, secrets exposés, journaux autorisés.

**Phase 2 — Validation du périmètre** : confirmer propriété/autorisation ; lister domaines, sous-domaines, API, IP et environnements autorisés ; identifier systèmes exclus et actions interdites ; définir limites de fréquence, horaires et conditions d'arrêt ; préférer un environnement de test.

**Phase 3 — Tests actifs contrôlés** (uniquement après la phase 2) : contrôles d'accès, entrées utilisateur, comportement des API, mauvaises configurations exploitables — avec des paramètres prudents, proportionnés au risque. Jamais d'action destructive, d'exfiltration, de déni de service ou d'exploitation intrusive non autorisée.

**Phase 4 — Évaluation et classification** : confirmé / probable / faux positif / non vérifié ; gravité CVSS justifiée (version citée) ; exploitabilité, exposition, impact ; priorité de correction. Aucun score inventé ; signaler si les informations sont insuffisantes.

**Phase 5 — Remédiation et vérification** : corrections concrètes adaptées aux technologies ; modification de code uniquement si autorisée ; tests de non-régression ; toute modification importante en production soumise à validation humaine.

Règle prioritaire : non-intrusif d'abord, actif contrôlé ensuite, intrusif seulement si autorisé, nécessaire et proportionné.

## Human gate — demander l'humain
- Propriété ou autorisation de test pas claire ; périmètre incomplet ou contradictoire.
- Test risquant d'interrompre un service ou d'altérer des données.
- Vulnérabilité semblant permettre l'accès à des données sensibles ; exploitation poussée nécessaire pour confirmer.
- Secrets, données personnelles ou informations confidentielles découverts.
- Correction impliquant une modification importante d'architecture ou d'authentification ; déploiement en production.
- Opération nécessitant des privilèges élevés, une dépense ou un accès externe ; risque exigeant une décision métier.
Expliquer la situation, les conséquences possibles et les validations nécessaires avant de poursuivre.

## Stop — arrêter les tests actifs
- Autorisation ou périmètre non confirmé ; le test atteint un système tiers ou un actif exclu.
- Risque d'endommagement, de perturbation ou de corruption ; comportement inattendu dangereux.
- Données personnelles, identifiants ou secrets réels apparaissent sans nécessité.
- Faille non confirmable sans action intrusive non autorisée ; limites de fréquence dépassées.
- Validation humaine requise avant une action à fort impact ; environnement de test trop risqué.
Conserver les résultats non sensibles obtenus, documenter le motif, ne rien faire de plus, indiquer les conditions de reprise sûre.

## Comportement en cas d'échec
- Identifier la cause : outil indisponible, autorisation insuffisante, configuration incorrecte, erreur de connexion, résultat ambigu.
- Consulter journaux et erreurs sans exposer d'informations sensibles ; vérifier la config de l'outil et les limites du périmètre.
- Réessayer uniquement les contrôles sûrs et raisonnables ; éviter les scans répétés ou agressifs.
- Distinguer un échec de test d'une preuve de vulnérabilité ; documenter les contrôles non exécutés et pourquoi.
- Proposer une alternative sûre (analyse statique, environnement de préproduction).
- Faille non confirmée → signaler comme potentielle avec les vérifications nécessaires.
- Ne jamais inventer de résultats ni affirmer une correction sans vérification appropriée.

## Critères de fin (tous requis)
- Périmètre et autorisations documentés ; contrôles prévus exécutés dans les limites autorisées.
- Vulnérabilités documentées avec preuves suffisantes ; chacune avec gravité et priorité justifiées.
- Faux positifs et constats incertains clairement identifiés ; risques classés (gravité, exploitabilité, impact).
- Corrections concrètes proposées pour chaque vulnérabilité importante ; corrections réalisées testées si possible.
- Limitations, risques résiduels et zones non vérifiées signalés ; rapport exploitable fourni.
- Rappeler que l'absence de vulnérabilité détectée ne signifie pas absence de failles.

## Rapport d'audit à fournir (preuves)
- Périmètre, exclusions, autorisations ; date, outils utilisés et leurs versions.
- Résumé exécutif pour les non-techniques ; tableau des vulnérabilités détectées.
- Par constat : identifiant, titre, description, actifs concernés, gravité, impact, priorité, degré de confiance (confirmé / probable / faux positif / non vérifié).
- Méthode de classification : CVSS avec score et version justifiés.
- Preuves techniques minimales et expurgées (jamais de données sensibles inutilement divulguées).
- Recommandations avec exemples de code sécurisé quand pertinent ; résultats des tests après correction.
- Risques résiduels, limites de l'audit, éléments non vérifiés ; plan d'action classé par priorité (immédiate, élevée, moyenne, faible).
- Preuves reproductibles dans le périmètre autorisé et correspondant à des vérifications réellement effectuées.
