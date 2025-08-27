import { z } from 'zod';
import ipaddr from 'ipaddr.js';

// ולידציה ל־Rule + Zod, כולל IP/Port/Protocol/Action. Stage 3 דורש בדיקות קצה. :contentReference[oaicite:11]{index=11}
export const ruleInputSchema = z.object({
  source_ip: z.string().refine(v => ipaddr.isValid(v), 'Invalid source_ip'),
  dest_ip: z.string().refine(v => ipaddr.isValid(v), 'Invalid dest_ip'),
  port: z.number().int().min(1).max(65535),
  protocol: z.enum(['tcp', 'udp']),
  action: z.enum(['allow', 'deny'])
});

export type RuleInput = z.infer<typeof ruleInputSchema>;
