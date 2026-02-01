# 📧 Email Quick Fix - Get Email Working Again

**Your email broke because the backend `.env` file is missing email configuration.**

## 🎯 Choose Your Service

### **Option 1: Resend** ⭐ Recommended
- **Free:** 100/day, 3,000/month
- **Setup time:** 5 minutes
- **Difficulty:** Easy ⭐
- **Guide:** `EMAIL-SETUP-RESEND.md`

**Quick setup:**
```bash
# Add to poker-backend/.env
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=587
EMAIL_USER=resend
EMAIL_PASS=re_YourAPIKeyHere
```

### **Option 2: SendGrid**
- **Free:** 100/day
- **Setup time:** 10 minutes
- **Difficulty:** Medium ⭐⭐
- **Guide:** `EMAIL-SETUP-SENDGRID.md`

**Quick setup:**
```bash
# Add to poker-backend/.env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.YourAPIKeyHere
```

### **Option 3: Gmail**
- **Free:** Yes (with limits)
- **Setup time:** 10 minutes
- **Difficulty:** Medium ⭐⭐
- **Guide:** Original `EMAIL_SETUP.md`

**Quick setup:**
```bash
# Add to poker-backend/.env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

---

## ⚡ Fastest Fix (Resend)

**1. Sign up:** https://resend.com (2 minutes)

**2. Get API key:** Dashboard → API Keys → Create (1 minute)

**3. Add to `.env`:**
```bash
cd poker-night-app/poker-backend
nano .env  # or use any editor
```

Add these lines:
```bash
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=587
EMAIL_USER=resend
EMAIL_PASS=re_YourActualAPIKeyHere
```

**4. Restart backend:**
```bash
npm run dev
```

**5. Test:** Create a session with players who have emails

---

## 🔍 Check if It's Working

### Backend Logs Should Show:
```
Email service initialized successfully ✅
```

If you see:
```
Email configuration not found. Email functionality will be disabled. ❌
```
→ Your `.env` file is missing the EMAIL_* variables

### When Sending Emails:
```
Session invite email sent to player@example.com: <message-id> ✅
```

---

## 🚀 Production (Railway)

Once working locally:

1. Go to Railway dashboard
2. Click backend service
3. Variables tab
4. Add all 4 EMAIL_* variables
5. Redeploy

---

## 💡 Which Service Did You Use Before?

**Resend:** API key starts with `re_`  
**SendGrid:** API key starts with `SG.`  
**Gmail:** Using your actual Gmail account

Check your email for signup confirmations or API key emails!

---

## ⚠️ Common Mistakes

1. **Wrong EMAIL_USER:**
   - Resend: Must be `resend` (not your email)
   - SendGrid: Must be `apikey` (not your email)
   - Gmail: Your actual Gmail address

2. **Missing .env file:**
   - File must be at `poker-backend/.env`
   - Not `.env.example` - the actual `.env`

3. **Not restarting backend:**
   - Changes to `.env` require restart
   - Stop and restart `npm run dev`

4. **Production vs Local:**
   - Local: `.env` file
   - Railway: Environment variables in dashboard

---

**Need help?** Check the detailed guides:
- `EMAIL-SETUP-RESEND.md` - Recommended
- `EMAIL-SETUP-SENDGRID.md` - Alternative
- `EMAIL_SETUP.md` - Gmail option
