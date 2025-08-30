import express from 'express';
import { config } from './config/env.js';
import { getLogger } from './config/logger.js';
import api from './routes/index.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { getDb } from './services/db/client.js';

async function main() {
  const log = getLogger();
  await getDb(); // connect/ensure schema

  const app = express();
  app.use(express.json());
  app.use(requestLogger);
  app.use('/api', api);
  app.use(errorHandler);

  app.listen(config.port, () => log.info(`🚀 Server listening on :${config.port} [${config.env}]`));
}
main().catch(e => { console.error(e); process.exit(1); });
