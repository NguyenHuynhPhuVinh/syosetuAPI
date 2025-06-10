export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface CacheConfig {
  ttl: number;
  key: string;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}

export interface LoggerConfig {
  level: string;
  prettyPrint: boolean;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface AppConfig {
  port: number;
  host: string;
  nodeEnv: string;
  apiTimeout: number;
  maxConcurrentRequests: number;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  rateLimit: RateLimitConfig;
  logger: LoggerConfig;
}

export type Environment = 'development' | 'production' | 'test' | 'staging';

export interface ErrorDetails {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}
