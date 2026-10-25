import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../lib/errors';

export function notFound(req: Request, _res: Response, next: NextFunction) {
  return next(new HttpError(404, `Route introuvable : ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
  }

  // Violation d'unicité Prisma (P2002) → conflit
  const code = (err as { code?: string })?.code;
  if (code === 'P2002') {
    return res.status(409).json({ error: { message: 'Conflit : ressource déjà existante' } });
  }

  // eslint-disable-next-line no-console
  console.error('[erreur non gérée]', err);
  return res.status(500).json({ error: { message: 'Erreur interne du serveur' } });
}
