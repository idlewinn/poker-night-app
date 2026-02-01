# Email "From" Address Fix

**Issue:** Emails were being sent from the SMTP username instead of a proper sender email.

## What Was Wrong

With Resend (and most modern email services):
- **SMTP Authentication:** Uses a username for login (e.g., `resend`, `apikey`)
- **Sender Email:** The actual email address emails appear to come from

The code was using `EMAIL_USER` for both, which meant emails tried to send from `resend` instead of a real email address.

## The Fix

Added a new `EMAIL_FROM` environment variable:

```bash
EMAIL_USER=resend           # For SMTP authentication
EMAIL_FROM=noreply@famylin.com  # What recipients see as sender
```

## Your Options for EMAIL_FROM

### Option 1: Resend Test Email (Quick & Easy)
```bash
EMAIL_FROM=onboarding@resend.dev
```
✅ Works immediately  
✅ No domain verification needed  
⚠️ Shows "via resend.dev" in some email clients  

### Option 2: Your Domain (Professional)
```bash
EMAIL_FROM=noreply@famylin.com
```
✅ Professional appearance  
✅ Better deliverability  
❌ Requires domain verification in Resend  

**To verify your domain:**
1. Resend Dashboard → Domains
2. Add `famylin.com`
3. Add DNS records they provide
4. Wait for verification (~5 minutes)

## Updated .env Template

```bash
# Resend Email Configuration
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=587
EMAIL_USER=resend
EMAIL_PASS=re_YourActualAPIKeyHere
EMAIL_FROM=onboarding@resend.dev  # or noreply@famylin.com
```

## For Production (Railway)

Add all 5 variables to your Railway backend service:
1. `EMAIL_HOST` = `smtp.resend.com`
2. `EMAIL_PORT` = `587`
3. `EMAIL_USER` = `resend`
4. `EMAIL_PASS` = `re_YourAPIKey`
5. `EMAIL_FROM` = `onboarding@resend.dev` (or your verified domain email)

## Testing

Create a poker session and check the received email:
- **From:** "Poker Night" <onboarding@resend.dev>  
  OR  
- **From:** "Poker Night" <noreply@famylin.com>

Not:
- ~~From: "Poker Night" <resend>~~ ❌

---

**Status:** ✅ Fixed in commit `b2a53d9`
