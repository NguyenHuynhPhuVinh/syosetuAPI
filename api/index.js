// Simple health check endpoint for Vercel
module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Simple API response
    res.status(200).json({
      success: true,
      message: 'Syosetu API Backend is running on Vercel',
      timestamp: new Date().toISOString(),
      version: '3.0.0',
      environment: 'serverless',
      endpoints: {
        health: '/api',
        docs: '/api/docs',
        syosetu: '/api/syosetu',
      },
    });
  } catch (error) {
    console.error('❌ Serverless function error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};
