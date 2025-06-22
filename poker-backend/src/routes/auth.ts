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
  (req: Request, res: Response, next: any) => {
    console.log('OAuth callback received');
    passport.authenticate('google', { session: false }, (err: any, user: User | false, info: any) => {
      console.log('OAuth authenticate result:', { err, user: user ? 'User found' : 'No user', info });

      if (err) {
        console.error('OAuth authentication error:', err);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=auth_failed`);
      }

      if (!user) {
        console.error('OAuth authentication failed: No user returned');
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=auth_failed`);
      }

      try {
        // Generate JWT token
        const token = generateJWT(user);
        console.log('JWT token generated successfully');

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?token=${token}`);
      } catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=auth_failed`);
      }
    })(req, res, next);
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
