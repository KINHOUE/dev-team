# Santé des agents — 2026-10-25

## Verdict

9/9 agents opérationnels (test réel de bout en bout). Aucune défaillance.

## Tableau des résultats

| Profil | Statut | Durée |
|---|---|---|
| architecte | OK | 16s |
| dev-web | OK | 16s |
| dev-mobile | OK | 15s |
| qa | OK | 20s |
| devops | OK | 20s |
| secu | OK | 18s |
| maintenance | OK | 24s |
| video | OK | 17s |
| marketing | OK | 16s |

Note : le profil `default` (orchestrateur) figure dans l'audit statique (10 profils au total) mais n'est pas un profil agent ; il n'est pas soumis au test réel.

## Audit statique

- 10 profils analysés, 0 problème détecté.
- Modèle, provider, clé API et skills présents pour chaque profil.

## Défaillances

- Aucune.

## Actions correctives appliquées

- Aucune.

## Points de vigilance

- **Modèle unique partagé** : les 10 profils utilisent `deepseek/deepseek-v4-pro`. Une panne ou un retrait de ce modèle mettrait toute l'équipe hors service simultanément ; aucun profil n'a de modèle de repli.
- **Clé unique** : une seule clé API `deepseek` est partagée par tous les profils. Son expiration ou sa révocation couperait l'ensemble des agents d'un coup.
- **Absence de repli** : aucun fallback provider/config n'est configuré.
