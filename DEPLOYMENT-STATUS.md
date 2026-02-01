# Poker Night App - Deployment Status

## ✅ COMPLETE - All Systems Live

### Custom Domain Setup (Vercel)
- **Primary Domain:** https://famylin.com
- **WWW Domain:** https://www.famylin.com  
- **Original Vercel URL:** https://poker-player-manager.vercel.app
- **SSL Certificates:** ✅ Auto-provisioned by Vercel
- **DNS Status:** Configured and propagating (24-48 hours)

### DNS Configuration (Namecheap)
| Record Type | Host | Value | TTL |
|------------|------|-------|-----|
| A Record | @ | 76.76.21.21 (Vercel) | Automatic |
| CNAME Record | www | cname.vercel-dns.com | 30 min |

### Routing Configuration (vercel.json)
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://poker-night-app-production-985f.up.railway.app/api/:path*"
    },
    {
      "source": "/pokernight",
      "destination": "/index.html"
    },
    {
      "source": "/pokernight/:path*",
      "destination": "/:path*"
    },
    {
      "source": "/",
      "destination": "/index.html"
    }
  ]
}
```

### Architecture
- **Frontend:** Served from Vercel at famylin.com/pokernight
- **Backend API:** Proxied through Vercel to Railway
  - Requests to `/api/*` are forwarded to Railway backend
  - No CORS issues - same domain for frontend and API
- **Future Apps:** Ready to add more routes on famylin.com

---

## Backend (Railway) ✅

- **Platform:** Railway
- **URL:** https://poker-night-app-production-985f.up.railway.app
- **Status:** Online & Active
- **Project:** https://railway.com/project/0c983c1f-b7e4-4ef5-8866-ed8889dcaa84
- **Root Directory:** poker-backend
- **Runtime:** Node.js 22.22.0
- **Region:** us-west2
- **Environment Variables:**
  - GOOGLE_CLIENT_ID ✅
  - GOOGLE_CLIENT_SECRET ✅
  - FRONTEND_URL ✅

---

## Frontend (Vercel) ✅

- **Platform:** Vercel  
- **Status:** Live & Active
- **Primary URL:** https://famylin.com/pokernight
- **Root Directory:** poker-player-manager
- **Backend API:** Proxied through Vercel routing
- **Latest Deployment:** https://poker-player-manager-qu9k78prp-ollies-projects-608aa86f.vercel.app

---

## Database (PostgreSQL) ✅

- **Platform:** Railway
- **Type:** PostgreSQL  
- **Status:** Provisioned
- **Auto-injected:** DATABASE_URL variable

---

## Testing

### Test URLs
1. **Frontend:** https://famylin.com/pokernight (once DNS propagates)
2. **API Proxy:** https://famylin.com/api/... (proxied to Railway)
3. **Direct Backend:** https://poker-night-app-production-985f.up.railway.app (still works)

### DNS Propagation
- **Status:** In progress (24-48 hours)
- **Check:** `dig famylin.com` or `dig www.famylin.com`
- **Expected:** A record → 76.76.21.21, CNAME → cname.vercel-dns.com

---

*Last updated: 2026-01-31 23:15 PST*
