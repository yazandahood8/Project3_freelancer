import { Router } from 'express';
import {
  getRules, postRule, postRulesBatch,
  patchRuleActive, patchRulesBatchActive,
  removeRule, removeRulesBatch
} from '../controllers/rules.controller.js';

const r = Router();

// List (with filters ?type=&mode=&active=)
r.get('/', getRules);

// Single create
r.post('/', postRule);

// Batch create
r.post('/batch', postRulesBatch);

// Toggle single
r.patch('/:id/active', patchRuleActive);

// Toggle batch
r.patch('/batch/active', patchRulesBatchActive);

// Delete single
r.delete('/:id', removeRule);

// Delete batch (DELETE body support is inconsistent => POST)
r.post('/batch/delete', removeRulesBatch);

export default r;
