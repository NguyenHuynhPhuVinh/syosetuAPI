import 'dotenv/config';
import { createApp } from './app';
import { appConfig } from '@/config';
import { logger } from '@/utils';
import { browserService } from '@/services';

async function startServer(): Promise<void> {
  try {
    // Create Fastify app
    const app = await createApp();

    // Start server
    await app.listen({
      port: appConfig.port,
      host: appConfig.host,
    });

    logger.info(
      `🚀 Server đang chạy trên http://${appConfig.host}:${appConfig.port}`
    );
    logger.info(
      `📊 Health check: http://${appConfig.host}:${appConfig.port}/health`
    );
    logger.info(
      `🔍 Syosetu API: http://${appConfig.host}:${appConfig.port}/api/syosetu`
    );
    logger.info(
      `📚 API Documentation: http://${appConfig.host}:${appConfig.port}/docs`
    );
    logger.info(`🌍 Environment: ${appConfig.nodeEnv}`);

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received, shutting down gracefully...`);

      try {
        // Close Fastify server
        await app.close();
        logger.info('✅ Fastify server closed');

        // Close browser
        await browserService.closeBrowser();
        logger.info('✅ Browser closed');

        logger.info('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
      }
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', error => {
      logger.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
void startServer();
