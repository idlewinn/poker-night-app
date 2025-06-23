# Email Setup for Poker Night

This document explains how to configure email functionality for sending session invitations.

## Overview

When you create a new session with players, the app can automatically send email invitations to all players who have email addresses. Each email includes:

- Session details (name, date/time, game type)
- Host information
- Direct link to the player's invite page
- Professional HTML and text formatting

## Configuration

### 1. Environment Variables

Add these variables to your `.env` file:

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 2. Gmail Setup (Recommended)

For Gmail, you need to use an App Password (not your regular password):

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password
3. **Update .env file**:
   ```bash
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=abcd-efgh-ijkl-mnop  # Your 16-character app password
   ```

### 3. Other Email Providers

For other SMTP providers, update the configuration accordingly:

```bash
# Example for Outlook/Hotmail
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password

# Example for custom SMTP
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=587
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your-password
```

## Features

### Automatic Email Sending

- **Triggered**: When creating a new session with players
- **Recipients**: Only players with email addresses
- **Content**: Session details + personalized invite link
- **Fallback**: If email fails, session creation still succeeds

### Email Content

Each invitation email includes:

- **Subject**: "🃏 You're invited to [Session Name]!"
- **Professional HTML design** with poker theme
- **Session details**: Date, time, game type, host
- **Direct invite link** to player's response page
- **Plain text fallback** for email clients that don't support HTML

### Invite Links

Each player gets a unique invite link:
```
https://edwinpokernight.com/invite/[sessionId]/[encodedEmail]
```

- **Secure**: Email is base64 encoded
- **Direct access**: No login required for status updates
- **Persistent**: Links work until session is deleted

## Testing

### 1. Check Configuration

The app will log email service status on startup:
- ✅ "Email service initialized successfully"
- ⚠️ "Email configuration not found. Email functionality will be disabled."

### 2. Create Test Session

1. Create a session with players who have email addresses
2. Check server logs for email sending status
3. Verify emails are received and links work

### 3. Troubleshooting

**No emails sent?**
- Check environment variables are set correctly
- Verify SMTP credentials
- Check server logs for error messages

**Emails going to spam?**
- Use a verified domain email address
- Consider using a dedicated email service (SendGrid, Mailgun)
- Add SPF/DKIM records to your domain

## Production Considerations

### Security
- Use environment variables (never commit credentials)
- Use App Passwords for Gmail
- Consider dedicated email service for high volume

### Reliability
- Email sending is non-blocking (session creation succeeds even if emails fail)
- Bulk sending includes rate limiting (100ms delay between emails)
- Comprehensive error logging

### Monitoring
- Check server logs for email sending statistics
- Monitor bounce rates and delivery issues
- Consider email service analytics

## Disabling Email

To disable email functionality:
1. Remove or comment out email environment variables
2. The app will automatically detect missing configuration
3. Session creation will work normally without sending emails

## Support

If you encounter issues:
1. Check server logs for detailed error messages
2. Verify SMTP settings with your email provider
3. Test with a simple email client first
4. Consider using a dedicated email service for production
