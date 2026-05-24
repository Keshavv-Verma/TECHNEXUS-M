require('dotenv').config();

const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const { connectDB, disconnectDB, mongoose } = require('./models');

const PORT = config.port;
const HOST = config.host;

let server;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    
    server = app.listen(PORT, HOST, () => {
      logger.info(`Server running on ${HOST}:${PORT}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error.message);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} signal received: closing HTTP server`);
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('beforeExit', async () => {
  await disconnectDB();
});

