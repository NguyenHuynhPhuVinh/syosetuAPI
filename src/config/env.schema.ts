import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test', 'staging'])
    .default('development'),
  PORT: z.string().transform(Number).default('3000'),
  HOST: z.string().default('0.0.0.0'),

  // API Settings
  API_TIMEOUT: z.string().transform(Number).default('30000'),
  MAX_CONCURRENT_REQUESTS: z.string().transform(Number).default('5'),

  // Scraper Settings
  SCRAPER_RETRIES: z.string().transform(Number).default('3'),
  SCRAPER_RETRY_DELAY: z.string().transform(Number).default('1000'),

  // CORS Settings
  CORS_ORIGIN: z.string().default('*'),
  CORS_CREDENTIALS: z
    .string()
    .transform(val => val === 'true')
    .default('true'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  CONTENT_RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('300000'), // 5 minutes
  CONTENT_RATE_LIMIT_MAX: z.string().transform(Number).default('20'),

  // Logging
  LOG_LEVEL: z.string().default('info'),
  LOG_PRETTY_PRINT: z
    .string()
    .transform(val => val === 'true')
    .default('true'),

  // Cache Settings
  METADATA_CACHE_TTL: z.string().transform(Number).default('600'), // 10 minutes
  CONTENT_CACHE_TTL: z.string().transform(Number).default('3600'), // 1 hour

  // External APIs
  SYOSETU_API_BASE_URL: z
    .string()
    .default('https://api.syosetu.com/novelapi/api/'),
  SYOSETU_NCODE_BASE_URL: z.string().default('https://ncode.syosetu.com'),
});

export type EnvConfig = z.infer<typeof envSchema>;
