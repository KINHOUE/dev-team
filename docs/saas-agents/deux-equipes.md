# Deux unités d'agents — Dev et Média

Date : 25 octobre 2026
État : **opérationnel et testé**

---

## Schéma

```
┌─────────────────────────────────────────┐
│  UNE SEULE MACHINE                      │
│  un seul gateway (PID 8196, auto-start) │
│  une seule clé API DeepSeek             │
└───────────────┬─────────────────────────┘
                │
     ┌──────────┴───────────┐
     ▼                      ▼
┌──────────────────┐  ┌──────────────────┐
│ UNITÉ DEV        │  │ UNITÉ MÉDIA      │
│ board: default   │  │ board: media     │
│ orchestrateur:   │  │ orchestrateur:   │
│   default (moi)  │  │   media-lead     │
├──────────────────┤  ├──────────────────┤
│ architecte       │  │ video            │
│ dev-web          │  │ marketing        │
│ dev-mobile       │  │                  │
│ qa               │  │                  │
│ devops           │  │                  │
│ secu             │  │                  │
│ maintenance      │  │                  │
└──────────────────┘  └──────────────────┘
   Construit les         Produit le contenu
   applications          et les vidéos
```

## Les deux équipes

| | **Unité Dev** | **Unité Média** |
|---|---|---|
| **Board kanban** | `default` | `media` |
| **Orchestrateur** | `default` | `media-lead` |
| **Agents** | architecte, dev-web, dev-mobile, qa, devops, secu, maintenance | video, marketing |
| **Produit** | sites, applications web et mobiles, API | vidéos, animations, posts, campagnes |
| **Périmètre** | code, tests, sécurité, déploiement | contenu, visuels, motion design |

## Ce qui est isolé

- **Bases kanban séparées** :
  - `kanban\kanban.db` (dev)
  - `kanban\boards\media\kanban.db` (média)
- **Workspaces séparés** : une tâche média travaille dans `kanban\boards\media\workspaces\`, jamais dans celui du dev.
- **Dispatchers séparés** : le log montre `kanban dispatcher [default]` et `kanban dispatcher [media]` indépendamment.
- **Aucune collision possible** entre les deux flux de tâches.

## Ce qui est partagé

- Le **gateway** (un seul processus sert les 11 profils)
- La **clé API** DeepSeek
- La **machine** et les outils (FFmpeg, Node, git)
- Les **skills** communes (copiées dans chaque profil)

## Comment lancer une tâche

### Unité Dev
```
hermes kanban create "..." --assignee dev-web          # board default par défaut
```

### Unité Média
```
hermes kanban --board media create "..." --assignee video
hermes kanban --board media create "..." --assignee marketing
```

Ou depuis l'orchestrateur média :
```
hermes -p media-lead chat -q "Fais-moi une vidéo de 15s pour annoncer le lancement"
```

## Preuve de fonctionnement

| Test | Résultat |
|---|---|
| Board `media` — tâche assignée à `marketing` | ✅ prise en 44 s, terminée en 75 s |
| Réponse de l'agent | « PONG MEDIA — unité média opérationnelle » |
| Dispatcher | `kanban dispatcher [media]: spawned=1` |
| Board `default` — inchangé | ✅ 9 tâches, aucun impact |
| `media-lead` servi par le gateway | ✅ « served by the default multiplexer » |

## Pourquoi cette séparation

1. **Périmètres nets** : un agent média ne peut pas casser du code ; un agent dev ne produit pas de contenu.
2. **Prêt pour le SaaS** : l'unité Média est celle qu'on peut exposer à des clients (contenu = risque faible). L'unité Dev reste interne.
3. **Traçabilité** : le board média montre uniquement le travail média, sans bruit.
4. **Modèles différents possibles** : on peut plus tard mettre `video` sur Claude Opus sans toucher à l'équipe dev.
