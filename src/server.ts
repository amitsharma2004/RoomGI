import express from 'express';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import { logger } from './utils/index.js';
import { errorHandler } from './middleware/index.js';
import { PropertySocket } from './modules/property/index.js';
import routes from './routes/index.js';
import pool from './config/database.js';

const app = express();
const httpServer = createServer(app);

const db = pool.connect()
    .then
(() => logger.info('Database connected successfully'))
    .catch(err => logger.error('Database connection failed:', err));

// Initialize Socket.io
const propertySocket = new PropertySocket(httpServer);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Inject socket service into requests for controllers to use
app.use((req, _res, next) => {
  (req as any).socketService = propertySocket;
  next();
});

// Routes
app.use('/api', routes);

// Basic route
app.get('/', (_req, res) => {
  res.json({ 
    message: 'Rental Truth API - Property Review Platform with Real-time Availability & Neighborhood DNA',
    version: '2.0.0',
    features: [
      'Real-time property viewing', 
      'Live availability updates', 
      'Booking notifications',
      'Neighborhood DNA analysis',
      'Lifestyle-based property search',
      'Transit & safety scoring'
    ],
    endpoints: {
      auth: '/api/auth',
      properties: '/api/properties',
      reviews: '/api/reviews',
      neighborhood: '/api/properties/:id/neighborhood',
      lifestyleSearch: '/api/properties/search/by-lifestyle'
    },
    websocket: {
      events: ['view_property', 'leave_property', 'viewer_count_updated', 'availability_updated', 'booking_activity']
    },
    testPages: {
      realTimeAvailability: '/socket-test.html',
      neighborhoodDNA: '/neighborhood-test.html'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
httpServer.listen(config.port, () => {
  logger.info(`Rental Truth API running on port ${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});