import { and, asc, eq, inArray } from 'drizzle-orm';
import { getDb } from './db/client.js';
import { rules, RuleRow } from './db/schema.js';
import type { RuleInput } from '../types/rule.js';

export async function listRules(filters?: { type?: string; mode?: string; active?: boolean }): Promise<RuleRow[]> {
  const db = await getDb();
  const where = [];
  if (filters?.type) where.push(eq(rules.type, filters.type as any));
  if (filters?.mode) where.push(eq(rules.mode, filters.mode as any));
  if (typeof filters?.active === 'boolean') where.push(eq(rules.active, filters.active));
  const rows = await db.select().from(rules).where(where.length ? and(...where) : undefined).orderBy(asc(rules.id));
  return rows;
}

export async function createRule(input: RuleInput): Promise<RuleRow> {
  const db = await getDb();
  const [row] = await db.insert(rules).values({
    value: input.value,
    type: input.type as any,
    mode: input.mode as any,
    active: input.active ?? true
  }).onConflictDoNothing({ target: [rules.value, rules.type] }).returning();
  if (!row) throw Object.assign(new Error('Duplicate rule'), { status: 409 });
  return row;
}

export async function createRulesBatch(inputs: RuleInput[]): Promise<{ created: RuleRow[]; duplicates: number }>{
  const db = await getDb();
  const values = inputs.map(i => ({
    value: i.value, type: i.type as any, mode: i.mode as any, active: i.active ?? true
  }));
  const created = await db.insert(rules).values(values)
    .onConflictDoNothing({ target: [rules.value, rules.type] })
    .returning();
  const duplicates = inputs.length - created.length;
  return { created, duplicates };
}

export async function toggleRule(id: number, active: boolean): Promise<RuleRow> {
  const db = await getDb();
  const [row] = await db.update(rules).set({ active }).where(eq(rules.id, id)).returning();
  if (!row) throw Object.assign(new Error('Rule not found'), { status: 404 });
  return row;
}

export async function toggleRulesBatch(ids: number[], active: boolean): Promise<number> {
  const db = await getDb();
  const res = await db.update(rules).set({ active }).where(inArray(rules.id, ids));
  // drizzle update returns { rowCount? } depending on driver; we can re-select:
  const affected = (await db.select().from(rules).where(inArray(rules.id, ids))).length;
  return affected;
}

export async function deleteRule(id: number): Promise<void> {
  const db = await getDb();
  const res = await db.delete(rules).where(eq(rules.id, id));
  // no row? surface 404
  const left = await db.select().from(rules).where(eq(rules.id, id));
  if (left.length) throw Object.assign(new Error('Delete failed'), { status: 500 });
}

export async function deleteRulesBatch(ids: number[]): Promise<number> {
  const db = await getDb();
  const before = await db.select({ id: rules.id }).from(rules).where(inArray(rules.id, ids));
  await db.delete(rules).where(inArray(rules.id, ids));
  return before.length;
}
