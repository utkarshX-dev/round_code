// MongoDB connection test
app.get('/api/db-test', async (req, res) => {
  try {
    const mongoose = await import('mongoose');

    const state = mongoose.default.connection.readyState;

    if (state !== 1) {
      return res.status(500).json({
        success: false,
        message: 'MongoDB is not connected',
        readyState: state,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'MongoDB connection is working',
      database: mongoose.default.connection.name,
      host: mongoose.default.connection.host,
      readyState: state,
    });
  } catch (error) {
    console.error('DB test failed:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});