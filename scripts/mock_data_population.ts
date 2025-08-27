import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { Pool } from 'pg';
import { config } from '../src/config/env.js';
import { ensureSchema } from '../src/services/db/init.js';

// Stage 3: Populate dev DB (10 מכל סוג, כולל Edge-cases חוקיים בלבד). :contentReference[oaicite:13]{index=13}
function randomIp() {
  // IPv4
  return [0,0,0,0].map(() => faker.number.int({ min: 1, max: 254 })).join('.');
}
function randomProtocol() { return faker.helpers.arrayElement(['tcp','udp']); }
function randomAction() { return faker.helpers.arrayElement(['allow','deny']); }

async function run() {
  const pool = new Pool({ connectionString: config.dbUri });
  await ensureSchema(pool);

  // 10 חוקים תקינים (מגוון פרוטוקולים/אקשן/פורט)
  for (let i = 0; i < 10; i++) {
    const src = randomIp();
    const dst = randomIp();
    const port = faker.number.int({ min: 1, max: 65535 });
    const protocol = randomProtocol();
    const action = randomAction();

    await pool.query(
      `INSERT INTO rules (source_ip, dest_ip, port, protocol, action)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT DO NOTHING`,
      [src, dst, port, protocol, action]
    );
  }

  await pool.end();
  console.log('✅ Mock data populated');
}

run().catch(e => { console.error(e); process.exit(1); });
