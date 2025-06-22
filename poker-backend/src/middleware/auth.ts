import { Request, Response, NextFunction } from 'express';
import { verifyJWT, findUserById, userToAuthUser } from '../config/auth';
import { AuthUser } from '../types/index';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

// Middleware to authenticate JWT token
export async function authenticateToken(req: any, res: any, next: any): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const payload = verifyJWT(token);
    if (!payload) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }

    // Fetch fresh user data from database
    const user = await findUserById(payload.userId);
    if (!user) {
      res.status(403).json({ error: 'User not found' });
      return;
    }

    // Attach user to request
    req.user = userToAuthUser(user);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(403).json({ error: 'Invalid token' });
  }
}

// Middleware to check if user is authenticated (optional authentication)
export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // No token provided, continue without authentication
    next();
    return;
  }

  try {
    const payload = verifyJWT(token);
    if (payload) {
      const user = await findUserById(payload.userId);
      if (user) {
        req.user = userToAuthUser(user);
      }
    }
  } catch (error) {
    // Ignore authentication errors for optional auth
    console.log('Optional auth failed:', error);
  }

  next();
}

// Middleware to require session ownership (user must own the session)
export async function requireSessionOwnership(req: any, res: any, next: any): Promise<void> {
  try {
    // First authenticate
    await authenticateToken(req, res, () => {});

    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const sessionId = parseInt(req.params.sessionId || req.params.id);
    if (!sessionId) {
      res.status(400).json({ error: 'Session ID required' });
      return;
    }

    // Check if user owns this session
    const db = require('../database/index').default;
    const session = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    if ((session as any).created_by !== req.user.id) {
      res.status(403).json({ error: 'You can only modify sessions you created' });
      return;
    }

    next();
  } catch (error) {
    console.error('Session ownership check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Middleware for any authenticated user (no role restrictions)
export function requireAuth(req: any, res: any, next: any): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
}
