import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  sub: string;
  email: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): JwtPayload {
  // Épingle l'algorithme à HS256 (celui utilisé par signToken) pour empêcher
  // toute confusion d'algorithme (ex. alg=none ou RS* si le secret change un jour).
  const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  if (typeof decoded === 'string') {
    throw new Error('Jeton malformé');
  }
  return { sub: decoded.sub as string, email: decoded.email as string };
}
