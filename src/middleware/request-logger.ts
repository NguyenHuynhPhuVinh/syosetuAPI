import { FastifyRequest, FastifyReply } from 'fastify';
import { createChildLogger } from '@/utils';

const logger = createChildLogger('RequestLogger');

export const requestLogger = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const start = Date.now();

  // Log incoming request
  logger.info(
    {
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      params: request.params,
      query: request.query,
    },
    'Incoming request'
  );

  // Add response time logging
  reply.raw.on('finish', () => {
    const duration = Date.now() - start;

    logger.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        duration: `${duration}ms`,
        ip: request.ip,
      },
      'Request completed'
    );
  });
};
