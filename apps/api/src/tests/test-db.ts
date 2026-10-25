import 'dotenv/config';

/**
 * URL de la base de test. Priorité : TEST_DATABASE_URL explicite.
 * Sinon, on dérive « neondb_test » depuis l'URL PostgreSQL de développement.
 * Garde-fou : on refuse d'utiliser la base de production.
 */
export function resolveTestUrl(): string {
  const productionUrl = process.env.DATABASE_URL ?? '';
  const testUrl =
    process.env.TEST_DATABASE_URL ||
    productionUrl.replace(/\/neondb(\?|$)/, '/neondb_test$1');

  if (!testUrl || testUrl === productionUrl) {
    throw new Error(
      'Base de test introuvable : définissez TEST_DATABASE_URL (jamais la base de production).',
    );
  }
  return testUrl;
}
