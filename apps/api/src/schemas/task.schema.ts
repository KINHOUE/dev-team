import { z } from 'zod';

const dueAtSchema = z
  .string()
  .datetime({ offset: true, message: "Date d'échéance invalide" })
  .nullable()
  .optional();

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Le titre est requis').max(255),
  dueAt: dueAtSchema,
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1, 'Le titre est requis').max(255),
  dueAt: dueAtSchema,
});
