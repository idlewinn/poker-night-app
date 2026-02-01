# 🧪 Deployment Testing Workflow

**Run this complete workflow after every deployment to verify end-to-end functionality.**

---

## Pre-Test Checklist

- [ ] Backend health check passes
- [ ] Frontend loads without errors
- [ ] Database connection established (check Railway logs)
- [ ] Environment variables configured correctly

---

## Full Workflow Test

### 1. Authentication ✅
- [ ] Navigate to production URL
- [ ] Click "Sign in with Google"
- [ ] OAuth redirect completes successfully
- [ ] User profile displays correctly (name + avatar)

### 2. Player Management ✅
- [ ] View existing players list
- [ ] Click "Add Player"
- [ ] Fill in player details (name + email)
- [ ] Submit form
- [ ] Verify player appears in list with correct information
- [ ] Test edit player functionality
- [ ] Test search/filter functionality

### 3. Session Creation ✅
- [ ] Navigate to "Sessions" tab
- [ ] Click "Create Session"
- [ ] Fill in session details:
  - Session name (or use default)
  - Game type (Cash/Tournament)
  - Date & time
  - Timezone
- [ ] Select at least one player
- [ ] Submit form
- [ ] Verify session appears in "Upcoming Sessions"
- [ ] Check all session details are correct

### 4. Session Management ✅
- [ ] Click on created session
- [ ] Verify session details page loads
- [ ] Test adding more players to session
- [ ] Test removing players from session
- [ ] Test editing session details
- [ ] Test status changes (Invited → Confirmed → In/Out)

### 5. Financial Tracking (if applicable) ✅
- [ ] Record buy-ins
- [ ] Record cash-outs
- [ ] Verify calculations are correct
- [ ] Check session summary displays properly

### 6. Cross-Browser Testing ✅
- [ ] Test in Chrome
- [ ] Test in Safari
- [ ] Test in Firefox
- [ ] Test on mobile devices

---

## Backend API Testing

```bash
# Health check
curl -s https://poker-night-app-production-985f.up.railway.app/api/health | jq

# Test authentication endpoint (should return 401)
curl -s https://poker-night-app-production-985f.up.railway.app/api/players

# Check database connection (via logs)
railway logs --service poker-night-app-production-985f | grep -i "database\|postgres\|connected"
```

---

## Console Checks

Open browser DevTools and verify:
- [ ] No JavaScript errors in console
- [ ] No failed API requests (check Network tab)
- [ ] No React warnings/errors
- [ ] Proper error handling for failed requests

---

## Performance Checks

- [ ] Frontend loads in < 3 seconds
- [ ] API responses in < 1 second
- [ ] No memory leaks (check Performance tab after extended use)
- [ ] Smooth UI interactions (no lag)

---

## Deployment-Specific Tests

### After Database Schema Changes
- [ ] Verify migrations ran successfully
- [ ] Check all tables/columns exist
- [ ] Test CRUD operations on affected tables
- [ ] Verify existing data integrity

### After Environment Variable Changes
- [ ] Confirm variables updated in Railway
- [ ] Service redeployed automatically
- [ ] New values reflected in application behavior

### After OAuth Configuration Changes
- [ ] Test login flow completely
- [ ] Verify redirect URIs work
- [ ] Check callback handling
- [ ] Confirm user session persists

---

## Rollback Plan

If critical issues found:

1. **Frontend issues:** Revert Vercel deployment via dashboard
2. **Backend issues:** Rollback Railway deployment to previous version
3. **Database issues:** Restore from backup or run reverse migration

---

## Test Report Template

```
Date: YYYY-MM-DD
Deployment: [describe what changed]
Tester: [name]

✅ Passed:
- [list passing tests]

❌ Failed:
- [list failures with details]

🐛 Bugs Found:
- [describe any bugs]

📝 Notes:
- [additional observations]
```

---

## Automated Testing (Future)

Consider implementing:
- [ ] Unit tests for backend endpoints
- [ ] Integration tests for database operations
- [ ] E2E tests with Playwright/Cypress
- [ ] CI/CD pipeline with automated test runs
