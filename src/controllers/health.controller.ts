import { FastifyRequest, FastifyReply } from 'fastify';
import { HealthCheckResponse } from '@/types';
import { sendSuccess, createChildLogger, cacheManager } from '@/utils';
import { scraperService } from '@/services';

const logger = createChildLogger('HealthController');

export class HealthController {
  async getHealth(
    _request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const response: HealthCheckResponse = {
        status: 'OK',
        message: 'Syosetu API Backend v3.0 đang hoạt động',
        version: '3.0.0',
        services: [
          'Syosetu Official API',
          'Web Scraping với Cheerio',
          'Caching với NodeCache',
          'Rate Limiting',
          'TypeScript Support',
          'Swagger Documentation',
        ],
        endpoints: {
          health: '/health',
          docs: '/docs',
          syosetu: '/api/syosetu',
          status: '/api/syosetu/status',
          novel: '/api/syosetu/novel/:ncode',
          chapter: '/api/syosetu/novel/:ncode/chapter/:chapter',
          multipleChapters: '/api/syosetu/novel/:ncode/chapters',
          search: '/api/syosetu/search',
          ranking: '/api/syosetu/ranking',
        },
        features: [
          'Lấy metadata từ API chính thức Syosetu',
          'Lấy nội dung chapter bằng Cheerio scraping',
          'Cache tự động với TTL',
          'Rate limiting thông minh',
          'Tìm kiếm và ranking',
          'Validation với Zod',
          'Error handling toàn diện',
          'Logging với Pino',
          'TypeScript type safety',
          'Enterprise-grade architecture',
          'Serverless-ready deployment',
        ],
        timestamp: new Date().toISOString(),
      };

      sendSuccess(reply, response);
    } catch (error) {
      logger.error('Error in health check:', error);
      sendSuccess(reply, {
        status: 'ERROR',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
      });
    }
  }

  async getDetailedStatus(
    _request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const cacheStats = cacheManager.getStats();
      const scraperAvailable = await scraperService.isAvailable();

      let scraperStatus = 'Not available';
      try {
        if (scraperAvailable) {
          scraperStatus = 'Available - Cheerio v1.1.0';
        }
      } catch (error) {
        logger.warn('Could not check scraper status:', error);
      }

      const response = {
        status: 'OK',
        message: 'Syosetu API service đang hoạt động',
        version: '3.0.0',
        timestamp: new Date().toISOString(),
        services: {
          api: 'Online',
          scraper: scraperAvailable ? 'Available' : 'Unavailable',
          cache: 'Active',
        },
        cache: {
          metadata: {
            keys: cacheStats.metadata.keys,
            hits: cacheStats.metadata.hits,
            misses: cacheStats.metadata.misses,
            hitRate:
              cacheStats.metadata.hits /
                (cacheStats.metadata.hits + cacheStats.metadata.misses) || 0,
          },
          content: {
            keys: cacheStats.content.keys,
            hits: cacheStats.content.hits,
            misses: cacheStats.content.misses,
            hitRate:
              cacheStats.content.hits /
                (cacheStats.content.hits + cacheStats.content.misses) || 0,
          },
        },
        scraper: {
          available: scraperAvailable,
          engine: 'Cheerio',
          version: scraperStatus,
        },
        features: [
          'Lấy metadata từ API chính thức',
          'Lấy nội dung chapter bằng Cheerio scraping',
          'Tìm kiếm tiểu thuyết',
          'Lấy ranking',
          'Cache tự động',
          'Rate limiting',
          'TypeScript support',
          'Enterprise architecture',
          'Serverless deployment ready',
        ],
        endpoints: {
          'GET /health': 'Health check cơ bản',
          'GET /api/syosetu/status': 'Status chi tiết',
          'GET /api/syosetu/novel/:ncode': 'Lấy thông tin tiểu thuyết',
          'GET /api/syosetu/novel/:ncode/chapter/:chapter':
            'Lấy nội dung chapter',
          'POST /api/syosetu/novel/:ncode/chapters': 'Lấy nhiều chapter',
          'GET /api/syosetu/search': 'Tìm kiếm tiểu thuyết',
          'GET /api/syosetu/ranking': 'Lấy ranking',
          'GET /docs': 'Swagger documentation',
        },
      };

      sendSuccess(reply, response);
    } catch (error) {
      logger.error('Error in detailed status:', error);
      sendSuccess(
        reply,
        {
          status: 'ERROR',
          message: 'Status check failed',
          timestamp: new Date().toISOString(),
        },
        undefined,
        500
      );
    }
  }
}

export const healthController = new HealthController();
