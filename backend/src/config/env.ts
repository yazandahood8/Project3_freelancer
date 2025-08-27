import 'dotenv/config';
import { z } from 'zod';

// Stage 2: זיהוי/ולידציית ENV ויצוא config גמיש לפי סביבה. :contentReference[oaicite:6]{index=6}
const envSchema = z.object({
  ENV: z.enum(['dev', 'production']),
  PORT: z.coerce.number().int().min(1).max(65535),
  DATABASE_URI_DEV: z.string().url(),
  DATABASE_URI_PROD: z.string().url(),
  DB_CONNECTION_INTERVAL: z.coerce.number().int().min(500).max(60000).default(2000),
  LOG_FILE: z.string().default('./logs/app.log')
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data.ENV;
export const config = {
  env,
  port: parsed.data.PORT,
  dbUri: env === 'dev' ? parsed.data.DATABASE_URI_DEV : parsed.data.DATABASE_URI_PROD,
  reconnectIntervalMs: parsed.data.DB_CONNECTION_INTERVAL,
  logFile: parsed.data.LOG_FILE,
  logLevel: env === 'dev' ? 'debug' : 'info'
} as const;

export type AppConfig = typeof config;
