# ✅ Production Deployment Checklist

Use this checklist to ensure your Poker Night app is properly deployed to production.

## 🔐 Pre-Deployment Setup

### Google OAuth Configuration
- [ ] Created Google Cloud Project
- [ ] Enabled Google+ API
- [ ] Created OAuth 2.0 Client ID
- [ ] Added production domains to authorized origins
- [ ] Added production callback URL to authorized redirects
- [ ] Copied Client ID and Client Secret

### Environment Variables
- [ ] Backend `.env` configured with production values
- [ ] Frontend `.env` configured with production API URL
- [ ] Generated secure JWT_SECRET (32+ characters)
- [ ] Generated secure SESSION_SECRET (32+ characters)
- [ ] Set NODE_ENV=production

## 🏗️ Build & Deploy

### Backend Deployment
- [ ] Code pushed to repository
- [ ] Hosting service connected to repository
- [ ] Build command set: `cd poker-backend && npm install && npm run build`
- [ ] Start command set: `cd poker-backend && npm start`
- [ ] Environment variables configured in hosting service
- [ ] Database file/connection configured
- [ ] SSL certificate enabled (HTTPS)

### Frontend Deployment
- [ ] Code pushed to repository
- [ ] Hosting service connected to repository
- [ ] Build command set: `cd poker-player-manager && npm run build`
- [ ] Output directory set: `poker-player-manager/dist`
- [ ] Environment variables configured
- [ ] SSL certificate enabled (HTTPS)

## 🧪 Post-Deployment Testing

### Basic Functionality
- [ ] Frontend loads without errors
- [ ] API health check responds (visit: `https://your-api-domain.com/api/health`)
- [ ] Google OAuth login works
- [ ] User can create account and login
- [ ] User can create players
- [ ] User can create sessions
- [ ] User can update player status
- [ ] Invite links work correctly

### Mobile Testing
- [ ] App loads on mobile devices
- [ ] Touch interactions work properly
- [ ] Modals display correctly on small screens
- [ ] Text is readable on mobile
- [ ] All features accessible on mobile

### Security Testing
- [ ] HTTPS enforced on all pages
- [ ] OAuth redirects work securely
- [ ] API endpoints require authentication
- [ ] CORS configured correctly
- [ ] No sensitive data exposed in client

## 🔧 Production Configuration

### Performance
- [ ] Frontend assets minified and optimized
- [ ] API responses are reasonably fast
- [ ] Database queries optimized
- [ ] Error handling in place

### Monitoring
- [ ] Error logging configured
- [ ] Health check endpoint monitored
- [ ] Database backup strategy in place
- [ ] SSL certificate renewal scheduled

## 🚨 Troubleshooting

### If OAuth doesn't work:
1. Check Google Console redirect URIs match exactly
2. Verify FRONTEND_URL environment variable
3. Check browser console for CORS errors
4. Test with incognito/private browsing

### If API calls fail:
1. Check VITE_API_URL environment variable
2. Verify CORS configuration
3. Check network tab in browser dev tools
4. Verify API server is running and accessible

### If database issues occur:
1. Check database file permissions
2. Verify database initialization
3. Check for write access to database directory
4. Consider migrating to managed database service

## 📞 Support Resources

- [Google OAuth Setup Guide](./GOOGLE_OAUTH_SETUP.md)
- [Production Deployment Guide](./PRODUCTION_DEPLOYMENT.md)
- [Verification Script](./verify-production.js)

## 🎉 Success!

Once all items are checked and tests pass:
- [ ] App is live and functional
- [ ] Users can access and use all features
- [ ] Mobile experience is smooth
- [ ] Security measures are in place
- [ ] Monitoring is active

Your Poker Night app is ready for production! 🃏
