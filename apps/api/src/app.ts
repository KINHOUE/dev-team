import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import authRouter from './routes/auth.routes';
import taskRouter from './routes/task.routes';
import categoryRouter from './routes/category.routes';
import expenseRouter from './routes/expense.routes';
import budgetRouter from './routes/budget.routes';
import forecastRouter from './routes/forecast.routes';
import statsRouter from './routes/stats.routes';
import { globalLimiter } from './middleware/rateLimit';
import { csrfOriginCheck } from './middleware/csrf';
import { errorHandler, notFound } from './middleware/error';
import { corsOrigins } from './config/env';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');

  // Vercel place un proxy devant la fonction : l'IP client réelle est dans X-Forwarded-For.
  app.set('trust proxy', 1);

  // En-têtes de sécurité HTTP (HSTS, nosniff, X-Frame-Options…).
  app.use(
    helmet({
      contentSecurityPolicy: false, // l'API ne sert pas de HTML
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // appelée depuis le web
    }),
  );

  // Vercel monte la fonction serverless sous /api ; on retire ce préfixe
  // pour que les routes Express restent alignées (aucun effet en local).
  app.use((req, _res, next) => {
    if (req.url.startsWith('/api')) {
      req.url = req.url.slice('/api'.length) || '/';
    }
    next();
  });

  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Pas d'en-tête Origin (curl, serveur à serveur, supertest) → autorisé.
        // Sinon, uniquement les origines listées dans CORS_ORIGINS.
        if (!origin || corsOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      credentials: true,
    }),
  );

  app.use(globalLimiter);

  // Défense CSRF par vérification d'origine sur les méthodes à effet de bord
  // (le cookie de session est SameSite=None). Doit être monté après `cors`.
  app.use(csrfOriginCheck);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/auth', authRouter);
  app.use('/tasks', taskRouter);
  app.use('/categories', categoryRouter);
  app.use('/expenses', expenseRouter);
  app.use('/budgets', budgetRouter);
  app.use('/forecasts', forecastRouter);
  app.use('/stats', statsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
