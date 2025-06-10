import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { sendValidationError } from '@/utils';

export const validateSchema = <T extends z.ZodSchema>(schema: T) => {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      // Validate based on what's available in the request
      const dataToValidate = {
        ...(request.params as Record<string, unknown>),
        ...(request.query as Record<string, unknown>),
        ...(request.body as Record<string, unknown>),
      };

      schema.parse(dataToValidate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(
          err => `${err.path.join('.')}: ${err.message}`
        );
        sendValidationError(reply, errors);
        return;
      }

      sendValidationError(reply, ['Validation failed']);
    }
  };
};

export const validateParams = <T extends z.ZodSchema>(schema: T) => {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      schema.parse(request.params);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(
          err => `${err.path.join('.')}: ${err.message}`
        );
        sendValidationError(reply, errors);
        return;
      }

      sendValidationError(reply, ['Parameter validation failed']);
    }
  };
};

export const validateQuery = <T extends z.ZodSchema>(schema: T) => {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      schema.parse(request.query);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(
          err => `${err.path.join('.')}: ${err.message}`
        );
        sendValidationError(reply, errors);
        return;
      }

      sendValidationError(reply, ['Query validation failed']);
    }
  };
};

export const validateBody = <T extends z.ZodSchema>(schema: T) => {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      schema.parse(request.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(
          err => `${err.path.join('.')}: ${err.message}`
        );
        sendValidationError(reply, errors);
        return;
      }

      sendValidationError(reply, ['Body validation failed']);
    }
  };
};
