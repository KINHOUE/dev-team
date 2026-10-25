import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { HttpError } from '../lib/errors';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createExpenseSchema, updateExpenseSchema } from '../schemas/finance.schema';
import { MONTH_RE, monthBounds, parseExpenseDate } from '../lib/month';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    const where: Prisma.ExpenseWhereInput = { userId };

    const month = typeof req.query.month === 'string' ? req.query.month : undefined;
    if (month && MONTH_RE.test(month)) {
      const { start, end } = monthBounds(month);
      where.date = { gte: start, lt: end };
    }

    const categoryId =
      typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: { category: true },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: 500,
    });
    return res.json(expenses);
  } catch (err) {
    return next(err);
  }
});

router.post('/', validate(createExpenseSchema), async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    const categoryId = (req.body.categoryId as string | null | undefined) ?? null;

    if (categoryId) {
      const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
      if (!category) {
        throw new HttpError(400, 'Catégorie inconnue');
      }
    }

    const expense = await prisma.expense.create({
      data: {
        userId,
        amountCents: req.body.amountCents as number,
        date: parseExpenseDate(req.body.date as string),
        categoryId,
        note: (req.body.note as string | null | undefined) ?? null,
        source: (req.body.source as string | undefined) ?? 'manual',
      },
      include: { category: true },
    });
    return res.status(201).json(expense);
  } catch (err) {
    return next(err);
  }
});

router.put('/:id', validate(updateExpenseSchema), async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    const existing = await prisma.expense.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!existing) {
      throw new HttpError(404, 'Dépense introuvable');
    }

    const data: Prisma.ExpenseUpdateInput = {};
    if (req.body.amountCents !== undefined) data.amountCents = req.body.amountCents as number;
    if (req.body.date !== undefined) data.date = parseExpenseDate(req.body.date as string);
    if (req.body.note !== undefined) data.note = req.body.note as string | null;

    if (req.body.categoryId !== undefined) {
      const categoryId = req.body.categoryId as string | null;
      if (categoryId) {
        const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
        if (!category) {
          throw new HttpError(400, 'Catégorie inconnue');
        }
        data.category = { connect: { id: categoryId } };
      } else {
        data.category = { disconnect: true };
      }
    }

    const expense = await prisma.expense.update({
      where: { id: existing.id },
      data,
      include: { category: true },
    });
    return res.json(expense);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    const existing = await prisma.expense.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!existing) {
      throw new HttpError(404, 'Dépense introuvable');
    }
    await prisma.expense.delete({ where: { id: existing.id } });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

export default router;
