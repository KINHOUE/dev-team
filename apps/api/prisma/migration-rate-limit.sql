-- Migration additive — rate limiting distribué (V-08).
-- Crée la table dédiée au store express-rate-limit adossé à PostgreSQL.
-- Aucun DROP, aucun ALTER destructif : uniquement une création de table.
CREATE TABLE "RateLimit" (
    "key"     TEXT NOT NULL,
    "count"   INTEGER NOT NULL DEFAULT 0,
    "resetAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);
