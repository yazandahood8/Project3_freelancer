import { Request, Response, NextFunction } from 'express';
import { getLogger } from '../config/logger.js';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const log = getLogger();
  log.error({ err }, 'unhandled_error');
  res.status(500).json({ error: 'Internal Server Error' });
}
