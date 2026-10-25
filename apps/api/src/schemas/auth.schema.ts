import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().email('Email invalide').max(255),
  // bcrypt tronque au-delà de 72 octets
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Email invalide').max(255),
  password: z.string().min(1, 'Mot de passe requis').max(72),
});
