import { Request, Response, NextFunction } from 'express';
import { getLogger } from '../config/logger.js';
export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  const log = getLogger();
  log.info({ method: req.method, path: req.path, query: req.query }, 'incoming_request');
  next();
}
