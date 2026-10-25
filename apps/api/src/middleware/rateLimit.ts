import rateLimit from 'express-rate-limit';
import { PrismaRateLimitStore } from './rateLimitStore';

const isTest = process.env.NODE_ENV === 'test';

const errorBody = (message: string) => ({ error: { message } });

/** Les préflight CORS ne doivent pas consommer de quota. */
const skipOptions = (req: { method: string }) => isTest || req.method === 'OPTIONS';

/**
 * Stores distribués (PostgreSQL) pour les routes d'authentification.
 *
 * Les limites anti force-brute (login) et anti-spam (register) doivent être
 * globales : sur Vercel, un MemoryStore serait réinitialisé par instance et un
 * attaquant contournerait la limite en multipliant les instances. On partage
 * donc un compteur atomique par clé IP+bucket dans PostgreSQL.
 */
const loginStore = new PrismaRateLimitStore(15 * 60 * 1000);
const registerStore = new PrismaRateLimitStore(60 * 60 * 1000);

/** Limiteur global : freine les abus sur toute l'API. */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: skipOptions,
  message: errorBody('Trop de requêtes. Réessayez dans quelques minutes.'),
});

/**
 * Connexion : 10 échecs par IP et par fenêtre.
 * `skipSuccessfulRequests` : une connexion réussie ne consomme pas de quota,
 * seules les tentatives ratées comptent (anti force brute).
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: skipOptions,
  store: loginStore,
  message: errorBody('Trop de tentatives de connexion. Réessayez dans 15 minutes.'),
});

/** Inscription : 5 comptes créés par heure et par IP (anti-spam). */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: skipOptions,
  store: registerStore,
  message: errorBody('Trop de créations de compte depuis cette adresse. Réessayez plus tard.'),
});
