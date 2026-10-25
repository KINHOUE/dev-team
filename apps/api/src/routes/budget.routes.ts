import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { HttpError } from '../lib/errors';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { upsertBudgetSchema } from '../schemas/finance.schema';
import { MONTH_RE, currentMonth } from '../lib/month';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    const month = typeof req.query.month === 'string' && MONTH_RE.test(req.query.month)
      ? req.query.month
      : currentMonth();

    const budgets = await prisma.budget.findMany({
      where: { userId, month },
      include: { category: true },
      orderBy: { createdAt: 'asc' },
    });

    return res.json({
      month,
      global: budgets.find((b) => b.categoryId === null) ?? null,
      categories: budgets.filter((b) => b.categoryId !== null),
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * Upsert d'un budget (global si categoryId absent/null, sinon par catégorie).
 * L'unicité (userId, month, categoryId) est appliquée en code car les NULL
 * ne sont pas dédupliqués par un index unique PostgreSQL.
 */
router.put('/', validate(upsertBudgetSchema), async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    const month = req.body.month as string;
    const categoryId = (req.body.categoryId as string | null | undefined) ?? null;
    const amountCents = req.body.amountCents as number;

    if (categoryId) {
      const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
      if (!category) {
        throw new HttpError(400, 'Catégorie inconnue');
      }
    }

    const existing = await prisma.budget.findFirst({
      where: { userId, month, categoryId },
    });

    const budget = existing
      ? await prisma.budget.update({
          where: { id: existing.id },
          data: { amountCents },
          include: { category: true },
        })
      : await prisma.budget.create({
          data: { userId, month, categoryId, amountCents },
          include: { category: true },
        });

    return res.json(budget);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    const existing = await prisma.budget.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!existing) {
      throw new HttpError(404, 'Budget introuvable');
    }
    await prisma.budget.delete({ where: { id: existing.id } });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

export default router;
