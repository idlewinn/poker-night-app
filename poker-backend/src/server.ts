import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

import passport from './config/auth';
import { HealthCheckResponse, ApiError } from './types/index';

// Initialize database (this will trigger PostgreSQL vs SQLite detection)
import './database/index';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Trust proxy (required for Railway/Heroku/etc)
app.set('trust proxy', 1);

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://poker-night-app.vercel.app',
  'http://localhost:5173',
  'http://localhost:5175'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Session middleware (required for Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true, // Prevent XSS attacks
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Allow cross-site cookies for OAuth
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Import routes
import authRouter from './routes/auth';
import playersRouter from './routes/players';
import sessionsRouter from './routes/sessions';
import seatingChartsRouter from './routes/seatingCharts';

// Use routes
app.use('/api/auth', authRouter);
app.use('/api/players', playersRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/seating-charts', seatingChartsRouter);

// Simple health check endpoint (Railway compatible)
app.get('/health', (req: Request, res: Response) => {
  console.log('Simple health check requested');
  res.status(200).send('OK');
});

// Detailed health check endpoint
app.get('/api/health', (req: Request, res: Response<HealthCheckResponse>) => {
  console.log('API health check requested');
  res.status(200).json({
    status: 'OK',
    message: 'Poker Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    uptime: process.uptime()
  });
});

// Add a simple root endpoint for testing
app.get('/', (req: Request, res: Response) => {
  console.log('Root endpoint requested');
  res.status(200).json({
    message: 'Poker Night API',
    health: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: ApiError, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ error: err.message || 'Something went wrong!' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Try binding without specifying host for Railway
const server = app.listen(PORT, () => {
  console.log(`🃏 Poker Backend API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Binding to: 0.0.0.0:${PORT}`);
  console.log(`Health check available at: http://0.0.0.0:${PORT}/api/health`);
  console.log(`Root endpoint available at: http://0.0.0.0:${PORT}/`);
  console.log(`Railway Public Domain: ${process.env.RAILWAY_PUBLIC_DOMAIN || 'not set'}`);
  console.log(`Railway Static URL: ${process.env.RAILWAY_STATIC_URL || 'not set'}`);
  console.log('Server started successfully!');

  // Test the health endpoint internally
  setTimeout(() => {
    console.log('Testing internal health check...');
    const http = require('http');
    const options = {
      hostname: '127.0.0.1', // Use IPv4 instead of localhost
      port: PORT,
      path: '/api/health',
      method: 'GET'
    };

    const req = http.request(options, (res: any) => {
      console.log(`Internal health check status: ${res.statusCode}`);
    });

    req.on('error', (e: any) => {
      console.error(`Internal health check error: ${e.message}`);
    });

    req.end();
  }, 1000);
});

server.on('error', (error: any) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
