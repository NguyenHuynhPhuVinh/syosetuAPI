import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { createChildLogger } from '@/utils';
import { appConfig } from '@/config';

const logger = createChildLogger('ErrorHandler');

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): void => {
  logger.error({
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
    },
    request: {
      method: request.method,
      url: request.url,
      headers: request.headers,
      params: request.params,
      query: request.query,
    },
  }, 'Request error occurred');

  // Handle validation errors
  if (error.validation) {
    void reply.status(400).send({
      success: false,
      error: 'Validation failed',
      details: error.validation,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle rate limit errors
  if (error.statusCode === 429) {
    void reply.status(429).send({
      success: false,
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle not found errors
  if (error.statusCode === 404) {
    void reply.status(404).send({
      success: false,
      error: 'Not found',
      message: 'The requested resource was not found',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle timeout errors
  if (error.code === 'TIMEOUT' || error.message.includes('timeout')) {
    void reply.status(408).send({
      success: false,
      error: 'Request timeout',
      message: 'The request took too long to complete',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle generic errors
  const statusCode = error.statusCode || 500;
  const message = appConfig.nodeEnv === 'production' 
    ? 'Internal server error' 
    : error.message;

  void reply.status(statusCode).send({
    success: false,
    error: message,
    ...(appConfig.nodeEnv === 'development' && { stack: error.stack }),
    timestamp: new Date().toISOString(),
  });
};
