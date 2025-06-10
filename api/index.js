// Vercel serverless function entry point
const path = require('path');

// Import the built server
const serverPath = path.join(__dirname, '..', 'dist', 'server.js');

// Export the Fastify app for Vercel
module.exports = require(serverPath);
