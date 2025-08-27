import { Request, Response, NextFunction } from 'express';
import { ruleInputSchema } from '../types/rule.js';
import * as svc from '../services/rules.service.js';

export async function getRules(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.listRules();
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
    if (e.name === 'ZodError') return res.status(400).json({ error: e.errors });
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
