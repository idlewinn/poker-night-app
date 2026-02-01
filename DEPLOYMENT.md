# Poker Night App - Deployment Documentation

## Overview

The Poker Night App has been deployed to Railway with a custom domain (famylin.com).

**Deployment Date:** January 31, 2026  
**Deployed By:** Ollie (AI Assistant)

---

## Production URLs

- **Primary:** https://famylin.com
- **WWW:** https://www.famylin.com  
- **Railway Domain:** https://poker-night-app-production-985f.up.railway.app

---

## Backend Deployment (Railway)

### Service Details
- **Platform:** Railway
- **Project:** poker-night-app
- **Service:** poker-night-app-production-985f
- **Region:** us-west1
- **Runtime:** Node.js (detected from package.json)

### Configuration Files
All Railway configuration is defined in `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Environment Variables
The following environment variables are configured in Railway:
- `NODE_ENV=production`
- `PORT=3000` (Railway auto-assigns)
- Database credentials (if applicable)

### Build Process
1. Railway detects Node.js from `package.json`
2. Runs `npm ci && npm run build`
3. Starts with `npm start`
4. Health check endpoint: `/health`

---

## Custom Domain Setup

### Domain Purchase
- **Domain:** famylin.com
- **Registrar:** Namecheap
- **Purchase Date:** January 31, 2026
- **Cost:** $8.88/year (first year)
- **Renewal:** Auto-renew enabled (annually ~$13.98)
- **Account:** edwinlin1987@gmail.com

### DNS Configuration

Configured in Namecheap Advanced DNS:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | @ | 216.198.79.1 | Automatic |
| CNAME Record | www | poker-night-app-production-985f.up.railway.app | 30 min |

**Notes:**
- The A record points the root domain (famylin.com) to Railway's IP address
- The CNAME record points www.famylin.com to the Railway deployment
- Clean configuration with no redirect conflicts

### Railway Custom Domain Settings
1. Added custom domain in Railway dashboard: `famylin.com`
2. Railway automatically provides SSL certificate via Let's Encrypt
3. HTTPS is enforced automatically

---

## Propagation & Testing

### DNS Propagation
DNS changes can take 24-48 hours to fully propagate worldwide. Check status:
```bash
# Check DNS propagation
dig famylin.com
dig www.famylin.com

# Check from specific DNS server
dig @8.8.8.8 famylin.com
```

### Testing Endpoints
```bash
# Test health check
curl https://famylin.com/health

# Test with www
curl https://www.famylin.com/health

# Test direct Railway URL
curl https://poker-night-app-production-985f.up.railway.app/health
```

---

## Monitoring & Logs

### Railway Dashboard
Access logs and metrics at:
https://railway.app/project/poker-night-app-production-985f

### Health Check
- **Endpoint:** `/health`
- **Timeout:** 300 seconds
- **Expected Response:** HTTP 200

### Restart Policy
- **Type:** ON_FAILURE
- **Max Retries:** 10

---

## Future Improvements

### Short-term
1. **Test SSL Certificate**: Verify Let's Encrypt SSL certificate is properly issued for both famylin.com and www.famylin.com
2. **Monitor DNS Propagation**: Check that DNS changes have propagated globally (24-48 hours)
3. **Test Production Endpoints**: Verify all app functionality works on the custom domain

### Long-term
1. **Set up monitoring**: Consider adding Uptime Robot or similar service
2. **Configure CDN**: Add Cloudflare for performance and security
3. **Database backups**: Ensure automated backups are configured
4. **CI/CD Pipeline**: Set up automated deployments from GitHub

---

## Troubleshooting

### Common Issues

**Domain not resolving:**
- Check DNS propagation status
- Verify A record points to 216.198.79.1
- Wait 24-48 hours for full propagation

**SSL certificate issues:**
- Railway automatically provisions Let's Encrypt certificates
- May take a few minutes after DNS propagation
- Check Railway dashboard for certificate status

**App not responding:**
- Check Railway logs for errors
- Verify health check endpoint is working
- Check restart policy hasn't exceeded max retries

### Support Resources
- **Railway Documentation:** https://docs.railway.app
- **Namecheap Support:** https://www.namecheap.com/support/
- **DNS Checker:** https://dnschecker.org/

---

## Costs Summary

### One-time
- Domain registration: $8.88 (first year)

### Recurring
- Domain renewal: ~$13.98/year (Namecheap)
- Railway hosting: Variable based on usage (free tier available)

### Total Estimated Annual Cost
- **Year 1:** ~$8.88 + Railway costs
- **Year 2+:** ~$13.98 + Railway costs

---

## Deployment Checklist

- [x] Backend deployed to Railway
- [x] Custom domain purchased (famylin.com)
- [x] DNS A record configured (@ → 216.198.79.1)
- [x] DNS CNAME record configured (www → Railway domain)
- [x] DNS configuration cleaned (redirect conflicts removed)
- [x] Custom domain added in Railway
- [ ] SSL certificate verified (auto-provisioned by Railway)
- [ ] DNS propagation complete (wait 24-48 hours)
- [ ] Health check endpoint tested
- [ ] Production testing complete
- [ ] Monitoring configured
- [ ] Backups configured

---

**Last Updated:** January 31, 2026, 4:45 PM PST
