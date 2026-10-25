# Rapport — Remise en état des agents

Date : 25 octobre 2026
Objet : audit, correction et test de santé réel des 10 profils Hermes de l'équipe `dev-team`.

---

## 1. Méthode

Deux niveaux, pour ne pas se contenter d'une apparence de configuration :

1. **Audit statique** : pour chaque profil — bloc `model` (modèle, provider, `base_url`), présence de la clé API du provider, skills métier installées.
2. **Test de santé réel** : chaque profil reçoit une requête dont la réponse **n'existe pas dans la question** (« Combien font 17+25 ? » → `42`), puis la sortie est vérifiée. Une configuration valide mais une clé morte est ainsi détectée.

> Le premier test utilisait « Réponds OK » : le mot `OK` figurait aussi dans la question, donc la vérification était fausse. Test refait avec `42`.

---

## 2. État des 10 profils

| Profil | Modèle | Provider | Clé API | Skills métier | Santé |
|---|---|---|---|---|---|
| **default** | `deepseek/deepseek-v4-pro` | deepseek | ✅ | orchestrateur (toutes) | ✅ |
| **architecte** | `deepseek/deepseek-v4-pro` | deepseek | ✅ | `web-mobile-dev`, `multi-agent-dev-team`, `architecture-diagram` | ✅ 15 s |
| **dev-web** | `deepseek/deepseek-v4-pro` | deepseek | ✅ | `web-mobile-dev`, `architecture-diagram` | ✅ 21 s |
| **dev-mobile** | `deepseek/deepseek-v4-pro` | deepseek | ✅ | `web-mobile-dev`, `architecture-diagram` | ✅ 14 s |
| **qa** | `deepseek/deepseek-v4-pro` | deepseek | ✅ | `qa`, `web-mobile-dev`, `web-security-audit`, `devops`, `multi-agent-dev-team` | ✅ 15 s |
| **devops** | `deepseek/deepseek-v4-pro` | deepseek | ✅ | `devops`, `web-mobile-dev`, `web-security-audit`, `qa`, `multi-agent-dev-team` | ✅ 14 s |
| **secu** | `deepseek/deepseek-v4-pro` | deepseek | ✅ | `web-security-audit`, `api-key-exposure-and-auth-check`, `api-auth-probing` | ✅ 19 s |
| **maintenance** | `deepseek/deepseek-v4-pro` | deepseek | ✅ | `web-mobile-dev`, `devops`, `architecture-diagram` *(ajoutées)* | ✅ 14 s |
| **video** | `deepseek/deepseek-v4-pro` | deepseek | ✅ | `motion-video` | ✅ 15 s |
| **marketing** | `deepseek/deepseek-v4-pro` | deepseek | ✅ | `marketing-growth` | ✅ 14 s |

**Résultat du test de santé : 9/9 profils répondent correctement** (14 à 21 s chacun), aucune erreur 404/401/403.

---

## 3. Défaillances trouvées et corrigées

### D-01 — `secu` : modèle mort (corrigé)

- **Symptôme** : `HTTP 404: Model not found` à chaque invocation.
- **Cause** : le profil était resté sur Fireworks `accounts/fireworks/models/kimi-k2p6`, retiré le 17/10 — les 8 autres profils avaient été migrés, pas lui.
- **Correctif** : `model.provider = deepseek`, `model.default = deepseek/deepseek-v4-pro`. Hermes a automatiquement purgé `model.base_url` (Fireworks) et `model.api_mode`, puis j'ai fixé `base_url = https://api.deepseek.com`.
- **Vérifié** : réponse `42` en 19 s.

### D-02 — `maintenance` : aucune skill métier (corrigé)

- **Symptôme** : le profil possédait les skills génériques mais **aucune** compétence applicative — il n'aurait pas su réparer une app web ou mobile.
- **Correctif** : copie de `software-development/web-mobile-dev` et `software-development/devops` depuis le profil `devops`.
- **Vérifié** : les deux skills sont présentes ; profil opérationnel (14 s).

### D-03 — `video` : fausse alerte (aucune correction nécessaire)

- **Constat erroné du rapport précédent** : « modèle DeepSeek + provider Fireworks = incohérent ».
- **Réalité** : `config.yaml` du profil `video` contient bien `provider: deepseek`. La lecture fautive venait de mon extraction (`grep -A2`), qui a mélangé le bloc `model` avec un autre champ.
- **Action** : aucune correction de configuration ; l'erreur du rapport précédent est rectifiée (voir `docs/rapport-agents-et-projets.md`).

---

## 4. Points de vigilance (pas des défaillances)

1. **Tous les profils partagent le même modèle** (`deepseek-v4-pro`). Si ce modèle devient indisponible ou change de tarif, les **9 agents tombent en même temps** — aucun n'a de repli configuré.
2. **Aucun contrôle de santé automatique** : la panne du profil `secu` est restée invisible 8 jours. Le script d'audit utilisé aujourd'hui n'est pas planifié.
3. **Clé API unique** (`DEEPSEEK_API_KEY`) pour toute l'équipe : une révocation bloque l'ensemble.
4. **Le board kanban n'a pas servi depuis le 17/10** : les agents sont opérationnels mais non sollicités.

---

## 5. État final

| Indicateur | Avant | Après |
|---|---|---|
| Profils opérationnels | 8 / 10 | **10 / 10** |
| Profils sans skill métier | 1 (`maintenance`) | **0** |
| Profils avec modèle mort | 1 (`secu`) | **0** |
| Erreurs de configuration | 2 | **0** |
| Fausse alerte à rectifier | 1 (`video`) | **0** |

---

## 6. Recommandations

1. **Planifier l'audit de santé** (ce script) une fois par semaine via `cronjob`, avec alerte Telegram en cas d'erreur — c'est ce qui aurait détecté `secu` en 24 h au lieu de 8 jours.
2. **Configurer un modèle de repli** (`model.fallback`) par profil, pour éviter la panne simultanée des 9 agents.
3. **Utiliser le board kanban** pour chaque nouveau projet : une tâche par agent. Sans cela, l'équipe reste inutilisée (constat du rapport précédent).
4. **Surveiller `node-forge`** (seul résidu de sécurité, dépendance de build Expo).
