import { FastifyInstance } from 'fastify';
import { syosetuController } from '@/controllers';
import { validateParams, validateQuery, validateBody } from '@/middleware';
import {
  ncodeParamsSchema,
  chapterParamsSchema,
  multipleChaptersBodySchema,
  searchQuerySchema,
  rankingQuerySchema,
} from '@/utils';
import { rateLimitConfig } from '@/config';

export async function syosetuRoutes(fastify: FastifyInstance): Promise<void> {
  // Register rate limiting
  await fastify.register(import('@fastify/rate-limit'), rateLimitConfig.api);

  // Content rate limiting for heavy operations
  const contentRateLimit = {
    ...rateLimitConfig.content,
    keyGenerator: (request: any) => request.ip,
  };

  // Get novel metadata
  fastify.get(
    '/api/syosetu/novel/:ncode',
    {
      preHandler: [validateParams(ncodeParamsSchema)],
      schema: {
        tags: ['Syosetu'],
        summary: 'Get novel metadata',
        description:
          'Retrieve detailed information about a novel using its ncode',
        params: {
          type: 'object',
          properties: {
            ncode: {
              type: 'string',
              pattern: '^[a-z0-9]+$',
              description: 'Novel code (e.g., n4754kf)',
            },
          },
          required: ['ncode'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  ncode: { type: 'string' },
                  title: { type: 'string' },
                  author: { type: 'string' },
                  summary: { type: 'string' },
                  biggenre: { type: 'number' },
                  genre: { type: 'number' },
                  keywords: { type: 'string' },
                  firstPublished: { type: 'string' },
                  lastUpdated: { type: 'string' },
                  novelType: { type: 'number' },
                  isCompleted: { type: 'boolean' },
                  totalChapters: { type: 'number' },
                  wordCount: { type: 'number' },
                  readingTime: { type: 'number' },
                  bookmarks: { type: 'number' },
                  impressions: { type: 'number' },
                  reviews: { type: 'number' },
                  points: { type: 'number' },
                  raters: { type: 'number' },
                },
              },
              message: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    syosetuController.getNovelDetails.bind(syosetuController) as any
  );

  // Get chapter content
  fastify.get(
    '/api/syosetu/novel/:ncode/chapter/:chapter',
    {
      preHandler: [
        fastify.rateLimit(contentRateLimit),
        validateParams(chapterParamsSchema),
      ],
      schema: {
        tags: ['Syosetu'],
        summary: 'Get chapter content',
        description:
          'Retrieve the content of a specific chapter using web scraping',
        params: {
          type: 'object',
          properties: {
            ncode: {
              type: 'string',
              pattern: '^[a-z0-9]+$',
              description: 'Novel code',
            },
            chapter: {
              type: 'string',
              pattern: '^\\d+$',
              description: 'Chapter number (starting from 1)',
            },
          },
          required: ['ncode', 'chapter'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  ncode: { type: 'string' },
                  chapterNumber: { type: 'number' },
                  title: { type: 'string' },
                  htmlContent: { type: 'string' },
                  textContent: { type: 'string' },
                  date: { type: 'string' },
                  characterCount: { type: 'number' },
                  estimatedReadingTime: { type: 'number' },
                  url: { type: 'string' },
                },
              },
              message: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    syosetuController.getChapterContent.bind(syosetuController) as any
  );

  // Get multiple chapters
  fastify.post(
    '/api/syosetu/novel/:ncode/chapters',
    {
      preHandler: [
        fastify.rateLimit(contentRateLimit),
        validateParams(ncodeParamsSchema),
        validateBody(multipleChaptersBodySchema),
      ],
      schema: {
        tags: ['Syosetu'],
        summary: 'Get multiple chapters',
        description: 'Retrieve content of multiple chapters at once (max 10)',
        params: {
          type: 'object',
          properties: {
            ncode: {
              type: 'string',
              pattern: '^[a-z0-9]+$',
              description: 'Novel code',
            },
          },
          required: ['ncode'],
        },
        body: {
          type: 'object',
          properties: {
            chapters: {
              type: 'array',
              items: { type: 'number' },
              minItems: 1,
              maxItems: 10,
              description: 'Array of chapter numbers',
            },
          },
          required: ['chapters'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  ncode: { type: 'string' },
                  totalRequested: { type: 'number' },
                  successful: { type: 'number' },
                  failed: { type: 'number' },
                  chapters: { type: 'array' },
                  errors: { type: 'array' },
                },
              },
              message: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    syosetuController.getMultipleChapters.bind(syosetuController) as any
  );

  // Search novels
  fastify.get(
    '/api/syosetu/search',
    {
      preHandler: [validateQuery(searchQuerySchema)],
      schema: {
        tags: ['Search'],
        summary: 'Search novels',
        description: 'Search for novels using various filters and parameters',
        querystring: {
          type: 'object',
          properties: {
            keyword: {
              type: 'string',
              description: 'Search keyword (required)',
            },
            order: {
              type: 'string',
              enum: [
                'new',
                'favnovelcnt',
                'reviewcnt',
                'hyoka',
                'weeklypoint',
                'monthlypoint',
                'yearlypoint',
                'weekly',
              ],
              default: 'new',
              description: 'Sort order',
            },
            limit: {
              type: 'string',
              pattern: '^\\d+$',
              default: '20',
              description: 'Number of results (1-500)',
            },
            start: {
              type: 'string',
              pattern: '^\\d+$',
              description: 'Start position (1-2000)',
            },
            biggenre: {
              type: 'string',
              description: 'Big genre filter',
            },
            genre: {
              type: 'string',
              description: 'Genre filter',
            },
          },
          required: ['keyword'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  keyword: { type: 'string' },
                  totalFound: { type: 'number' },
                  results: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        ncode: { type: 'string' },
                        title: { type: 'string' },
                        author: { type: 'string' },
                        summary: { type: 'string' },
                        biggenre: { type: 'number' },
                        genre: { type: 'number' },
                        keywords: { type: 'string' },
                        firstPublished: { type: 'string' },
                        lastUpdated: { type: 'string' },
                        novelType: { type: 'number' },
                        isCompleted: { type: 'boolean' },
                        totalChapters: { type: 'number' },
                        wordCount: { type: 'number' },
                        bookmarks: { type: 'number' },
                        points: { type: 'number' },
                      },
                    },
                  },
                },
              },
              message: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    syosetuController.searchNovels.bind(syosetuController) as any
  );

  // Get ranking
  fastify.get(
    '/api/syosetu/ranking',
    {
      preHandler: [validateQuery(rankingQuerySchema)],
      schema: {
        tags: ['Ranking'],
        summary: 'Get novel ranking',
        description: 'Retrieve novel ranking based on various criteria',
        querystring: {
          type: 'object',
          properties: {
            order: {
              type: 'string',
              enum: [
                'hyoka',
                'favnovelcnt',
                'reviewcnt',
                'dailypoint',
                'weeklypoint',
                'monthlypoint',
                'quarterpoint',
                'yearlypoint',
              ],
              default: 'hyoka',
              description: 'Ranking order',
            },
            limit: {
              type: 'string',
              pattern: '^\\d+$',
              default: '50',
              description: 'Number of results (1-100)',
            },
            biggenre: {
              type: 'string',
              description: 'Big genre filter',
            },
            genre: {
              type: 'string',
              description: 'Genre filter',
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  rankings: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        rank: { type: 'number' },
                        ncode: { type: 'string' },
                        title: { type: 'string' },
                        author: { type: 'string' },
                        summary: { type: 'string' },
                        genre: { type: 'number' },
                        bookmarks: { type: 'number' },
                        points: { type: 'number' },
                        globalPoints: { type: 'number' },
                      },
                    },
                  },
                },
              },
              message: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    syosetuController.getRanking.bind(syosetuController) as any
  );
}
