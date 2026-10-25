# SaaS d'agents IA — Architecture & plan du MVP

Date : 25 octobre 2026
Statut : proposition à valider avant développement

---

## 1. Positionnement

**Promesse** : « Décris ta tâche. Un agent s'en occupe. »

Un service web où n'importe qui — sans compétence technique — décrit ce qu'il veut et reçoit un résultat produit par un agent spécialisé.

**Public** : tous ceux qui en ont besoin (commerçants, freelances, créateurs, petites entreprises).

**Conséquence sur l'interface** : pas de « prompt », pas de « tokens », pas de « modèle ». Un formulaire simple : *que veux-tu faire ?* → résultat.

---

## 2. Quel agent exposer en premier

**Recommandation : l'agent Marketing (contenu).**

| Critère | Marketing | dev-web |
|---|---|---|
| Risque de sécurité | **Faible** (texte uniquement) | Élevé (exécute du code) |
| Résultat visible | Immédiat | Après build |
| Largeur du public | **Très large** | Techniques |
| Coût par tâche | ~0,05 $ | ~0,20 $ |
| Complexité d'isolation | Simple | Sandbox obligatoire |

L'agent marketing ne touche ni au terminal, ni aux fichiers : il **produit du texte**. C'est le seul candidat raisonnable pour un premier lancement public.

Ensuite : `dev-web` (phase 2, avec sandbox), puis `finance` (ton app existante comme démonstration).

---

## 3. Offre commerciale

| Plan | Prix | Quota | Cible |
|---|---|---|---|
| **Essai** | 0 € | 5 tâches, sans carte bancaire | découverte |
| **Starter** | 9 €/mois | 30 tâches/mois | artisan, indépendant |
| **Pro** | 19 €/mois | 150 tâches/mois | petite entreprise |
| **Business** | 39 €/mois | 500 tâches/mois | agence |

**Rentabilité** : une tâche coûte ~0,05 $ en LLM. Le plan Starter (9 €) couvre 30 tâches (~1,50 $) → marge > 80 %.
L'essai gratuit coûte 5 × 0,05 $ = **0,25 $ par inscrit** — soutenable.

---

## 4. Architecture technique

```
   Navigateur
       │
       ▼
┌──────────────────┐
│  Frontend        │  Next.js (ou Vite + React)
│  inscription     │  - formulaire de tâche
│  dashboard       │  - historique, quota restant
│  résultats       │  - page d'abonnement
└────────┬─────────┘
         │ HTTPS
         ▼
┌──────────────────┐
│  API SaaS        │  Express + TypeScript
│  ├─ Auth         │  JWT + bcrypt
│  ├─ Billing      │  Stripe Checkout + webhooks
│  ├─ Quotas       │  compteur par utilisateur/mois
│  └─ Jobs         │  file de tâches (table Postgres)
└────────┬─────────┘
         │ (asynchrone)
         ▼
┌──────────────────┐
│  Worker          │  processus séparé
│  consomme la file│  lance : hermes -p marketing chat -q "..." --oneshot
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  PostgreSQL      │  users, subscriptions, jobs, usage
└──────────────────┘
```

### Pourquoi asynchrone

Une tâche d'agent prend 20 s à 3 min. Un HTTP synchrone expire. Donc :
1. le client poste la tâche → **202 + job_id**
2. le frontend interroge le statut (polling 2 s)
3. le worker exécute et écrit le résultat en base
4. le frontend affiche le résultat

### Pourquoi réutiliser l'existant

Le monorepo `dev-team` contient déjà : Express + Prisma + PostgreSQL + JWT + bcrypt + design system + déploiement Vercel. On réutilise tout — seul le worker est nouveau.

---

## 5. Modèle de données

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String?
  plan         String   @default("trial")   // trial | starter | pro | business
  trialUsed    Int      @default(0)
  quotaUsed    Int      @default(0)         // remis à zéro chaque mois
  quotaResetAt DateTime
  stripeCustomerId String?
  createdAt    DateTime @default(now())
  jobs         Job[]
}

model Job {
  id         String   @id @default(cuid())
  userId     String
  agent      String                        // marketing | dev-web | ...
  input      String                        // ce que le client demande
  status     String   @default("queued")   // queued | running | done | failed
  output     String?                       // résultat produit
  error      String?
  costCents  Int      @default(0)
  startedAt  DateTime?
  endedAt    DateTime?
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id])
}

model Subscription {
  id               String   @id @default(cuid())
  userId           String   @unique
  stripeSessionId  String?
  status           String   // active | canceled | past_due
  currentPeriodEnd DateTime?
}

model UsageLog {
  id        String   @id @default(cuid())
  userId    String
  jobId     String?
  action    String   // job_started | job_completed | quota_blocked
  createdAt DateTime @default(now())
}
```

---

## 6. Parcours utilisateur

1. **Arrivée** → page simple : « Que veux-tu créer ? » + bouton *Essayer gratuitement*
2. **Inscription** → email + mot de passe (ou Google). 5 tâches offertes, sans carte.
3. **Première tâche** → formulaire guidé (type de contenu, sujet, ton, langue) → *Lancer*
4. **Attente** → barre de progression (30 s-2 min)
5. **Résultat** → texte affiché, bouton *Copier* / *Télécharger*
6. **Quota épuisé** → page d'abonnement (Stripe Checkout)
7. **Abonné** → dashboard avec historique, quota restant, factures

---

## 7. Sécurité — points non négociables

| Risque | Mesure |
|---|---|
| Un client exécute des commandes | Agent marketing **sans outils** (texte seul). Aucun accès terminal. |
| Un client voit les tâches d'un autre | Chaque requête filtrée par `userId` (vérifié côté serveur, jamais côté client) |
| Abus / spam | Rate limiting par IP + par compte, quota strict |
| Fuite de secrets | Clés uniquement en `.env` serveur, jamais dans le frontend |
| Injection dans le prompt | Entrée utilisateur encadrée, longueur limitée, pas de concaténation de consignes système |
| Paiement frauduleux | Stripe gère (PCI), webhooks signés et vérifiés |

**Phase 2 obligatoire avant d'exposer `dev-web`** : conteneur Docker isolé par tâche (pas d'accès réseau, pas d'accès aux fichiers de l'hôte).

---

## 8. Coûts d'exploitation

| Poste | Coût mensuel |
|---|---|
| VPS Hetzner CX32 (4 vCPU, 8 Go) | ~8 € |
| PostgreSQL (inclus sur le VPS) | 0 € |
| Stripe | 2,9 % + 0,30 € par transaction |
| LLM (30 tâches/utilisateur Starter) | ~1,50 $ par abonné |
| Domaine | ~1 € (12 €/an) |

**Seuil de rentabilité : 1 abonné Starter.** À partir du 2e, c'est du bénéfice net.

---

## 9. Roadmap

### Phase 1 — MVP (2-3 semaines)
- [ ] Base de données + auth (inscription, login, JWT)
- [ ] Intégration Stripe (essai, 3 plans, webhooks)
- [ ] Formulaire de tâche + file de jobs
- [ ] Worker exécutant l'agent marketing
- [ ] Dashboard : historique, quota
- [ ] Déploiement VPS + domaine + HTTPS

**Livrable** : un client s'inscrit, fait 5 tâches gratuites, peut s'abonner et continuer.

### Phase 2 — Multi-agents (2 semaines)
- [ ] Choix de l'agent à l'inscription
- [ ] Ajout de `dev-web` **avec sandbox Docker**
- [ ] Page tarifs publique, FAQ
- [ ] Emails transactionnels (bienvenue, facture)

### Phase 3 — Industrialisation (3-4 semaines)
- [ ] Isolation forte par client (conteneur dédié)
- [ ] API publique pour intégrations
- [ ] Équipes / sièges multiples
- [ ] Tableau de bord d'usage et analytics

---

## 10. Décisions à valider

| # | Question | Proposition par défaut |
|---|---|---|
| 1 | Agent du lancement | **Marketing (contenu)** |
| 2 | Prix | **9 / 19 / 39 €** |
| 3 | Essai | **5 tâches, sans carte** |
| 4 | Nom du service | à trouver |
| 5 | Techno | **Next.js** (frontend + API) ou réutiliser Express + Vite du monorepo ? |
| 6 | Auth sociale | email/mot de passe seulement au départ, Google en phase 2 |

---

## 11. Ce qui peut faire échouer le projet

1. **Exposer un agent avec accès terminal** sans sandbox → faille majeure. Ne jamais faire.
2. **Essai gratuit sans quota** → facture LLM incontrôlée.
3. **Interface technique** → le grand public décroche. Un formulaire, pas un prompt.
4. **Promettre l'infini** → les agents sont bons sur des tâches cadrées, pas sur « fais-moi un site entier ».
5. **Négliger le support** → un agent qui échoue sans explication = client perdu et remboursé.
