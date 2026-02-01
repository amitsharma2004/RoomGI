import express from 'express';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import { logger } from './utils/index.js';
import { errorHandler } from './middleware/index.js';
import routes from './routes/index.js';
import pool from './config/database.js';
import cors from 'cors';
import { socketService } from './socket/socketService.js';

const app = express();
const server = createServer(app);

// Initialize Socket.io
socketService.initialize(server);

// Try to connect to database, but don't fail if it's not available
pool.connect()
    .then(() => {
        logger.info('Connected to PostgreSQL database');
        // Test a simple query to ensure tables exist
        return pool.query('SELECT COUNT(*) FROM users');
    })
    .then(() => {
        logger.info('Database tables verified');
    })
    .catch(err => {
        logger.error('Database connection or table error:', err);
        logger.error('Make sure to run migrations: npm run db:migrate');
    });

app.use(cors({
        origin: '*',
        credentials: true
    }));
// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api', routes);

// Basic route
app.get('/', (_req, res) => {
  res.json({ 
    message: 'RoomGI API - Property Review Platform',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      properties: '/api/properties',
      reviews: '/api/reviews',
      flags: '/api/flags'
    },
    features: {
      realtime: 'Socket.io enabled',
      viewers: 'Real-time property viewing'
    }
  });
});

// Health check endpoint for Docker
app.get('/health', async (_req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    res.status(200).json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Migration endpoint (remove after first deployment)
app.post('/migrate', async (_req, res) => {
  try {
    const { runMigrations, seedDatabase } = await import('./database/migrate.js');
    const migrateSuccess = await runMigrations();
    const seedSuccess = await seedDatabase();
    
    res.json({ 
      success: migrateSuccess && seedSuccess,
      migrations: migrateSuccess,
      seeding: seedSuccess
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use(errorHandler);

// Start server
server.listen(config.port, () => {
  logger.info(`Rental Truth API running on port ${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info('Socket.io initialized for real-time features');
});