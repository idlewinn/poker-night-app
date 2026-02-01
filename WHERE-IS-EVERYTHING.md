# Where Is Everything? Quick Reference

**Created:** February 1, 2026  
**Purpose:** Find all features quickly

---

## 🆕 **New Test Page**

**URL:** http://localhost:5173/test

**What it shows:**
- Email invite template preview
- Email reminder template preview
- Invite response page (what players see when they click the email link)

**Access:** Available when logged in (protected route)

---

## 💣 **Bomb Pot Timer**

**Location 1: Session Page Tabs**
1. Go to any poker session
2. Look for the tabs: "Winnings | Seating | **Bomb Pot**"
3. Click "Bomb Pot" tab
4. Full timer interface with controls and settings

**Location 2: Persistent Timer Bar**
- Appears on session page when timer has been used
- Visible on all tabs (Winnings, Seating, Bomb Pot)
- Shows countdown with quick controls
- Only visible to session owners

**Location 3: Dashboard View**
- Click "Dashboard View" button on session page
- Timer card in 3-column grid layout
- Large countdown display with controls

---

## 🎰 **Dashboard View**

**How to access:**
1. Go to any poker session (you must be the session owner)
2. Click the **"Dashboard View"** button (top right, next to user menu)
3. Full-screen dashboard with:
   - Player buy-ins (live updating)
   - Bomb pot timer
   - Seating chart

**Who can see it:** Only session owners (created the session)

**Features:**
- Dark navy background
- 3-column grid layout
- Auto-refreshes every minute
- "Exit Dashboard" button to return to normal view

---

## 🎨 **Dark Mode Toggle**

**Location:** User menu (top right)
1. Click your avatar
2. Select "Dark Mode" or "Light Mode"
3. Theme persists across sessions

---

## 📊 **Analytics**

**Location:** User menu → Analytics
**Requirement:** Must have hosted at least one past session

---

## 🎯 **Design Status**

### What Changed (Phase 1-4):
✅ Color palette (subtle poker green, gold accents)
✅ Typography (better fonts, spacing)
✅ Card shadows and depth
✅ Dashboard styling
✅ Dark mode
✅ Text contrast improvements

### What Stayed the Same:
- Overall layout structure
- Component organization
- Information hierarchy
- Tab system
- Card-based design

### Why It Looks Similar:
The theme redesign focused on **colors, typography, and polish**, not a complete UI restructure. The bones are the same, but the skin is new.

---

## 🎨 **Want More Dramatic Design Changes?**

If you want the design to look more different, we could:

### Option A: Modern Card Redesign
- Larger, more prominent cards
- Different layout patterns
- More whitespace
- Glassmorphism effects

### Option B: Poker Table Theme
- Actual felt texture backgrounds (subtle)
- Card-shaped elements
- Chip stack visualizations
- More poker imagery

### Option C: Dashboard-First Design
- Make dashboard the default view
- Redesign session list as cards
- Add data visualizations
- More charts and graphs

### Option D: Mobile-First Redesign
- Bottom navigation
- Swipe gestures
- Larger touch targets
- Different mobile layout

---

## 🔍 **Troubleshooting**

### "I don't see the Dashboard View button"
- ✓ Are you logged in?
- ✓ Are you on a session page? (not the main sessions list)
- ✓ Did you create this session? (only owners see it)

### "I don't see the Bomb Pot tab"
- ✓ Are you logged in?
- ✓ Are you on a session page?
- ✓ Did you create this session? (only owners see bomb pot tab)

### "I don't see the timer bar"
- ✓ Have you started the timer at least once?
- ✓ The timer bar only appears after it's been activated
- ✓ Go to Bomb Pot tab and click "Start Timer"

### "Dark mode doesn't work"
- ✓ Click user avatar (top right)
- ✓ Select "Dark Mode" from dropdown
- ✓ Refresh page if needed

---

## 📝 **Quick Access URLs** (when running locally)

```
Main App:           http://localhost:5173
Dev Login:          http://localhost:3001/api/auth/dev-login
Test Page:          http://localhost:5173/test
Analytics:          http://localhost:5173/analytics
Session Example:    http://localhost:5173/sessions/1
Dashboard Example:  http://localhost:5173/sessions/1/dashboard
```

---

## 🎯 **Feature Visibility Matrix**

| Feature | Location | Who Can See | How to Access |
|---------|----------|-------------|---------------|
| Bomb Pot Timer | Session tabs | Session owner | Click "Bomb Pot" tab |
| Dashboard View | Session page | Session owner | Click "Dashboard View" button |
| Dark Mode | User menu | Everyone | Click avatar → Dark Mode |
| Analytics | User menu | Users with past sessions | Click avatar → Analytics |
| Test Page | Direct URL | Logged in users | Navigate to /test |
| Seating Charts | Session tabs | Everyone | Click "Seating" tab |

---

**Still can't find something? Let me know and I'll help locate it!**

*Created by Ollie - AI Assistant*  
*February 1, 2026*
