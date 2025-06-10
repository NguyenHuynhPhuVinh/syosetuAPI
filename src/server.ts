import 'dotenv/config';
import { createApp } from './app';
import { appConfig } from '@/config';
import { logger } from '@/utils';

async function startServer(): Promise<void> {
  try {
    // Create Fastify app
    const app = await createApp();

    // Start server
    await app.listen({
      port: appConfig.port,
      host: appConfig.host,
    });

    console.log(
      `🚀 Server đang chạy trên http://${appConfig.host}:${appConfig.port}`
    );
    console.log(
      `📊 Health check: http://${appConfig.host}:${appConfig.port}/health`
    );
    console.log(
      `🔍 Syosetu API: http://${appConfig.host}:${appConfig.port}/api/syosetu`
    );
    console.log(
      `📚 API Documentation: http://${appConfig.host}:${appConfig.port}/docs`
    );
    console.log(`🌍 Environment: ${appConfig.nodeEnv}`);

    logger.info('Server started successfully');

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received, shutting down gracefully...`);

      try {
        // Close Fastify server
        await app.close();
        logger.info('✅ Fastify server closed');

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

// Start the server only if not in serverless environment
if (!process.env['VERCEL']) {
  void startServer();
}
