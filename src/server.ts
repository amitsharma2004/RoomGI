import express from 'express';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import { logger } from './utils/index.js';
import { errorHandler } from './middleware/index.js';
import routes from './routes/index.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api', routes);

// Basic route
app.get('/', (_req, res) => {
  res.json({ 
    message: 'Rental Truth API - Property Review Platform',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      properties: '/api/properties',
      reviews: '/api/reviews'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  logger.info(`🚀 Rental Truth API running on port ${config.port}`);
  logger.info(`📍 Environment: ${config.nodeEnv}`);
});