import type { NextFunction, Request, Response } from 'express';
import { corsOrigins } from '../config/env';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Défense CSRF fondée sur l'en-tête `Origin`.
 *
 * Les navigateurs envoient systématiquement `Origin` sur les requêtes cross-origin
 * à effet de bord (POST/PUT/PATCH/DELETE). Le cookie de session (SameSite=None)
 * serait sinon joint automatiquement par un site tiers malveillant. On refuse donc
 * toute requête mutante portant un `Origin` hors liste blanche lorsque
 * l'authentification repose sur le cookie (pas d'en-tête Bearer).
 *
 * - Web (`credentials: include`) : `Origin` = origine du front, présente dans
 *   CORS_ORIGINS → autorisé.
 * - Mobile (Bearer, sans cookie, sans `Origin`) → autorisé.
 * - curl / serveur à serveur (sans `Origin`) → autorisé (pas de vecteur CSRF).
 */
export function csrfOriginCheck(req: Request, res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const origin = req.headers.origin;
  if (!origin) {
    // Client non navigateur : pas de cookie ambiant → pas de CSRF.
    return next();
  }

  const authorization = req.headers.authorization;
  const isBearer = typeof authorization === 'string' && authorization.startsWith('Bearer ');
  if (isBearer) {
    // Client mobile/token : pas de cookie de session → pas de CSRF.
    return next();
  }

  if (corsOrigins.includes(origin)) {
    return next();
  }

  res.status(403).json({ error: { message: 'Origine non autorisée' } });
  return;
}
