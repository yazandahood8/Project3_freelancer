import { Request, Response, NextFunction } from 'express';
import { ruleInputSchema, ruleBatchSchema, idsBatchSchema, toggleSchema, listQuerySchema } from '../types/rule.js';
import * as svc from '../services/rules.service.js';

export async function getRules(req: Request, res: Response, next: NextFunction) {
  try {
    const q = listQuerySchema.parse(req.query);
    const data = await svc.listRules(q);
    res.json(data);
  } catch (e) { next(e); }
}

export async function postRule(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = ruleInputSchema.parse(req.body);
    const created = await svc.createRule(parsed);
    res.status(201).json(created);
  } catch (e: any) {
    if (e?.status) return res.status(e.status).json({ error: e.message });
    if (e?.name === 'ZodError') return res.status(400).json({ error: e.errors });
    next(e);
  }
}

export async function postRulesBatch(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = ruleBatchSchema.parse(req.body);
    const result = await svc.createRulesBatch(parsed);
    res.status(201).json(result);
  } catch (e: any) {
    if (e?.name === 'ZodError') return res.status(400).json({ error: e.errors });
    next(e);
  }
}

export async function patchRuleActive(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    const { active } = toggleSchema.parse(req.body);
    const updated = await svc.toggleRule(id, active);
    res.json(updated);
  } catch (e: any) {
    if (e?.status) return res.status(e.status).json({ error: e.message });
    next(e);
  }
}

export async function patchRulesBatchActive(req: Request, res: Response, next: NextFunction) {
  try {
    const { ids } = idsBatchSchema.parse(req.body);
    const { active } = toggleSchema.parse(req.body);
    const affected = await svc.toggleRulesBatch(ids, active);
    res.json({ affected });
  } catch (e: any) {
    if (e?.name === 'ZodError') return res.status(400).json({ error: e.errors });
    next(e);
  }
}

export async function removeRule(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    await svc.deleteRule(id);
    res.status(204).end();
  } catch (e: any) {
    if (e?.status) return res.status(e.status).json({ error: e.message });
    next(e);
  }
}

export async function removeRulesBatch(req: Request, res: Response, next: NextFunction) {
  try {
    const { ids } = idsBatchSchema.parse(req.body);
    const removed = await svc.deleteRulesBatch(ids);
    res.json({ removed });
  } catch (e: any) {
    if (e?.name === 'ZodError') return res.status(400).json({ error: e.errors });
    next(e);
  }
}
