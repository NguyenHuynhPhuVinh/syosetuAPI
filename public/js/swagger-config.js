// Swagger UI Configuration for Syosetu API
window.swaggerConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Syosetu API Backend',
    version: '3.0.0',
    description: `
# Syosetu API Backend

API để scraping và truy xuất dữ liệu từ Syosetu.com với các tính năng:

- 📚 **Metadata**: Lấy thông tin chi tiết về tiểu thuyết
- 📖 **Content**: Đọc nội dung chapter
- 🔍 **Search**: Tìm kiếm tiểu thuyết theo từ khóa  
- 🏆 **Ranking**: Xem bảng xếp hạng
- 📋 **List**: Danh sách tiểu thuyết mới nhất

## Công nghệ sử dụng
- **Backend**: Fastify + TypeScript
- **Scraping**: Cheerio (thay thế Puppeteer)
- **Deployment**: Vercel Serverless
- **Cache**: In-memory caching
- **Rate Limiting**: Built-in protection
    `,
    contact: {
      name: 'API Support',
      email: 'support@syosetu-api.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: window.location.origin,
      description: 'Production Server (Vercel)',
    },
    {
      url: 'http://localhost:3000',
      description: 'Development Server',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'Health check và status endpoints',
    },
    {
      name: 'Novel',
      description: 'Thông tin tiểu thuyết và metadata',
    },
    {
      name: 'Chapter',
      description: 'Nội dung chapter và scraping',
    },
    {
      name: 'Search',
      description: 'Tìm kiếm tiểu thuyết',
    },
    {
      name: 'Ranking',
      description: 'Ranking và thống kê',
    },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Basic health check',
        description: 'Kiểm tra trạng thái cơ bản của API',
        responses: {
          200: {
            description: 'API đang hoạt động',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'OK' },
                        message: {
                          type: 'string',
                          example: 'Syosetu API Backend v3.0 đang hoạt động',
                        },
                        version: { type: 'string', example: '3.0.0' },
                        services: {
                          type: 'array',
                          items: { type: 'string' },
                          example: [
                            'Syosetu Official API',
                            'Web Scraping với Cheerio',
                            'Caching với NodeCache',
                          ],
                        },
                        endpoints: { type: 'object' },
                        features: { type: 'array', items: { type: 'string' } },
                        timestamp: { type: 'string', format: 'date-time' },
                      },
                    },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/syosetu/status': {
      get: {
        tags: ['Health'],
        summary: 'Detailed service status',
        description:
          'Trạng thái chi tiết bao gồm cache stats và browser status',
        responses: {
          200: {
            description: 'Thông tin trạng thái chi tiết',
            content: {
              'application/json': {
                schema: {
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
                        features: { type: 'array', items: { type: 'string' } },
                        endpoints: { type: 'object' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Kiểm tra trạng thái API',
        description:
          'Endpoint để kiểm tra trạng thái hoạt động của API và thông tin hệ thống',
        responses: {
          200: {
            description: 'API đang hoạt động bình thường',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'API đang hoạt động' },
                    timestamp: { type: 'string', format: 'date-time' },
                    version: { type: 'string', example: '3.0.0' },
                    environment: { type: 'string', example: 'production' },
                    uptime: { type: 'number', example: 3600 },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/syosetu/novel/{ncode}': {
      get: {
        tags: ['Novel'],
        summary: 'Lấy thông tin tiểu thuyết',
        description:
          'Lấy metadata chi tiết của tiểu thuyết từ API chính thức Syosetu',
        parameters: [
          {
            name: 'ncode',
            in: 'path',
            required: true,
            description: 'Mã tiểu thuyết Syosetu (ví dụ: n4754kf, n9669bk)',
            schema: {
              type: 'string',
              pattern: '^n[0-9]+[a-z]+$',
              example: 'n4754kf',
            },
          },
        ],
        responses: {
          200: {
            description: 'Thông tin tiểu thuyết được lấy thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        ncode: { type: 'string', example: 'n4754kf' },
                        title: {
                          type: 'string',
                          example: '転生したらスライムだった件',
                        },
                        author: { type: 'string', example: '伏瀬' },
                        description: {
                          type: 'string',
                          example: 'サラリーマンが異世界でスライムに転生...',
                        },
                        chapters: { type: 'number', example: 248 },
                        status: { type: 'string', example: '完結済' },
                        genre: { type: 'string', example: 'ハイファンタジー' },
                        keywords: { type: 'array', items: { type: 'string' } },
                        lastUpdate: { type: 'string', format: 'date-time' },
                      },
                    },
                    cached: { type: 'boolean', example: false },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Không tìm thấy tiểu thuyết',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    error: {
                      type: 'string',
                      example: 'Không tìm thấy tiểu thuyết',
                    },
                    message: {
                      type: 'string',
                      example: 'Ncode n4754kf không tồn tại',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/syosetu/novel/{ncode}/chapter/{chapter}': {
      get: {
        tags: ['Chapter'],
        summary: 'Lấy nội dung chapter',
        description: 'Scraping nội dung chapter từ Syosetu bằng Cheerio',
        parameters: [
          {
            name: 'ncode',
            in: 'path',
            required: true,
            description: 'Mã tiểu thuyết',
            schema: { type: 'string', example: 'n4754kf' },
          },
          {
            name: 'chapter',
            in: 'path',
            required: true,
            description: 'Số chapter (bắt đầu từ 1)',
            schema: { type: 'integer', minimum: 1, example: 1 },
          },
        ],
        responses: {
          200: {
            description: 'Nội dung chapter được lấy thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        ncode: { type: 'string', example: 'n4754kf' },
                        chapter: { type: 'number', example: 1 },
                        title: { type: 'string', example: 'プロローグ　転生' },
                        content: {
                          type: 'string',
                          example: 'サラリーマンの三上悟は通り魔に刺され...',
                        },
                        wordCount: { type: 'number', example: 2500 },
                        publishDate: { type: 'string', format: 'date-time' },
                      },
                    },
                    cached: { type: 'boolean', example: false },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/syosetu/novel/{ncode}/chapters': {
      post: {
        tags: ['Chapter'],
        summary: 'Lấy nhiều chapter',
        description: 'Lấy nội dung nhiều chapter cùng lúc (tối đa 10 chapter)',
        parameters: [
          {
            name: 'ncode',
            in: 'path',
            required: true,
            description: 'Mã tiểu thuyết',
            schema: { type: 'string' },
            example: 'n4754kf',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  chapters: {
                    type: 'array',
                    items: { type: 'integer', minimum: 1 },
                    maxItems: 10,
                    example: [1, 2, 3],
                  },
                },
                required: ['chapters'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Kết quả lấy nhiều chapter',
            content: {
              'application/json': {
                schema: {
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
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/syosetu/search': {
      get: {
        tags: ['Search'],
        summary: 'Tìm kiếm tiểu thuyết',
        description: 'Tìm kiếm tiểu thuyết theo từ khóa với các bộ lọc',
        parameters: [
          {
            name: 'keyword',
            in: 'query',
            required: true,
            description: 'Từ khóa tìm kiếm',
            schema: { type: 'string', example: '異世界' },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Số lượng kết quả (mặc định: 20, tối đa: 100)',
            schema: { type: 'integer', default: 20, maximum: 100, example: 20 },
          },
          {
            name: 'genre',
            in: 'query',
            required: false,
            description: 'Thể loại tiểu thuyết',
            schema: {
              type: 'string',
              enum: [
                'ハイファンタジー',
                'ローファンタジー',
                '現実世界',
                '恋愛',
              ],
              example: 'ハイファンタジー',
            },
          },
        ],
        responses: {
          200: {
            description: 'Kết quả tìm kiếm',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          ncode: { type: 'string', example: 'n4754kf' },
                          title: {
                            type: 'string',
                            example: '転生したらスライムだった件',
                          },
                          author: { type: 'string', example: '伏瀬' },
                          description: { type: 'string' },
                          genre: { type: 'string' },
                          chapters: { type: 'number' },
                        },
                      },
                    },
                    total: { type: 'number', example: 150 },
                    page: { type: 'number', example: 1 },
                    limit: { type: 'number', example: 20 },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/syosetu/ranking': {
      get: {
        tags: ['Ranking'],
        summary: 'Lấy bảng xếp hạng',
        description:
          'Lấy bảng xếp hạng tiểu thuyết theo các tiêu chí khác nhau',
        parameters: [
          {
            name: 'type',
            in: 'query',
            required: false,
            description: 'Loại ranking',
            schema: {
              type: 'string',
              enum: ['daily', 'weekly', 'monthly', 'total'],
              default: 'daily',
              example: 'daily',
            },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Số lượng kết quả',
            schema: { type: 'integer', default: 50, maximum: 100, example: 50 },
          },
        ],
        responses: {
          200: {
            description: 'Bảng xếp hạng',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          rank: { type: 'number', example: 1 },
                          ncode: { type: 'string', example: 'n4754kf' },
                          title: { type: 'string' },
                          author: { type: 'string' },
                          points: { type: 'number', example: 15420 },
                        },
                      },
                    },
                    rankingType: { type: 'string', example: 'daily' },
                    updatedAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string' },
          message: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
};

// Initialize Swagger UI
function initSwaggerUI() {
  if (typeof SwaggerUIBundle !== 'undefined') {
    SwaggerUIBundle({
      spec: window.swaggerConfig,
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
      plugins: [SwaggerUIBundle.plugins.DownloadUrl],
      layout: 'StandaloneLayout',
      tryItOutEnabled: true,
      supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
      onComplete: function () {
        console.log('✅ Swagger UI loaded successfully');
      },
      onFailure: function (error) {
        console.error('❌ Swagger UI failed to load:', error);
      },
    });
  } else {
    console.error('❌ SwaggerUIBundle not found');
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { swaggerConfig: window.swaggerConfig, initSwaggerUI };
}

console.log('✅ Swagger config loaded successfully!');
