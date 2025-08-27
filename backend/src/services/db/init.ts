import { Pool } from 'pg';

// יצירת טבלה אם לא קיימת + יוניק על קומבינציה למניעת כפילויות (Stage 3). :contentReference[oaicite:9]{index=9}
export async function ensureSchema(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rules (
      id SERIAL PRIMARY KEY,
      source_ip VARCHAR(45) NOT NULL,
      dest_ip   VARCHAR(45) NOT NULL,
      port      INTEGER NOT NULL CHECK (port >= 1 AND port <= 65535),
      protocol  VARCHAR(8) NOT NULL CHECK (protocol IN ('tcp','udp')),
      action    VARCHAR(8) NOT NULL CHECK (action IN ('allow','deny')),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE (source_ip, dest_ip, port, protocol)
    );
  `);
}
