# Development Authentication Bypass

## What It Does

Automatically authenticates you as the first user in the database when running locally, so you can test without going through Google OAuth.

## How It Works

### Backend (`poker-backend/src/middleware/auth.ts`)
- Checks for `x-dev-bypass: true` header
- Only works when `NODE_ENV !== 'production'`
- Auto-authenticates as the first user in the database
- Logs: `🔓 Dev mode: Auto-authenticated as <email>`

### Frontend (`poker-player-manager/src/services/api.ts`)
- Automatically adds `x-dev-bypass: true` header when `import.meta.env.DEV` is true
- Happens on every API request
- No changes needed to your code

### Environment Configuration
- Backend `.env` file set to `NODE_ENV=development` for local testing
- Frontend runs with Vite's dev mode (`npm run dev`)

## Usage

Just open http://localhost:5173 in your browser - you'll be automatically logged in!

## Security

- ✅ **Only works locally:** Requires `NODE_ENV !== 'production'` AND dev header
- ✅ **Production safe:** Production builds don't include `import.meta.env.DEV`
- ✅ **Railway deployment:** Uses `NODE_ENV=production`, so bypass is disabled

## Reverting for Production Testing

If you want to test the real auth flow locally:

1. Remove `x-dev-bypass` header from frontend API calls
2. Or set `NODE_ENV=production` in backend `.env`
3. Set up Google OAuth credentials (see GOOGLE_OAUTH_SETUP.md)

---

**Created:** February 1, 2026  
**Purpose:** Simplify local development and testing
