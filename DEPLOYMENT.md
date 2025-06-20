# 🚀 Deployment Guide - Poker Night App

This guide will help you deploy your Poker Night app to the cloud using Railway (recommended) or other services.

## 🛤️ Railway Deployment (Recommended)

Railway is perfect for this full-stack TypeScript app with automatic deployments and database support.

### Prerequisites
- GitHub account
- Railway account (free at [railway.app](https://railway.app))

### Step 1: Push to GitHub

1. **Create a new repository** on GitHub (e.g., `poker-night-app`)
2. **Push your code:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/poker-night-app.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy Backend to Railway

1. **Go to [railway.app](https://railway.app)** and sign in with GitHub
2. **Click "New Project"** → **"Deploy from GitHub repo"**
3. **Select your repository** and choose **"poker-backend"** folder
4. **Railway will automatically:**
   - Detect Node.js/TypeScript
   - Install dependencies
   - Build TypeScript
   - Start the server

5. **Set environment variables** (if needed):
   - `NODE_ENV=production`
   - `PORT` (Railway sets this automatically)

6. **Get your backend URL** (e.g., `https://your-app-name.railway.app`)

### Step 3: Deploy Frontend to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
2. **Click "New Project"** → **Import your repository**
3. **Configure build settings:**
   - **Root Directory:** `poker-player-manager`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Set environment variables:**
   - Create `VITE_API_URL` with your Railway backend URL

5. **Deploy** - Vercel will build and deploy automatically

### Step 4: Update Frontend API URL

Update your frontend to use the deployed backend:

```typescript
// poker-player-manager/src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

## 🔄 Alternative Deployment Options

### Option 2: Render (Free Tier)

**Backend:**
1. Go to [render.com](https://render.com)
2. Create "New Web Service"
3. Connect GitHub repository
4. Settings:
   - **Root Directory:** `poker-backend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`

**Frontend:**
1. Create "New Static Site"
2. Settings:
   - **Root Directory:** `poker-player-manager`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`

### Option 3: Netlify + Railway

**Backend:** Deploy to Railway (same as above)
**Frontend:** Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `poker-player-manager/dist` folder
3. Or connect GitHub for automatic deployments

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=3001
```

### Frontend
```env
VITE_API_URL=https://your-backend-url.railway.app/api
```

## 📊 Database Considerations

### SQLite (Current Setup)
- ✅ **Works great** for Railway/Render
- ✅ **No additional setup** required
- ✅ **File-based** storage
- ⚠️ **Single instance** limitation

### Upgrade to PostgreSQL (Optional)
For production scale, consider upgrading:

1. **Railway PostgreSQL:**
   - Add PostgreSQL service in Railway
   - Update connection string
   - Migrate schema

2. **Supabase:**
   - Free PostgreSQL hosting
   - Built-in API features
   - Real-time subscriptions

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Code committed to Git
- [ ] TypeScript compiles without errors
- [ ] Environment variables configured
- [ ] API endpoints tested locally

### Backend Deployment
- [ ] Railway/Render service created
- [ ] Build succeeds
- [ ] Health check endpoint working
- [ ] Database initializes correctly

### Frontend Deployment
- [ ] Vercel/Netlify service created
- [ ] Build succeeds
- [ ] API URL updated
- [ ] App loads and connects to backend

### Post-deployment
- [ ] Test all CRUD operations
- [ ] Verify data persistence
- [ ] Check error handling
- [ ] Test on mobile devices

## 🔍 Troubleshooting

### Common Issues

**Backend won't start:**
- Check build logs for TypeScript errors
- Verify all dependencies are in package.json
- Check environment variables

**Frontend can't connect to backend:**
- Verify API URL is correct
- Check CORS settings
- Ensure backend is running

**Database issues:**
- Check file permissions for SQLite
- Verify database directory exists
- Check initialization logs

### Useful Commands

```bash
# Test backend locally
cd poker-backend && npm run build && npm start

# Test frontend build
cd poker-player-manager && npm run build && npm run preview

# Check backend health
curl https://your-backend-url.railway.app/api/health
```

## 🎯 Next Steps

After successful deployment:

1. **Custom Domain:** Add your own domain in Railway/Vercel
2. **SSL Certificate:** Automatically provided by hosting services
3. **Monitoring:** Set up uptime monitoring
4. **Analytics:** Add Google Analytics or similar
5. **Error Tracking:** Consider Sentry for error monitoring

## 💡 Pro Tips

- **Use Railway for backend** - excellent Node.js support
- **Use Vercel for frontend** - optimized for React/Vite
- **Enable automatic deployments** from GitHub
- **Set up staging environments** for testing
- **Monitor your usage** to stay within free tiers

Your Poker Night app is now ready for the world! 🌍🃏
