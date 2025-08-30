import { z } from 'zod';
import ipaddr from 'ipaddr.js';
import { parse as parseDomain, isValid as isValidDomain } from 'tldts';

const base = z.object({
  mode: z.enum(['whitelist', 'blacklist']),
  active: z.boolean().optional().default(true)
});

const ipRule = z.object({
  type: z.literal('ip'),
  value: z.string().refine(v => ipaddr.isValid(v), 'Invalid IP')
});

const cidrRule = z.object({
  type: z.literal('cidr'),
  value: z.string().refine(v => {
    try { ipaddr.parseCIDR(v); return true; } catch { return false; }
  }, 'Invalid CIDR')
});

const domainRule = z.object({
  type: z.literal('domain'),
  value: z.string().refine(v => isValidDomain(v, { allowUnicode: true }), 'Invalid domain')
});

const urlRule = z.object({
  type: z.literal('url'),
  value: z.string().refine(v => {
    try {
      const u = new URL(v);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch { return false; }
  }, 'Invalid URL (http/https only)')
});

const portRule = z.object({
  type: z.literal('port'),
  value: z.coerce.number().int().min(1).max(65535).transform(n => String(n))
});

export const ruleInputSchema = z.discriminatedUnion('type', [
  ipRule, cidrRule, domainRule, urlRule, portRule
]).and(base);

export type RuleInput = z.infer<typeof ruleInputSchema>;

export const ruleBatchSchema = z.array(ruleInputSchema).nonempty();
export const idsBatchSchema = z.object({ ids: z.array(z.number().int().positive()).nonempty() });
export const toggleSchema = z.object({ active: z.boolean() });
export const listQuerySchema = z.object({
  type: z.enum(['ip','cidr','domain','url','port']).optional(),
  mode: z.enum(['whitelist','blacklist']).optional(),
  active: z.coerce.boolean().optional()
});
