import { pgTable, serial, text, boolean, timestamp, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const ruleTypeEnum = pgEnum('rule_type', ['ip', 'cidr', 'domain', 'url', 'port']);
export const ruleModeEnum = pgEnum('rule_mode', ['whitelist', 'blacklist']);

export const rules = pgTable('rules', {
  id: serial('id').primaryKey(),
  value: text('value').notNull(),
  type: ruleTypeEnum('type').notNull(),
  mode: ruleModeEnum('mode').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: false }).notNull().defaultNow()
}, (t) => ({
  uniqValueType: uniqueIndex('uniq_value_type').on(t.value, t.type)
}));

export type RuleRow = InferSelectModel<typeof rules>;
export type RuleInsert = InferInsertModel<typeof rules>;
