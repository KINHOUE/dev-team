import { Router, type Request } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { HttpError } from '../lib/errors';
import { signToken } from '../lib/jwt';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { loginSchema, registerSchema } from '../schemas/auth.schema';
import { updateSettingsSchema } from '../schemas/finance.schema';
import { isSupportedCurrency } from '../lib/currency';
import { loginLimiter, registerLimiter } from '../middleware/rateLimit';

const router = Router();

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'none' as const,
  secure: true,
  path: '/',
};

function publicUser(user: { id: string; email: string; currency: string }) {
  return { id: user.id, email: user.email, currency: user.currency };
}

/**
 * Le jeton n'est renvoyé dans le corps JSON que si le client le demande
 * explicitement (en-tête `X-Client: mobile`). Le web s'authentifie uniquement
 * via le cookie httpOnly : il ne doit jamais recevoir le jeton en clair.
 */
function wantsTokenInBody(req: Request): boolean {
  return req.headers['x-client'] === 'mobile';
}

router.post('/register', registerLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const email = req.body.email as string;
    const password = req.body.password as string;
    const normalizedEmail = email.toLowerCase();

    // Hash systématique, que l'email existe déjà ou non : égalise le temps de
    // réponse et évite une énumération d'emails par side-channel temporel.
    const passwordHash = await bcrypt.hash(password, 10);

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!existing) {
      try {
        await prisma.user.create({ data: { email: normalizedEmail, passwordHash } });
      } catch (err) {
        // Course entre le findUnique et le create : le compte existe déjà (P2002).
        if ((err as { code?: string }).code !== 'P2002') {
          throw err;
        }
      }
    }

    // Réponse identique, que le compte vienne d'être créé ou qu'il existe déjà :
    // ne révèle pas l'existence de l'email. La session est ensuite établie par
    // le client via POST /auth/login.
    return res
      .status(201)
      .json({ message: 'Inscription traitée. Connectez-vous pour continuer.' });
  } catch (err) {
    return next(err);
  }
});

router.post('/login', loginLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const email = req.body.email as string;
    const password = req.body.password as string;
    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      throw new HttpError(401, 'Email ou mot de passe incorrect');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new HttpError(401, 'Email ou mot de passe incorrect');
    }

    const token = signToken({ sub: user.id, email: user.email });
    res.cookie('token', token, COOKIE_OPTS);

    const body: { user: ReturnType<typeof publicUser>; token?: string } = {
      user: publicUser(user),
    };
    if (wantsTokenInBody(req)) {
      body.token = token;
    }
    return res.json(body);
  } catch (err) {
    return next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: { id: true, email: true, currency: true },
    });
    if (!user) {
      throw new HttpError(401, 'Session invalide');
    }
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** Réglages du compte (devise d'affichage). */
router.patch('/me', requireAuth, validate(updateSettingsSchema), async (req, res, next) => {
  try {
    const currency = (req.body.currency as string).toUpperCase();
    if (!isSupportedCurrency(currency)) {
      throw new HttpError(400, 'Devise non supportée');
    }
    const user = await prisma.user.update({
      where: { id: req.user!.sub },
      data: { currency },
      select: { id: true, email: true, currency: true },
    });
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token', COOKIE_OPTS);
  return res.status(204).send();
});

export default router;
