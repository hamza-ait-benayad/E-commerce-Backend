import app from './app';

import { env } from './config/env';

import { logger } from './utils/logger';



const PORT = env.PORT || 5000;



const server = app.listen(PORT, () => {

  logger.info(`🚀 Server running on port ${PORT} in ${env.NODE_ENV} mode`);

  logger.info(`📡 API available at http://localhost:${PORT}/api/${env.API_VERSION}`);

});



// Graceful shutdown

process.on('SIGTERM', () => {

  logger.info('SIGTERM signal received: closing HTTP server');

  server.close(() => {

    logger.info('HTTP server closed');

    process.exit(0);

  });

});



process.on('unhandledRejection', (reason: Error) => {

  logger.error('Unhandled Rejection:', reason);

  server.close(() => process.exit(1));

});
