# Politique de sécurité

## Signaler une vulnérabilité

Si tu découvres une faille dans ce projet, **ne crée pas d'issue publique**.

Contacte-moi directement :

- GitHub : [@KINHOUE](https://github.com/KINHOUE) — via un message privé
- Ou ouvre un [avis de sécurité privé](https://docs.github.com/fr/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability)

Merci d'inclure :
- la nature de la faille
- les étapes de reproduction
- l'impact estimé

Je réponds sous 72 h.

## Périmètre

| Composant | Concerné |
|---|---|
| API (`apps/api`) | oui |
| Web (`apps/web`) | oui |
| Mobile (`apps/mobile`) | oui |
| Dépendances tierces | signaler la CVE |

## Hors périmètre

- Déni de service par surcharge volontaire
- Ingénierie sociale
- Failles nécessitant un accès physique à la machine

## Ce qui est déjà en place

- Mots de passe hachés avec bcrypt
- JWT HS256 épinglé, stocké en cookie `httpOnly`
- Validation des entrées côté serveur (Zod)
- Rate limiting distribué sur PostgreSQL
- Vérification d'origine (anti-CSRF)
- Requêtes SQL paramétrées via Prisma
- Aucun secret versionné (seuls les `.env.example`)

## Versions supportées

Le projet est en développement actif : seule la dernière version de la branche `main` reçoit des correctifs.
