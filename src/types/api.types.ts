import { FastifyRequest, FastifyReply } from 'fastify';

export interface TypedRequest<T = unknown> extends FastifyRequest {
  body: T;
}

export interface TypedRequestWithParams<T = unknown, P = unknown> extends FastifyRequest {
  body: T;
  params: P;
}

export interface TypedRequestWithQuery<T = unknown, Q = unknown> extends FastifyRequest {
  body: T;
  query: Q;
}

export interface TypedRequestFull<T = unknown, P = unknown, Q = unknown> extends FastifyRequest {
  body: T;
  params: P;
  query: Q;
}

export type TypedReply = FastifyReply;

export interface RouteHandler<T = unknown, P = unknown, Q = unknown> {
  (request: TypedRequestFull<T, P, Q>, reply: TypedReply): Promise<void> | void;
}

export interface HealthCheckResponse {
  status: string;
  message: string;
  version: string;
  services: string[];
  endpoints: Record<string, string>;
  features: string[];
  timestamp: string;
}

export interface SwaggerConfig {
  routePrefix: string;
  exposeRoute: boolean;
  swagger: {
    info: {
      title: string;
      description: string;
      version: string;
    };
    host: string;
    schemes: string[];
    consumes: string[];
    produces: string[];
    tags: Array<{
      name: string;
      description: string;
    }>;
  };
}
