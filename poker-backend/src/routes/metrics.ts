import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import MetricsService from '../services/metricsService';

const router = express.Router();

// GET overall metrics summary
router.get('/', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const summary = await MetricsService.getMetricsSummary(userId);
    res.json(summary);
  } catch (error: any) {
    console.error('Error fetching metrics summary:', error);
    res.status(500).json({ error: 'Failed to fetch metrics summary' });
  }
});

// GET session-specific metrics
router.get('/sessions/:sessionId', authenticateToken, async (req: any, res: Response) => {
  try {
    const { sessionId } = req.params;
    const sessionMetrics = await MetricsService.getSessionMetrics(parseInt(sessionId));
    res.json(sessionMetrics);
  } catch (error: any) {
    console.error('Error fetching session metrics:', error);
    res.status(500).json({ error: 'Failed to fetch session metrics' });
  }
});

// POST track custom event
router.post('/track', authenticateToken, async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { eventType, eventData, sessionId, playerEmail } = req.body;

    if (!eventType) {
      res.status(400).json({ error: 'Event type is required' });
      return;
    }

    await MetricsService.trackEvent({
      userId,
      sessionId,
      playerEmail,
      eventType,
      eventData,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'Event tracked successfully' });
  } catch (error: any) {
    console.error('Error tracking custom event:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// GET metrics for all sessions (admin view)
router.get('/admin/all', authenticateToken, async (req: any, res: Response): Promise<void> => {
  try {
    // Get overall metrics without user filter (admin view)
    const summary = await MetricsService.getMetricsSummary();
    res.json(summary);
  } catch (error: any) {
    console.error('Error fetching admin metrics:', error);
    res.status(500).json({ error: 'Failed to fetch admin metrics' });
  }
});

export default router;
