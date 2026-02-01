# DNS Configuration for famylin.com

## 🎯 Summary
Configure these DNS records at your domain registrar (Squarespace) to point famylin.com to your Vercel deployment.

---

## 📋 Required DNS Records

### 1. Apex Domain (famylin.com)
**Type:** A  
**Name:** `@` (or leave blank for root domain)  
**Value:** `216.198.79.1`

### 2. WWW Subdomain (www.famylin.com)
**Type:** CNAME  
**Name:** `www`  
**Value:** `c76d2f4d5292ffab.vercel-dns-017.com.`

---

## 🔧 How to Configure (Squarespace)

1. **Log in to Squarespace Domains**
   - Go to your Squarespace account
   - Navigate to Settings → Domains
   - Find famylin.com → Click "DNS Settings"

2. **Add the A Record**
   - Click "Add Record"
   - Type: A
   - Host: @ (or blank)
   - Points to: 216.198.79.1
   - TTL: 3600 (or default)

3. **Add the CNAME Record**
   - Click "Add Record"
   - Type: CNAME
   - Host: www
   - Points to: c76d2f4d5292ffab.vercel-dns-017.com.
   - TTL: 3600 (or default)

4. **Save and Wait**
   - DNS changes can take 24-48 hours to propagate
   - Usually takes 15-30 minutes for Vercel to verify

---

## ✅ After DNS Propagation

Once the DNS records are configured and propagated:

- **famylin.com** → Will redirect (307) to www.famylin.com
- **www.famylin.com** → Will serve your poker app
- **poker-night-app-omega.vercel.app** → Original Vercel URL (will continue to work)

---

## 🔍 Verify Configuration

After adding the records, check status in Vercel:
1. Go to: https://vercel.com/ollies-projects-608aa86f/poker-night-app/settings/domains
2. Click "Refresh" on each domain
3. Status should change from "Invalid Configuration" to "Valid Configuration"

You can also check DNS propagation at: https://dnschecker.org

---

## 📝 Current Status

- ✅ Domain purchased: famylin.com ($11.48)
- ✅ Vercel configuration: Complete
- ⏳ DNS records: **Not yet configured** (waiting for Squarespace access)
- ⏳ Domain verification: Pending DNS configuration

---

## 🔗 Live URLs (After DNS Setup)

- **Primary:** https://www.famylin.com
- **Redirect:** https://famylin.com → https://www.famylin.com
- **Fallback:** https://poker-night-app-omega.vercel.app

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs/projects/domains
- Squarespace DNS: https://support.squarespace.com/hc/en-us/articles/205812378-Connecting-a-domain-to-your-site
