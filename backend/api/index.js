const healthResponse = {
  status: 'healthy',
  platform: 'ROUNDCode',
  society: 'Round Table DTU',
};

export default async (req, res) => {
  const requestPath = (req.url || '').split('?')[0];

  if (requestPath === '/health' || requestPath === '') {
    return res.status(200).json({
      ...healthResponse,
      timestamp: new Date().toISOString(),
    });
  }

  const { default: app } = await import('../src/app.js');
  return app(req, res);
};
