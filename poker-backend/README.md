# 🃏 Poker Night Backend API

A Node.js/Express backend API for the Poker Night application with SQLite database for persistent data storage.

## ✨ Features

- **RESTful API** for players and sessions management
- **SQLite Database** for reliable data persistence
- **CORS Support** for frontend integration
- **Error Handling** with proper HTTP status codes
- **Database Seeding** for quick setup with sample data

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Optional - Seed with sample data:**
   ```bash
   npm run seed
   ```

The API will be running at `http://localhost:3001`

## 📚 API Endpoints

### Players
- `GET /api/players` - Get all players
- `GET /api/players/:id` - Get player by ID
- `POST /api/players` - Create new player
- `PUT /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player

### Sessions
- `GET /api/sessions` - Get all sessions with players
- `GET /api/sessions/:id` - Get session by ID
- `POST /api/sessions` - Create new session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

### Health Check
- `GET /api/health` - API health status

## 🗄️ Database Schema

### Players Table
```sql
CREATE TABLE players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  scheduled_datetime TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Session Players Junction Table
```sql
CREATE TABLE session_players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE CASCADE,
  UNIQUE(session_id, player_id)
);
```

## 🛠 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run seed` - Seed database with sample data

## ☁️ Cloud Deployment

### Railway (Recommended)

1. **Create account** at [railway.app](https://railway.app)
2. **Connect your GitHub repo**
3. **Deploy with one click** - Railway auto-detects Node.js
4. **Environment variables** are automatically set
5. **Custom domain** available on paid plans

### Render

1. **Create account** at [render.com](https://render.com)
2. **Create new Web Service**
3. **Connect GitHub repository**
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. **Environment:** Node.js

### Vercel (Serverless)

1. **Install Vercel CLI:** `npm i -g vercel`
2. **Deploy:** `vercel --prod`
3. **Note:** SQLite files don't persist in serverless - consider PostgreSQL

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3001
NODE_ENV=production
```

## 📁 Project Structure

```
poker-backend/
├── database/
│   ├── db.js              # Database connection and schema
│   └── poker.db           # SQLite database file (auto-created)
├── routes/
│   ├── players.js         # Player API routes
│   └── sessions.js        # Session API routes
├── scripts/
│   └── seed.js           # Database seeding script
├── server.js             # Main application entry point
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🔄 Migration from localStorage

The frontend automatically switches from localStorage to API calls. No manual migration needed - just start the backend and refresh the frontend.

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Database locked:**
```bash
# Remove database file and restart
rm database/poker.db
npm run dev
```

**CORS errors:**
- Ensure backend is running on port 3001
- Check frontend API_BASE_URL in `src/services/api.js`
