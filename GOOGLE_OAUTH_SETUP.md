# 🔐 Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the Poker Night app.

## 📋 Prerequisites

- Google account
- Access to Google Cloud Console

## 🚀 Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: **"Poker Night App"**
4. Click "Create"

### 2. Enable Required APIs

1. Navigate to **APIs & Services** → **Library**
2. Search for and enable:
   - **Google+ API** (or People API)
   - **Google Identity Services API**

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **"External"** user type
3. Fill in the required information:
   - **App name**: `Poker Night`
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
4. Click **"Save and Continue"**
5. On the Scopes page, add these scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
6. Click **"Save and Continue"**
7. Add test users (your email and any others you want to test with)
8. Click **"Save and Continue"**

### 4. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client IDs"**
3. Configure the client:
   - **Application type**: `Web application`
   - **Name**: `Poker Night Web Client`
   - **Authorized JavaScript origins**:
     ```
     http://localhost:5175
     http://localhost:3001
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3001/api/auth/google/callback
     ```
4. Click **"Create"**

### 5. Get Your Credentials

After creating the OAuth client, you'll see a popup with:
- **Client ID** (format: `123456789-abcdefghijk.apps.googleusercontent.com`)
- **Client Secret** (format: `GOCSPX-abcdefghijklmnop`)

**Important**: Copy these values immediately!

### 6. Update Backend Configuration

1. Open `poker-backend/.env`
2. Replace the placeholder values:
   ```env
   GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
   GOOGLE_CLIENT_SECRET=YOUR_ACTUAL_CLIENT_SECRET_HERE
   ```

### 7. Restart the Backend

```bash
cd poker-backend
npm run dev
```

You should see:
```
Auth config loaded: { GOOGLE_CLIENT_ID: 'your-real-id...', hasSecret: true }
Google OAuth strategy configured successfully
```

## 🧪 Testing the Setup

1. Open the app: http://localhost:5175
2. Click **"Sign in with Google"**
3. You should be redirected to Google's OAuth consent screen
4. After authorization, you'll be redirected back to the app
5. Check that you're logged in with your Google account

## 🔒 Security Notes

- **Never commit** your actual credentials to version control
- The `.env` file is already in `.gitignore`
- For production, use environment variables or secure secret management
- Regularly rotate your OAuth credentials

## 🐛 Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Check that your redirect URI exactly matches: `http://localhost:3001/api/auth/google/callback`
- Ensure no trailing slashes or extra characters

### "Error 403: access_blocked"
- Make sure you've added your email as a test user in the OAuth consent screen
- Verify the app is in "Testing" mode for external users

### "Invalid client_id"
- Double-check your `GOOGLE_CLIENT_ID` in the `.env` file
- Ensure there are no extra spaces or characters

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Check the backend logs for authentication errors
3. Verify all URLs match exactly (including ports)
4. Ensure the Google Cloud project has the required APIs enabled

## 🎯 What's Next?

Once OAuth is working:
- Test admin vs player role assignment
- Verify role-based access control
- Test the complete authentication flow
- Set up production OAuth credentials for deployment
