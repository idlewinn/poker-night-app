# Email Setup with SendGrid

**SendGrid** is a classic email service with a free tier (100 emails/day).

## Quick Setup

### 1. Sign up for SendGrid
1. Go to https://sendgrid.com
2. Sign up (free tier available)
3. Verify your email

### 2. Create API Key
1. Settings → API Keys
2. Create API Key
3. Give it "Mail Send" permissions
4. Copy the key (starts with `SG.`)

### 3. Verify Sender Identity
1. Settings → Sender Authentication
2. **Single Sender Verification** (easiest for free tier)
3. Add your email address
4. Verify it via the email they send you

### 4. Update Backend .env

Add these to `poker-backend/.env`:

```bash
# SendGrid SMTP Configuration
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.YourAPIKey_Here  # Your actual SendGrid API key
```

**Important:**
- `EMAIL_USER` is literally the word `apikey` (not your email)
- `EMAIL_PASS` is your SendGrid API key (starts with `SG.`)

### 5. Restart Backend

```bash
cd poker-night-app/poker-backend
npm run dev
```

You should see: `Email service initialized successfully`

### 6. Test

Create a poker session with players who have emails. Check backend logs for:
```
Session invite email sent to player@example.com: <message-id>
```

## Free Tier Limits

- 100 emails/day
- Single sender verification (no custom domain)
- No credit card required for first 30 days

## Troubleshooting

**"Authentication failed"**
→ Make sure `EMAIL_USER=apikey` (literally that word)
→ Double-check your API key starts with `SG.`

**"Sender not allowed"**
→ Verify your sender email in SendGrid dashboard

**"Emails going to spam"**
→ Use the exact email you verified in SendGrid as the sender

## Production

For Railway:
1. Dashboard → Backend service → Variables
2. Add EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
3. Redeploy

---

**Why SendGrid?**
- Established service
- Free tier (100/day)
- Good documentation
- Reliable delivery
