import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../lib/errors';
import { verifyToken } from '../lib/jwt';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  let token: string | undefined;

  if (header && header.startsWith('Bearer ')) {
    token = header.slice('Bearer '.length);
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new HttpError(401, 'Authentification requise'));
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return next(new HttpError(401, 'Jeton invalide ou expiré'));
  }
}
