# AGENTS.md — Règles partagées de l'équipe dev

Ce fichier est lu automatiquement par **tous les agents** de l'équipe à chaque session.
C'est la source unique des conventions de **travail**.

- L'identité individuelle (rôle, mission, ton) vit dans le `SOUL.md` de chaque profil.
- La spec produit d'un projet vit dans `docs/`.
- Les procédures métier vivent dans les skills (`web-mobile-dev`, …).

## 1. Stack (référence unique)

| Domaine | Choix |
|---|---|
| Web | Vite + React + TypeScript + Tailwind CSS |
| Mobile | React Native + Expo (builds via EAS) |
| Backend | Node.js (Express) ou Next.js (API routes / Server Actions), TypeScript |
| Base de données | PostgreSQL + Prisma (SQLite en dev) ; Supabase/Firebase pour le léger |
| Authentification | JWT + bcrypt (ou Supabase Auth) |
| Cartes | Leaflet / OpenStreetMap — **jamais** de clé Google Maps |
| Déploiement | Vercel/Netlify (web), Expo EAS (mobile), Railway/Render (backend) |

## 2. Structure du monorepo

```
dev-team/
├── apps/
│   ├── web/            # application web (Vite + React)
│   └── mobile/         # application mobile (React Native + Expo)
├── packages/
│   └── design-system/  # design system partagé (tokens + composants + thèmes)
├── docs/               # specs produit, architecture, notes
└── AGENTS.md           # ce fichier
```

## 3. Design system (obligatoire)

- Utiliser **`@dev-team/design-system`** pour tout composant et toute couleur.
- **Jamais de couleur, espacement, rayon ou police en dur** dans une app : uniquement les rôles sémantiques (`background`, `surface`, `text`, `accent`, `success`…).
- Thèmes : `dark`, `light`, `ocean`, `forest`, `sunset`, `rose`, `violet`. Un projet choisit le sien, ou en définit un via `resolveTheme({ mode, accent, overrides })`.
- Toute nouvelle valeur de style s'ajoute d'abord dans `packages/design-system/src/tokens/`, jamais dans un composant.

## 4. Conventions de code

- TypeScript strict, composants séparés (un rôle par fichier), SVG custom (pas de banques d'icônes à clé).
- Nommage : composants en `PascalCase`, fonctions/variables en `camelCase`, fichiers de composants en `PascalCase.tsx`.
- Pas de fonctionnalité inutile ; pas de code mort ; pas de `any` non justifié.
- Le code est propre, lisible et maintenable — le prochain agent doit le comprendre sans explication.

## 5. Git

- Branches courtes et ciblées ; commits atomiques avec message clair (`feat:`, `fix:`, `refactor:`, `docs:`).
- Une fonctionnalité = une branche = une PR relue avant merge.
- **Jamais** de secret, `.env`, clé ou token commité. `.env` est dans `.gitignore`.

## 6. Sécurité (non négociable)

- Valider toutes les entrées côté serveur (jamais confiance au client).
- Requêtes SQL paramétrées via Prisma (anti-injection).
- Mots de passe hachés (bcrypt/argon2), jamais en clair.
- Secrets uniquement dans `.env` ; JWT courte durée + refresh ; cookies httpOnly ; CORS limité ; rate limiting ; en-têtes de sécurité (helmet).
- Toute API publique est soumise à l'audit `secu` avant déploiement (voir §9).

## 7. Tests

- Tester avant de déclarer un travail terminé.
- **Ne jamais inventer** un résultat de test, de build ou de déploiement.
- Preuves vérifiables à chaque livraison : fichiers modifiés, résultats de tests, captures, lien de déploiement réel.

## 8. Interdits permanents

- Ne jamais référencer ni réutiliser l'ancien projet « Chez Tata Ivoire » (couleurs, carte resto, api.cvlynk.com) — supprimé à la demande de l'utilisateur.
- Aucune clé Google Maps (toujours Leaflet/OpenStreetMap).
- Aucun outil payant imposé (After Effects → Remotion/FFmpeg ; Burp → semgrep ; Google Ads → alternatives).
- Aucune action irréversible (suppression de données, déploiement en production, paiement) sans autorisation explicite de l'humain.

## 9. Workflow (kanban)

- L'orchestrateur découpe le projet en tâches sur le board kanban et les assigne aux profils (architecte, dev-web, dev-mobile, qa, devops…).
- Un agent = un profil Hermes + un skill métier.
- Ordre type : **architecte (system design) → dev-web / dev-mobile → qa → secu (audit) → devops (déploiement)**.
- **L'étape `secu` est obligatoire avant tout déploiement en production** : audit (semgrep + `npm audit`), correction des failles critiques/élevées, rapport dans `docs/`. Aucun projet ne passe en production sans ce passage — même un « petit » projet.
- Si une tâche est bloquée : expliquer le blocage, ce qui manque, la prochaine étape — ne jamais prétendre qu'elle est terminée.

## 10. Définition de « terminé »

Une tâche est terminée quand **tous** ces points sont vrais :
1. Les fonctionnalités demandées sont présentes et testées (preuves fournies).
2. Le code compile / build sans erreur.
3. Les bugs bloquants sont corrigés.
4. Le design system est respecté (aucune couleur en dur).
5. La sécurité est vérifiée : entrées validées, aucun secret commité, **audit du profil `secu` effectué** (semgrep + `npm audit`) et failles critiques/élevées corrigées.
6. Les limitations restantes sont signalées explicitement.

## 11. Communication

- Répondre en français, de façon directe et sans remplissage.
- Adapter la longueur de la réponse au poids de la demande.
