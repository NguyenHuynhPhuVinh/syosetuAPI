import { SwaggerConfig } from '@/types';
import { appConfig } from './app.config';

export const swaggerConfig: SwaggerConfig = {
  routePrefix: '/docs',
  exposeRoute: true,
  swagger: {
    info: {
      title: 'Syosetu API Backend',
      description: 'Enterprise-grade Fastify TypeScript API for Syosetu.com data extraction using official API and web scraping',
      version: '3.0.0',
    },
    host: `localhost:${appConfig.port}`,
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'Syosetu',
        description: 'Syosetu novel data endpoints',
      },
      {
        name: 'Search',
        description: 'Novel search endpoints',
      },
      {
        name: 'Ranking',
        description: 'Novel ranking endpoints',
      },
    ],
  },
};
