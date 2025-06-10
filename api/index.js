// Vercel serverless function entry point
const { createApp } = require('../dist/app');

let app;

// Initialize app
async function initApp() {
  if (!app) {
    app = await createApp();
    await app.ready();
  }
  return app;
}

// Export handler for Vercel
module.exports = async (req, res) => {
  try {
    const fastifyApp = await initApp();
    await fastifyApp.ready();
    fastifyApp.server.emit('request', req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};
