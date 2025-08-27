import { Router } from 'express';
import { getRules, postRule, removeRule } from '../controllers/rules.controller.js';

const r = Router();
r.get('/', getRules);
r.post('/', postRule);
r.delete('/:id', removeRule);
export default r;
