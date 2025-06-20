import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { HealthCheckResponse, ApiError } from './types/index';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
import playersRouter from './routes/players';
import sessionsRouter from './routes/sessions';

// Use routes
app.use('/api/players', playersRouter);
app.use('/api/sessions', sessionsRouter);

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
