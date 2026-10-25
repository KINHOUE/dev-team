import { describe, expect, it } from 'vitest';
import { prisma } from '../lib/prisma';
import { PrismaRateLimitStore } from '../middleware/rateLimitStore';

const store = new PrismaRateLimitStore(60_000);

describe('PrismaRateLimitStore', () => {
  it('incrémente atomiquement et renvoie le compteur + resetTime', async () => {
    const key = `test-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const first = await store.increment(key);
    expect(first.totalHits).toBe(1);
    expect(first.resetTime!.getTime()).toBeGreaterThan(Date.now());

    const second = await store.increment(key);
    expect(second.totalHits).toBe(2);
    // Même fenêtre : resetTime inchangé.
    expect(second.resetTime!.getTime()).toBe(first.resetTime!.getTime());

    await store.resetKey(key);
  });

  it('réinitialise le compteur quand la fenêtre est expirée', async () => {
    const key = `expired-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const past = new Date(Date.now() - 10_000);
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 7, resetAt: past },
      update: { count: 7, resetAt: past },
    });

    const res = await store.increment(key);
    expect(res.totalHits).toBe(1); // fenêtre expirée → reset

    await store.resetKey(key);
  });

  it('décrémente le compteur (skipSuccessfulRequests)', async () => {
    const key = `dec-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await store.increment(key);
    await store.increment(key);
    await store.decrement(key);

    const row = await store.get(key);
    expect(row!.totalHits).toBe(1);

    await store.resetKey(key);
  });

  it('get renvoie undefined pour une clé inconnue', async () => {
    const row = await store.get(`inconnue-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    expect(row).toBeUndefined();
  });
});
