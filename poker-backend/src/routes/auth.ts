import express, { Request, Response } from 'express';
import passport from '../config/auth';
import { generateJWT, userToAuthUser } from '../config/auth';
import { authenticateToken } from '../middleware/auth';
import { User } from '../types/index';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = express.Router();

// Google OAuth login
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google OAuth callback
router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as User;
      
      if (!user) {
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=auth_failed`);
        return;
      }

      // Generate JWT token
      const token = generateJWT(user);
      
      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?token=${token}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=auth_failed`);
    }
  }
);

// Get current user info
router.get('/me', authenticateToken, (req: any, res: any) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  res.json({
    user: req.user,
    message: 'User authenticated successfully'
  });
});

// Logout (client-side token removal)
router.post('/logout', (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

// Check authentication status
router.get('/status', authenticateToken, (req: any, res: any) => {
  res.json({
    authenticated: true,
    user: req.user
  });
});

export default router;
