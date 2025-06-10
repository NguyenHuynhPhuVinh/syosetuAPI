import { FastifyReply } from 'fastify';
import { ApiResponse } from '@/types';

export const sendSuccess = <T>(
  reply: FastifyReply,
  data: T,
  message?: string,
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
    timestamp: new Date().toISOString(),
  };

  void reply.status(statusCode).send(response);
};

export const sendError = (
  reply: FastifyReply,
  error: string,
  statusCode: number = 500,
  details?: Record<string, unknown>
): void => {
  const response: ApiResponse = {
    success: false,
    error,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
  };

  void reply.status(statusCode).send(response);
};

export const sendValidationError = (
  reply: FastifyReply,
  errors: string[]
): void => {
  sendError(reply, 'Validation failed', 400, { validationErrors: errors });
};

export const sendNotFound = (
  reply: FastifyReply,
  resource: string = 'Resource'
): void => {
  sendError(reply, `${resource} not found`, 404);
};

export const sendInternalError = (
  reply: FastifyReply,
  message: string = 'Internal server error'
): void => {
  sendError(reply, message, 500);
};
