import type { ClientRateLimitInfo, IncrementResponse, Store } from 'express-rate-limit';
import { prisma } from '../lib/prisma';

interface RateLimitRow {
  count: number;
  resetAt: Date;
}

/**
 * Store `express-rate-limit` adossé à PostgreSQL via Prisma (table `RateLimit`).
 *
 * - Incrément atomique par clé (IP + bucket) : un seul `INSERT … ON CONFLICT DO
 *   UPDATE` gère à la fois la création et la fenêtre glissante (réinitialisation
 *   du compteur lorsque `resetAt` est dépassé). Aucune course possible entre
 *   instances serverless, contrairement au MemoryStore.
 * - `decrement` est requis par `skipSuccessfulRequests` (un login réussi ne
 *   consomme pas de quota).
 * - `localKeys = false` signale à express-rate-limit que les clés sont partagées
 *   (détection de double comptage).
 */
export class PrismaRateLimitStore implements Store {
  readonly localKeys = false;

  private readonly windowMs: number;

  constructor(windowMs: number) {
    this.windowMs = windowMs;
  }

  async increment(key: string): Promise<IncrementResponse> {
    const now = new Date();
    const resetAt = new Date(now.getTime() + this.windowMs);

    const rows = await prisma.$queryRaw<RateLimitRow[]>`
      INSERT INTO "RateLimit" ("key", "count", "resetAt")
      VALUES (${key}, 1, ${resetAt})
      ON CONFLICT ("key") DO UPDATE SET
        "count"   = CASE WHEN "RateLimit"."resetAt" <= ${now} THEN 1 ELSE "RateLimit"."count" + 1 END,
        "resetAt" = CASE WHEN "RateLimit"."resetAt" <= ${now} THEN ${resetAt} ELSE "RateLimit"."resetAt" END
      RETURNING "count", "resetAt"
    `;

    const row = rows[0];
    return { totalHits: row.count, resetTime: row.resetAt };
  }

  async decrement(key: string): Promise<void> {
    await prisma.$executeRaw`
      UPDATE "RateLimit" SET "count" = "count" - 1 WHERE "key" = ${key}
    `;
  }

  async resetKey(key: string): Promise<void> {
    await prisma.$executeRaw`
      DELETE FROM "RateLimit" WHERE "key" = ${key}
    `;
  }

  async get(key: string): Promise<ClientRateLimitInfo | undefined> {
    const row = await prisma.rateLimit.findUnique({ where: { key } });
    if (!row) {
      return undefined;
    }
    return { totalHits: row.count, resetTime: row.resetAt };
  }
}
