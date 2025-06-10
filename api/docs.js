// Vercel serverless function for Swagger docs
require('dotenv/config');

// Import path for built files
const path = require('path');

// Set up module resolution for TypeScript paths
require('module-alias/register');
require('module-alias').addAlias('@', path.join(__dirname, '..', 'dist'));

let app;

// Initialize Fastify app
async function getApp() {
  if (!app) {
    try {
      console.log('🚀 Initializing Fastify app for docs...');
      
      // Import the createApp function from built dist
      const { createApp } = require('../dist/app');
      
      app = await createApp();
      await app.ready();
      
      console.log('✅ Fastify app initialized for docs');
    } catch (error) {
      console.error('❌ Failed to initialize Fastify app:', error);
      throw error;
    }
  }
  return app;
}

// Vercel serverless handler for docs
module.exports = async (req, res) => {
  try {
    const fastifyApp = await getApp();
    
    // Handle the request with Fastify
    await fastifyApp.ready();
    
    // Set the URL to docs endpoint
    req.url = '/api/docs';
    
    console.log(`📚 Docs request: ${req.method} ${req.url}`);
    
    // Use Fastify's built-in request handler
    fastifyApp.server.emit('request', req, res);
    
  } catch (error) {
    console.error('❌ Docs serverless function error:', error);
    
    // Send error response if headers not sent
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
};
