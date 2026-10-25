import { z } from 'zod';
import { MONTH_RE } from '../lib/month';

const monthSchema = z
  .string()
  .regex(MONTH_RE, 'Mois invalide (format AAAA-MM)');

const amountCentsSchema = z
  .number()
  .int('Le montant doit être un entier (centimes)')
  .min(0, 'Le montant ne peut pas être négatif')
  .max(2_000_000_000, 'Montant trop élevé');

const positiveAmountCentsSchema = amountCentsSchema.min(1, 'Le montant doit être positif');

const dateSchema = z
  .string()
  .refine(
    (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) || !Number.isNaN(Date.parse(v)),
    'Date invalide',
  );

const colorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Couleur invalide (format #RRGGBB)');

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis').max(60),
  icon: z.string().trim().min(1).max(40).default('tag'),
  color: colorSchema.nullable().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis').max(60).optional(),
  icon: z.string().trim().min(1).max(40).optional(),
  color: colorSchema.nullable().optional(),
});

export const createExpenseSchema = z.object({
  amountCents: positiveAmountCentsSchema,
  date: dateSchema,
  categoryId: z.string().min(1).nullable().optional(),
  note: z.string().trim().max(255).nullable().optional(),
  source: z.enum(['manual', 'voice']).default('manual'),
});

export const updateExpenseSchema = z.object({
  amountCents: positiveAmountCentsSchema.optional(),
  date: dateSchema.optional(),
  categoryId: z.string().min(1).nullable().optional(),
  note: z.string().trim().max(255).nullable().optional(),
});

export const upsertBudgetSchema = z.object({
  month: monthSchema,
  categoryId: z.string().min(1).nullable().optional(),
  amountCents: amountCentsSchema,
});

export const createForecastSchema = z.object({
  month: monthSchema,
  categoryId: z.string().min(1).nullable().optional(),
  amountCents: amountCentsSchema,
  note: z.string().trim().max(255).nullable().optional(),
});

export const updateForecastSchema = z.object({
  amountCents: amountCentsSchema.optional(),
  note: z.string().trim().max(255).nullable().optional(),
});

export const updateSettingsSchema = z.object({
  currency: z.string().trim().min(1, 'Devise requise'),
});
