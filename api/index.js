// Vercel serverless function entry point
require('dotenv/config');

// Import path for built files
const path = require('path');

// Set up module resolution for TypeScript paths
require('module-alias/register');
require('module-alias').addAlias('@', path.join(__dirname, '..', 'dist'));

const { createApp } = require('../dist/app');

let app;

// Initialize Fastify app
async function getApp() {
  if (!app) {
    try {
      app = await createApp();
      await app.ready();
      console.log('✅ Fastify app initialized for serverless');
    } catch (error) {
      console.error('❌ Failed to initialize Fastify app:', error);
      throw error;
    }
  }
  return app;
}

// Vercel serverless handler
module.exports = async (req, res) => {
  try {
    const fastifyApp = await getApp();

    // Handle the request with Fastify
    await fastifyApp.ready();
    fastifyApp.server.emit('request', req, res);
  } catch (error) {
    console.error('❌ Serverless function error:', error);

    // Send error response
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
};
