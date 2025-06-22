import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

import passport from './config/auth';
import { HealthCheckResponse, ApiError } from './types/index';

const app = express();
const PORT = process.env.PORT || 3001;

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

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
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

// Health check endpoint
app.get('/api/health', (req: Request, res: Response<HealthCheckResponse>) => {
  res.json({ status: 'OK', message: 'Poker Backend API is running' });
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

app.listen(PORT, () => {
  console.log(`🃏 Poker Backend API running on port ${PORT}`);
});

export default app;
