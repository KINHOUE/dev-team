import { execSync } from 'node:child_process';
import { resolveTestUrl } from './test-db';

/** Exécuté UNE seule fois par Vitest, avant tous les fichiers de test. */
export default function globalSetup(): void {
  const testUrl = resolveTestUrl();
  execSync('npx prisma db push --force-reset --skip-generate', {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: testUrl },
    stdio: 'inherit',
  });
}
