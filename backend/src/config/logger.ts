import { createLogger, format, transports, Logger } from 'winston';
import { config } from './env.js';

// Stage 2: לוגר שונה לפי ENV + דריסה של console.*. Singleton. :contentReference[oaicite:7]{index=7}
let instance: Logger | null = null;

export function getLogger(): Logger {
  if (instance) return instance;

  const common = format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  );

  const devTransports = [new transports.Console()];
  const prodTransports = [new transports.File({ filename: config.logFile })];

  instance = createLogger({
    level: config.logLevel,
    format: common,
    transports: config.env === 'dev' ? devTransports : prodTransports
  });

  // Override console
  const map: Record<keyof Console, keyof Logger> = {
    log: 'info',
    info: 'info',
    warn: 'warn',
    error: 'error',
    debug: 'debug',
    trace: 'silly',
    assert: 'warn',
    clear: 'info',
    count: 'info',
    countReset: 'info',
    dir: 'info',
    dirxml: 'info',
    group: 'info',
    groupCollapsed: 'info',
    groupEnd: 'info',
    table: 'info',
    time: 'info',
    timeEnd: 'info',
    timeLog: 'info',
    profile: 'info',
    profileEnd: 'info',
    timeStamp: 'info'
  } as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Object.keys(map).forEach(k => {
    // @ts-expect-error narrowing
    (console as any)[k] = (...args: unknown[]) => (instance as any)[map[k as keyof Console]](args.length === 1 ? args[0] : args);
  });

  return instance;
}
