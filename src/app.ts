import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env';
import { errorMiddleware } from './middleware/error.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';
import v1Routes from './routes/v1';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(loggerMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV 
  });
});

// API routes
app.use(`/api/${env.API_VERSION}`, v1Routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Global error handler
app.use(errorMiddleware);

export default app;