# Email Setup with Resend

**Resend** is a modern email API with a generous free tier (100 emails/day, 3,000/month).

## Quick Setup

### 1. Sign up for Resend
1. Go to https://resend.com
2. Sign up (free)
3. Verify your email

### 2. Get API Key
1. Dashboard → API Keys
2. Create a new API key
3. Copy it (starts with `re_`)

### 3. Add Domain (Optional but Recommended)
1. Dashboard → Domains
2. Add your domain: `famylin.com`
3. Add DNS records (Resend will show you what to add)
4. Wait for verification (usually a few minutes)

**OR** use Resend's test domain: `onboarding@resend.dev` (limited features)

### 4. Update Backend .env

We need to use Resend's SMTP, **NOT Gmail SMTP**. Add these to `poker-backend/.env`:

```bash
# Resend SMTP Configuration
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=587
EMAIL_USER=resend
EMAIL_PASS=re_YourAPIKey_Here  # Your actual Resend API key
```

**Important:** 
- `EMAIL_USER` is literally the word `resend` (not your email)
- `EMAIL_PASS` is your Resend API key (starts with `re_`)

### 5. Restart Backend

```bash
cd poker-night-app/poker-backend
npm run dev
```

You should see: `Email service initialized successfully`

### 6. Test

Create a new poker session with players who have email addresses. Check the backend logs for:
```
Session invite email sent to player@example.com: <message-id>
```

## Free Tier Limits

- 100 emails/day
- 3,000 emails/month
- 1 domain
- No credit card required

## Troubleshooting

**"Email configuration not found"**
→ Check `.env` file has all 4 variables

**"Authentication failed"**
→ Double-check your API key (should start with `re_`)

**"Sender not allowed"**
→ Either verify your domain OR use `onboarding@resend.dev` as sender

## Production

For production on Railway:

1. Go to Railway dashboard
2. Click your backend service
3. Variables tab
4. Add the 4 EMAIL_* variables
5. Redeploy

---

**Why Resend?**
- Free tier is generous
- No credit card needed
- Modern API
- Great deliverability
- Easy domain setup
