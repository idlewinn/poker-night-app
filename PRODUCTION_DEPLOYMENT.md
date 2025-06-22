# 🚀 Production Deployment Guide

This guide covers deploying the Poker Night app to production with Google OAuth.

## 📋 Prerequisites

- Domain name (e.g., `yourdomain.com`)
- Hosting service (Vercel, Netlify, Railway, etc.)
- Google Cloud Console access

## 🔐 Google OAuth Setup for Production

### 1. Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project → **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Update **Authorized JavaScript origins**:
   ```
   https://yourdomain.com
   https://api.yourdomain.com (if using subdomain for API)
   ```
5. Update **Authorized redirect URIs**:
   ```
   https://api.yourdomain.com/api/auth/google/callback
   ```

### 2. Environment Variables for Production

#### Backend (.env)
```bash
# Server Configuration
PORT=3001
NODE_ENV=production

# Frontend URL (your production domain)
FRONTEND_URL=https://yourdomain.com

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret

# Security (generate secure random strings)
JWT_SECRET=your_secure_jwt_secret_here
SESSION_SECRET=your_secure_session_secret_here
```

#### Frontend (.env)
```bash
# API URL (your production API domain)
VITE_API_URL=https://api.yourdomain.com/api
```

## 🏗️ Build Process

### Backend Build
```bash
cd poker-backend
npm install
npm run build
npm start
```

### Frontend Build
```bash
cd poker-player-manager
npm install
npm run build
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

#### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set build command: `cd poker-player-manager && npm run build`
3. Set output directory: `poker-player-manager/dist`
4. Add environment variable: `VITE_API_URL=https://your-api-domain.com/api`

#### Backend (Railway/Render)
1. Connect GitHub repo
2. Set build command: `cd poker-backend && npm install && npm run build`
3. Set start command: `cd poker-backend && npm start`
4. Add all environment variables from backend .env

### Option 2: Single Domain Deployment

If deploying both on same domain:
- Frontend: `https://yourdomain.com`
- Backend: `https://yourdomain.com/api`

Update CORS and environment variables accordingly.

## 🔧 Production Configuration Updates

### 1. Update CORS Configuration

Edit `poker-backend/src/server.ts`:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://yourdomain.com',
  credentials: true
}));
```

### 2. Update Frontend API Configuration

Edit `poker-player-manager/src/services/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.yourdomain.com/api';
```

## 🗄️ Database Considerations

### SQLite (Current)
- Works for small-medium scale
- Database file needs persistent storage
- Consider backup strategy

### PostgreSQL (Recommended for Production)
- Better for production workloads
- Use managed services (Supabase, Railway, etc.)
- Update database configuration in `poker-backend/src/database/db.ts`

## 🔒 Security Checklist

- [ ] Use HTTPS for all domains
- [ ] Generate secure JWT_SECRET and SESSION_SECRET
- [ ] Restrict Google OAuth to production domains only
- [ ] Enable CORS only for your frontend domain
- [ ] Use environment variables for all secrets
- [ ] Regular security updates for dependencies

## 🧪 Testing Production Setup

1. **Test Google OAuth Flow**:
   - Visit production site
   - Click "Sign in with Google"
   - Verify successful login and redirect

2. **Test Core Functionality**:
   - Create players and sessions
   - Update player status
   - Generate seating charts
   - Test invite links

3. **Test Mobile Responsiveness**:
   - Verify all features work on mobile
   - Test touch interactions
   - Check modal responsiveness

## 🚨 Troubleshooting

### Common Issues:

1. **OAuth Redirect Mismatch**:
   - Verify redirect URIs in Google Console match exactly
   - Check for http vs https mismatches

2. **CORS Errors**:
   - Ensure FRONTEND_URL matches your domain exactly
   - Check for trailing slashes

3. **Environment Variables**:
   - Verify all required env vars are set in production
   - Check for typos in variable names

4. **Database Issues**:
   - Ensure database file has write permissions
   - Check database initialization on first run

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check server logs for backend errors
3. Verify all environment variables are set correctly
4. Test OAuth configuration with Google's OAuth Playground
