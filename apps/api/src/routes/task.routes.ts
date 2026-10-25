import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { HttpError } from '../lib/errors';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(tasks);
  } catch (err) {
    return next(err);
  }
});

router.post('/', validate(createTaskSchema), async (req, res, next) => {
  try {
    const title = (req.body.title as string).trim();
    const dueAt = req.body.dueAt as string | null | undefined;
    const task = await prisma.task.create({
      data: {
        title,
        userId: req.user!.sub,
        ...(dueAt ? { dueAt: new Date(dueAt) } : {}),
      },
    });
    return res.status(201).json(task);
  } catch (err) {
    return next(err);
  }
});

router.put('/:id', validate(updateTaskSchema), async (req, res, next) => {
  try {
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user!.sub },
    });
    if (!existing) {
      throw new HttpError(404, 'Tâche introuvable');
    }
    const title = (req.body.title as string).trim();
    const dueAt = req.body.dueAt as string | null | undefined;
    const data: { title: string; dueAt?: Date | null } = { title };
    if (dueAt !== undefined) {
      data.dueAt = dueAt ? new Date(dueAt) : null;
    }
    const task = await prisma.task.update({
      where: { id: existing.id },
      data,
    });
    return res.json(task);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user!.sub },
    });
    if (!existing) {
      throw new HttpError(404, 'Tâche introuvable');
    }
    await prisma.task.delete({ where: { id: existing.id } });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

router.patch('/:id/complete', async (req, res, next) => {
  try {
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user!.sub },
    });
    if (!existing) {
      throw new HttpError(404, 'Tâche introuvable');
    }
    const task = await prisma.task.update({
      where: { id: existing.id },
      data: { done: !existing.done },
    });
    return res.json(task);
  } catch (err) {
    return next(err);
  }
});

export default router;
