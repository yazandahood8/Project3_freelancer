import { createLogger, format, transports, Logger } from 'winston';
import { config } from './env.js';

let instance: Logger | null = null;

export function getLogger(): Logger {
  if (instance) return instance;

  const common = format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  );

  instance = createLogger({
    level: config.logLevel,
    format: common,
    transports: config.env === 'dev' ? [new transports.Console()] : [new transports.File({ filename: config.logFile })]
  });

  const map: Record<keyof Console, keyof Logger> = {
    log: 'info', info: 'info', warn: 'warn', error: 'error', debug: 'debug',
    trace: 'silly', assert: 'warn', clear: 'info', count: 'info', countReset: 'info',
    dir: 'info', dirxml: 'info', group: 'info', groupCollapsed: 'info', groupEnd: 'info',
    table: 'info', time: 'info', timeEnd: 'info', timeLog: 'info', profile: 'info',
    profileEnd: 'info', timeStamp: 'info'
  } as any;

  Object.keys(map).forEach(k => {
    (console as any)[k] = (...args: unknown[]) => (instance as any)[(map as any)[k]](args.length === 1 ? args[0] : args);
  });

  return instance;
}
