import { Pool } from 'pg';
import { config } from '../../config/env.js';
import { getLogger } from '../../config/logger.js';
import { stopAndWait } from '../../utils/stopAndWait.js';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

let db: NodePgDatabase | null = null;
let pool: Pool | null = null;

export async function getDb(): Promise<NodePgDatabase> {
  if (db) return db;
  const log = getLogger();

  pool = await stopAndWait<Pool>(
    async () => {
      const p = new Pool({ connectionString: config.dbUri });
      await p.query('SELECT 1');
      return p;
    },
    () => true,
    config.reconnectIntervalMs,
    Infinity,
    true
  );

  db = drizzle(pool);

  // Ensures enums + table exist (non-destructive). If אתה על סכימה קודמת — נקה ידנית.
  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rule_type') THEN
        CREATE TYPE rule_type AS ENUM ('ip','cidr','domain','url','port');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rule_mode') THEN
        CREATE TYPE rule_mode AS ENUM ('whitelist','blacklist');
      END IF;
    END $$;
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS rules (
      id SERIAL PRIMARY KEY,
      value TEXT NOT NULL,
      type rule_type NOT NULL,
      mode rule_mode NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'uniq_value_type') THEN
        CREATE UNIQUE INDEX uniq_value_type ON rules (value, type);
      END IF;
    END $$;
  `);

  log.info('✅ Connected to Postgres & ensured schema');
  return db!;
}
