require('dotenv').config();

const app = require('./app');
const config = require('./config');
const { connectDB, disconnectDB, mongoose } = require('./models');

const PORT = config.port;
const HOST = config.host;

let server;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    
    server = app.listen(PORT, HOST, () => {
      console.log(`Server running on ${HOST}:${PORT}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log('Database: MongoDB Atlas configured');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`${signal} signal received: closing HTTP server`);
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

