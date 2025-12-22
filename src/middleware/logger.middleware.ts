import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    // Determine status color emoji
    const statusEmoji = res.statusCode >= 500 ? '🔴'
      : res.statusCode >= 400 ? '🟡'
        : res.statusCode >= 300 ? '🔵'
          : '🟢';

    logger.info(`${statusEmoji} ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
};