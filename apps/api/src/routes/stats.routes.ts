import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { MONTH_RE, currentMonth, lastMonths, monthBounds } from '../lib/month';

const router = Router();

router.use(requireAuth);

type CategoryStat = {
  categoryId: string | null;
  name: string;
  icon: string;
  color: string | null;
  spentCents: number;
  budgetCents: number | null;
  forecastCents: number | null;
};

/** Agrégats pour le tableau de bord du module Finances. */
router.get('/dashboard', async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    const month =
      typeof req.query.month === 'string' && MONTH_RE.test(req.query.month)
        ? req.query.month
        : currentMonth();
    const { start, end } = monthBounds(month);

    const months = lastMonths(6);
    const historyStart = monthBounds(months[0]).start;

    const [user, categories, expenses, budgets, forecasts, history] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { currency: true } }),
      prisma.category.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      prisma.expense.findMany({
        where: { userId, date: { gte: start, lt: end } },
        select: { id: true, amountCents: true, categoryId: true },
      }),
      prisma.budget.findMany({ where: { userId, month } }),
      prisma.forecast.findMany({ where: { userId, month } }),
      prisma.expense.findMany({
        where: { userId, date: { gte: historyStart, lt: end } },
        select: { amountCents: true, date: true, categoryId: true },
      }),
    ]);

    const totalSpentCents = expenses.reduce((sum, e) => sum + e.amountCents, 0);

    const spentByCategory = new Map<string, number>();
    for (const e of expenses) {
      if (e.categoryId) {
        spentByCategory.set(e.categoryId, (spentByCategory.get(e.categoryId) ?? 0) + e.amountCents);
      }
    }

    const budgetByCategory = new Map<string, number>();
    for (const b of budgets) {
      if (b.categoryId) budgetByCategory.set(b.categoryId, b.amountCents);
    }

    const forecastByCategory = new Map<string, number>();
    for (const f of forecasts) {
      if (f.categoryId) forecastByCategory.set(f.categoryId, f.amountCents);
    }

    const byCategory: CategoryStat[] = categories.map((c) => ({
      categoryId: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      spentCents: spentByCategory.get(c.id) ?? 0,
      budgetCents: budgetByCategory.get(c.id) ?? null,
      forecastCents: forecastByCategory.get(c.id) ?? null,
    }));

    const uncategorizedCents = expenses
      .filter((e) => !e.categoryId)
      .reduce((sum, e) => sum + e.amountCents, 0);

    if (uncategorizedCents > 0) {
      byCategory.push({
        categoryId: null,
        name: 'Sans catégorie',
        icon: 'tag',
        color: null,
        spentCents: uncategorizedCents,
        budgetCents: null,
        forecastCents: null,
      });
    }

    const globalBudgetCents = budgets.find((b) => b.categoryId === null)?.amountCents ?? null;

    const monthlyHistory = months.map((m) => {
      const bounds = monthBounds(m);
      const spentCents = history
        .filter((h) => h.date >= bounds.start && h.date < bounds.end)
        .reduce((sum, h) => sum + h.amountCents, 0);
      return { month: m, spentCents };
    });

    // Répartition de chaque mois par catégorie (vue « Détails » du graphique).
    const categoryById = new Map(categories.map((c) => [c.id, c]));
    const monthsDetails = months.map((m) => {
      const bounds = monthBounds(m);
      const inMonth = history.filter((h) => h.date >= bounds.start && h.date < bounds.end);

      const spentByCat = new Map<string, number>();
      for (const h of inMonth) {
        const key = h.categoryId ?? '__none__';
        spentByCat.set(key, (spentByCat.get(key) ?? 0) + h.amountCents);
      }

      const monthCategories = [...spentByCat.entries()]
        .map(([key, spentCents]) => {
          const category = key === '__none__' ? null : categoryById.get(key);
          return {
            categoryId: category?.id ?? null,
            name: category?.name ?? 'Sans catégorie',
            icon: category?.icon ?? 'tag',
            color: category?.color ?? null,
            spentCents,
          };
        })
        .sort((a, b) => b.spentCents - a.spentCents);

      return {
        month: m,
        totalCents: inMonth.reduce((sum, h) => sum + h.amountCents, 0),
        categories: monthCategories,
      };
    });

    return res.json({
      month,
      currency: user?.currency ?? 'XOF',
      expenseCount: expenses.length,
      totalSpentCents,
      budgetTotalCents: globalBudgetCents,
      remainingCents: globalBudgetCents === null ? null : globalBudgetCents - totalSpentCents,
      forecastTotalCents: forecasts.reduce((sum, f) => sum + f.amountCents, 0),
      byCategory,
      months: monthlyHistory,
      monthsDetails,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
