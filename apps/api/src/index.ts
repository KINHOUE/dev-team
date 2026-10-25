import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`✅ API démarrée sur http://localhost:${env.PORT} (env: ${env.NODE_ENV})`);
});
