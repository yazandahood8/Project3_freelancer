import { Pool } from 'pg';
import { config } from '../../config/env.js';
import { getLogger } from '../../config/logger.js';
import { stopAndWait } from '../../utils/stopAndWait.js';
import { ensureSchema } from './init.js';

// Singleton DB client + Stop-and-Wait (Stage 2) + לוגים. :contentReference[oaicite:10]{index=10}
let pool: Pool | null = null;

export async function getDb(): Promise<Pool> {
  if (pool) return pool;
  const log = getLogger();

  pool = await stopAndWait<Pool>(
    async () => {
      const p = new Pool({ connectionString: config.dbUri });
      // בדיקת חיבור
      await p.query('SELECT 1');
      await ensureSchema(p);
      log.info('✅ Connected to Postgres');
      return p;
    },
    // retry on any error
    () => true,
    config.reconnectIntervalMs,
    Infinity,
    true // enable exponential backoff [optional]
  );

  return pool;
}
