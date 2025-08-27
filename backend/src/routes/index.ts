import { Router } from 'express';
import rules from './rules.routes.js';

const api = Router();
api.use('/rules', rules);
export default api;
