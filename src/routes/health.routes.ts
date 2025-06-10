import { FastifyInstance } from 'fastify';
import { healthController } from '@/controllers';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  // Basic health check
  fastify.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'Basic health check',
        description: 'Returns basic health status of the API',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  status: { type: 'string' },
                  message: { type: 'string' },
                  version: { type: 'string' },
                  services: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  endpoints: { type: 'object' },
                  features: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  timestamp: { type: 'string' },
                },
              },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    healthController.getHealth.bind(healthController)
  );

  // API health check (alternative endpoint)
  fastify.get(
    '/api/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'API health check',
        description:
          'Returns basic health status of the API (alternative endpoint)',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  status: { type: 'string' },
                  message: { type: 'string' },
                  version: { type: 'string' },
                  services: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  endpoints: { type: 'object' },
                  features: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  timestamp: { type: 'string' },
                },
              },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    healthController.getHealth.bind(healthController)
  );

  // Detailed status check
  fastify.get(
    '/api/syosetu/status',
    {
      schema: {
        tags: ['Health'],
        summary: 'Detailed service status',
        description:
          'Returns detailed status including cache stats and browser status',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  status: { type: 'string' },
                  message: { type: 'string' },
                  version: { type: 'string' },
                  timestamp: { type: 'string' },
                  services: { type: 'object' },
                  cache: { type: 'object' },
                  browser: { type: 'object' },
                  features: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  endpoints: { type: 'object' },
                },
              },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    healthController.getDetailedStatus.bind(healthController)
  );
}
