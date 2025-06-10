import Fastify, { FastifyInstance } from 'fastify';
import { appConfig, swaggerConfig } from '@/config';
import { errorHandler, requestLogger } from '@/middleware';
import { healthRoutes, syosetuRoutes } from '@/routes';

export async function createApp(): Promise<FastifyInstance> {
  // Create Fastify instance with logger
  const fastify = Fastify({
    logger: {
      level: appConfig.logger.level,
      ...(appConfig.logger.prettyPrint && {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }),
    },
    trustProxy: true,
    disableRequestLogging: false,
  });

  // Register error handler
  fastify.setErrorHandler(errorHandler);

  // Register request logger
  fastify.addHook('preHandler', requestLogger);

  // Register CORS
  await fastify.register(import('@fastify/cors'), {
    origin: appConfig.cors.origin,
    credentials: appConfig.cors.credentials,
  });

  // Register Helmet for security
  await fastify.register(import('@fastify/helmet'), {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  });

  // Register Swagger for API documentation
  await fastify.register(require('@fastify/swagger'), swaggerConfig.swagger);
  await fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: swaggerConfig.routePrefix,
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header: string) => header,
  });

  // Register routes
  await fastify.register(healthRoutes);
  await fastify.register(syosetuRoutes);

  // 404 handler
  fastify.setNotFoundHandler(async (request, reply) => {
    await reply.status(404).send({
      success: false,
      error: 'Endpoint không tồn tại',
      message: `Không tìm thấy ${request.method} ${request.url}`,
      timestamp: new Date().toISOString(),
    });
  });

  return fastify;
}

export default createApp;
