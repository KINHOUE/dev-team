import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { HttpError } from '../lib/errors';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCategorySchema, updateCategorySchema } from '../schemas/finance.schema';
import { DEFAULT_CATEGORIES } from '../lib/defaults';

const router = Router();

router.use(requireAuth);

/** Crée les catégories par défaut au premier accès (comptes neufs ou antérieurs au module). */
async function ensureDefaults(userId: string): Promise<void> {
  const count = await prisma.category.count({ where: { userId } });
  if (count === 0) {
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((c) => ({ userId, name: c.name, icon: c.icon })),
      skipDuplicates: true,
    });
  }
}

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    await ensureDefaults(userId);
    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return res.json(categories);
  } catch (err) {
    return next(err);
  }
});

router.post('/', validate(createCategorySchema), async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    try {
      const category = await prisma.category.create({
        data: {
          userId,
          name: (req.body.name as string).trim(),
          icon: (req.body.icon as string | undefined) ?? 'tag',
          color: (req.body.color as string | null | undefined) ?? null,
        },
      });
      return res.status(201).json(category);
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'P2002') {
        throw new HttpError(409, 'Une catégorie porte déjà ce nom');
      }
      throw err;
    }
  } catch (err) {
    return next(err);
  }
});

router.put('/:id', validate(updateCategorySchema), async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    const existing = await prisma.category.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!existing) {
      throw new HttpError(404, 'Catégorie introuvable');
    }
    const data: { name?: string; icon?: string; color?: string | null } = {};
    if (req.body.name !== undefined) data.name = (req.body.name as string).trim();
    if (req.body.icon !== undefined) data.icon = req.body.icon as string;
    if (req.body.color !== undefined) data.color = req.body.color as string | null;

    try {
      const category = await prisma.category.update({ where: { id: existing.id }, data });
      return res.json(category);
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'P2002') {
        throw new HttpError(409, 'Une catégorie porte déjà ce nom');
      }
      throw err;
    }
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    const existing = await prisma.category.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!existing) {
      throw new HttpError(404, 'Catégorie introuvable');
    }
    // Les dépenses de cette catégorie sont conservées, rattachées à « sans catégorie ».
    await prisma.category.delete({ where: { id: existing.id } });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

export default router;
