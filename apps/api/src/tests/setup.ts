import { resolveTestUrl } from './test-db';

// Valeurs forcées AVANT l'import de l'app (dotenv ne les écrasera pas).
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-0123456789abcdef0123456789abcdef';
process.env.JWT_EXPIRES_IN = '15m';
process.env.CORS_ORIGINS = 'http://localhost:5173,http://localhost:8081';
process.env.DATABASE_URL = resolveTestUrl();
