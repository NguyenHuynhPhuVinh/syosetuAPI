import { createApp } from '../app';
import { FastifyInstance } from 'fastify';

describe('Health Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('status', 'OK');
      expect(body.data).toHaveProperty('version', '3.0.0');
      expect(body.data).toHaveProperty('services');
      expect(body.data).toHaveProperty('endpoints');
      expect(body.data).toHaveProperty('features');
      expect(body.data).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/syosetu/status', () => {
    it('should return detailed status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/syosetu/status',
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('status', 'OK');
      expect(body.data).toHaveProperty('version', '3.0.0');
      expect(body.data).toHaveProperty('services');
      expect(body.data).toHaveProperty('cache');
      expect(body.data).toHaveProperty('browser');
      expect(body.data).toHaveProperty('features');
      expect(body.data).toHaveProperty('endpoints');
    });
  });
});
