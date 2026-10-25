# Rapport de validation — Todo App (projet de test #1)

Date : 17 octobre 2026
Objectif : valider la pipeline multi-agents (architecte → dev → qa → devops) sur une application complète, fonctionnelle et déployable.

## Résultat global

**RÉUSSI.** La pipeline est allée au bout et le produit est en ligne, fonctionnel de bout en bout (compte → tâches → filtres → thèmes, persistant).

- Web : https://web-blond-zeta-0qhsvs6qxj.vercel.app
- API : https://api-seven-vert-95.vercel.app/api
- Base : Neon (PostgreSQL 18), projet `todo-app`

## Déroulé par agent

| # | Tâche | Agent | Résultat | Preuve |
|---|---|---|---|---|
| T1 | System design | architecte | ✅ | `docs/todo/system-design.md` (7 sections) |
| T2 | Backend API (Express + Prisma + auth) | dev-web | ✅ | 11 tests vitest + 45 cas smoke pass |
| T3 | Frontend web (Vite + React + design system) | dev-web | ✅ | build pass, UI complète |
| T4 | App mobile (Expo + design system) | dev-mobile | ✅ | typecheck + export Expo pass |
| T5 | Tests & rapport de bugs | qa | ✅ | `docs/todo/rapport-qa.md` (verdict RÉUSSI) |
| T6 | Déploiement web (Vercel) | devops | ✅ | URL réelle, HTTP 200 vérifiée |

## Points de friction rencontrés (et corrigés)

1. **Skill inconnue chez l'assignee** — T1 crashait `Unknown skill(s): multi-agent-dev-team` (skill absente du profil architecte). → Tâche recréée avec `web-mobile-dev` (présente partout).
2. **Clé Fireworks morte** — 4 profils sur `kimi-k2p6` (401). → Bascule des 4 profils sur `deepseek/deepseek-v4-pro`.
3. **Workers bloqués à tuer leurs serveurs** — `taskkill //F` (MSYS) et `process_manage kill` (timeout 420s) plantent. → Dépannage : `netstat` + `taskkill /PID <pid> /T /F` (slash simples) depuis l'orchestrateur.
4. **Vercel non connecté** — premier déploiement anonyme/temporaire. → `vercel login` (device flow), déploiement durable.
5. **SQLite → PostgreSQL** — SQLite non viable en hébergement cloud. → Neon + Prisma postgresql + `prisma db push`.
6. **Routage serverless Express** — la fonction n'était montée que sur `/api` exact. → pattern `api/index.ts` + `@vercel/node` + `routes` `dest` sans slash + middleware de suppression du préfixe `/api`.

Toutes ces leçons sont documentées dans les skills `web-mobile-dev` et `multi-agent-dev-team`.

## Corrections produit post-QA

- **Affichage des dates** : date/heure de création, de dernière modification, et date d'échéance (deadline) modifiable — avec badge « en retard ».
- **Erreurs explicites** : l'UI affiche la raison précise (« mot de passe ≥ 8 caractères », etc.) au lieu de « Données invalides ».
- **Afficher/masquer le mot de passe** : bouton œil sur connexion/inscription (prop `trailing` ajoutée au composant `Input` du design system).
- **ANO-02 (sécurité)** : JWT passé de localStorage → **cookie httpOnly** (`SameSite=None; Secure`), endpoints `/auth/me` et `/auth/logout` ajoutés, frontend en `credentials: include`.

## Vérifications finales (réelles, pas inventées)

- Cookie httpOnly posé au register (201) : `Set-Cookie: token=…; HttpOnly; Secure; SameSite=None`.
- `/auth/me` et `/tasks` répondent avec le cookie seul (aucun header `Authorization`).
- `/auth/logout` → 204 puis `/auth/me` → 401.
- CORS cross-origin : `Access-Control-Allow-Credentials: true` + origine exacte réfléchie.

## Reste à faire (hors périmètre v1)

- Publication mobile (build Expo signé / store) — le build local est validé mais non publié.
- Réinitialisation de mot de passe, notifications, upload de fichiers (hors MVP).

## Conclusion

La pipeline multi-agents est opérationnelle et reproductible. Le prochain projet pourra démarrer directement depuis le board kanban avec les acquis des skills, sans refaire les erreurs de ce premier passage.
