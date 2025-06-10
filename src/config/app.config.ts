import { AppConfig, Environment } from '@/types';
import { envSchema } from './env.schema';

const env = envSchema.parse(process.env);

export const appConfig: AppConfig = {
  port: env.PORT,
  host: env.HOST,
  nodeEnv: env.NODE_ENV as Environment,
  apiTimeout: env.API_TIMEOUT,
  maxConcurrentRequests: env.MAX_CONCURRENT_REQUESTS,
  cors: {
    origin: env.CORS_ORIGIN === '*' ? ['*'] : env.CORS_ORIGIN.split(','),
    credentials: env.CORS_CREDENTIALS,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    message: 'Quá nhiều requests, vui lòng thử lại sau',
  },
  logger: {
    level: env.LOG_LEVEL,
    prettyPrint: env.LOG_PRETTY_PRINT && env.NODE_ENV === 'development',
  },
};

export const cacheConfig = {
  metadata: {
    ttl: env.METADATA_CACHE_TTL,
  },
  content: {
    ttl: env.CONTENT_CACHE_TTL,
  },
};

export const puppeteerConfig = {
  skipChromiumDownload: env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD,
  executablePath: env.PUPPETEER_EXECUTABLE_PATH,
  launchOptions: {
    headless: 'new' as const,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
    ],
  },
};

export const syosetuConfig = {
  apiBaseUrl: env.SYOSETU_API_BASE_URL,
  ncodeBaseUrl: env.SYOSETU_NCODE_BASE_URL,
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  requestTimeout: env.API_TIMEOUT,
  minRequestInterval: 1000, // 1 second between requests
};

export const rateLimitConfig = {
  api: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    message: {
      success: false,
      error: 'Quá nhiều requests, vui lòng thử lại sau 15 phút',
    },
  },
  content: {
    windowMs: env.CONTENT_RATE_LIMIT_WINDOW_MS,
    max: env.CONTENT_RATE_LIMIT_MAX,
    message: {
      success: false,
      error: 'Quá nhiều requests lấy nội dung, vui lòng thử lại sau 5 phút',
    },
  },
};
