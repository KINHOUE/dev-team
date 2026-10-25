import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { HttpError } from '../lib/errors';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createForecastSchema, updateForecastSchema } from '../schemas/finance.schema';
import { MONTH_RE, currentMonth } from '../lib/month';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    const month = typeof req.query.month === 'string' && MONTH_RE.test(req.query.month)
      ? req.query.month
      : currentMonth();

    const forecasts = await prisma.forecast.findMany({
      where: { userId, month },
      include: { category: true },
      orderBy: { createdAt: 'asc' },
    });
    return res.json({ month, forecasts });
  } catch (err) {
    return next(err);
  }
});

router.post('/', validate(createForecastSchema), async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    const categoryId = (req.body.categoryId as string | null | undefined) ?? null;

    if (categoryId) {
      const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
      if (!category) {
        throw new HttpError(400, 'Catégorie inconnue');
      }
    }

    const forecast = await prisma.forecast.create({
      data: {
        userId,
        month: req.body.month as string,
        categoryId,
        amountCents: req.body.amountCents as number,
        note: (req.body.note as string | null | undefined) ?? null,
      },
      include: { category: true },
    });
    return res.status(201).json(forecast);
  } catch (err) {
    return next(err);
  }
});

router.put('/:id', validate(updateForecastSchema), async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    const existing = await prisma.forecast.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!existing) {
      throw new HttpError(404, 'Prévision introuvable');
    }

    const data: { amountCents?: number; note?: string | null } = {};
    if (req.body.amountCents !== undefined) data.amountCents = req.body.amountCents as number;
    if (req.body.note !== undefined) data.note = req.body.note as string | null;

    const forecast = await prisma.forecast.update({
      where: { id: existing.id },
      data,
      include: { category: true },
    });
    return res.json(forecast);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    const existing = await prisma.forecast.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!existing) {
      throw new HttpError(404, 'Prévision introuvable');
    }
    await prisma.forecast.delete({ where: { id: existing.id } });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

export default router;
