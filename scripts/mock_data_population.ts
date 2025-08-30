import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { getDb } from '../src/services/db/client.js';
import { rules } from '../src/services/db/schema.js';

function randomDom() { return faker.internet.domainName(); }
function randomUrl() { return `https://${randomDom()}/${faker.word.sample()}`; }
function randomIp() {
  return [0,0,0,0].map(() => faker.number.int({ min: 1, max: 254 })).join('.');
}
function randomCidr() {
  const base = [0,0,0,0].map(() => faker.number.int({ min: 0, max: 255 })).join('.');
  const mask = faker.number.int({ min: 8, max: 30 });
  return `${base}/${mask}`;
}

async function run() {
  const db = await getDb();

  const data = [
    { type: 'domain', value: randomDom(), mode: 'whitelist', active: true },
    { type: 'url', value: randomUrl(), mode: 'blacklist', active: true },
    { type: 'ip', value: randomIp(), mode: 'whitelist', active: true },
    { type: 'cidr', value: randomCidr(), mode: 'blacklist', active: true },
    { type: 'port', value: String(faker.number.int({min:1,max:65535})), mode: 'whitelist', active: true }
  ];

  await db.insert(rules).values(data).onConflictDoNothing({ target: [rules.value, rules.type] });

  console.log('✅ Seeded mock rules');
}
run().catch(e => { console.error(e); process.exit(1); });
