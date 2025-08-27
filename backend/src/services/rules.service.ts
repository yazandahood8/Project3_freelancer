import { getDb } from './db/client.js';
import type { Rule } from './db/schema.js';
import type { RuleInput } from '../types/rule.js';

export async function listRules(): Promise<Rule[]> {
  const db = await getDb();
  const { rows } = await db.query('SELECT * FROM rules ORDER BY id ASC');
  return rows;
}

export async function createRule(input: RuleInput): Promise<Rule> {
  const db = await getDb();
  const { rows } = await db.query(
    `INSERT INTO rules (source_ip, dest_ip, port, protocol, action)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (source_ip, dest_ip, port, protocol) DO NOTHING
     RETURNING *`,
    [input.source_ip, input.dest_ip, input.port, input.protocol, input.action]
  );
  if (!rows[0]) {
    // כפילות
    throw Object.assign(new Error('Duplicate rule'), { status: 409 });
  }
  return rows[0];
}

export async function deleteRule(id: number): Promise<void> {
  const db = await getDb();
  const { rowCount } = await db.query('DELETE FROM rules WHERE id=$1', [id]);
  if (!rowCount) {
    throw Object.assign(new Error('Rule not found'), { status: 404 });
  }
}
