# 🃏 Poker Night - Full Stack Application

A modern full-stack poker session management application built with React, Node.js, Express, and SQLite.

## 📁 Project Structure

```
poker-night/
├── poker-player-manager/    # React frontend (TypeScript)
│   ├── src/
│   ├── public/
│   └── package.json
├── poker-backend/           # Node.js API backend (TypeScript)
│   ├── src/
│   ├── database/
│   └── package.json
└── README.md               # This file
```

## ✨ Features

### Frontend (React + TypeScript)
- 🎨 **Modern UI** with Material-UI components
- 📱 **Responsive design** for desktop and mobile
- 🗂️ **Tab navigation** between Players and Sessions
- 📅 **Date/time scheduling** for poker sessions
- ✏️ **Session editing** with player management
- 🔄 **Real-time updates** with API integration

### Backend (Node.js + TypeScript)
- 🚀 **RESTful API** with Express.js
- 🗄️ **SQLite database** for data persistence
- 🔗 **Relational data** with proper foreign keys
- 🛡️ **Type safety** with TypeScript
- 📊 **Database seeding** for quick setup
- ☁️ **Cloud deployment** ready

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd poker-night
   ```

2. **Install dependencies for both projects:**
   ```bash
   # Backend
   cd poker-backend
   npm install
   
   # Frontend
   cd ../poker-player-manager
   npm install
   ```

3. **Start the backend server:**
   ```bash
   cd poker-backend
   npm run dev
   ```

4. **Start the frontend (in a new terminal):**
   ```bash
   cd poker-player-manager
   npm run dev
   ```

5. **Optional - Seed database with sample data:**
   ```bash
   cd poker-backend
   npm run seed
   ```

### Access the Application
- **Frontend:** http://localhost:5174
- **Backend API:** http://localhost:3001
- **API Health Check:** http://localhost:3001/api/health

## 🛠️ Development Scripts

### Backend (`poker-backend/`)
- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

### Frontend (`poker-player-manager/`)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📊 Database Schema

### Players
- `id` - Primary key
- `name` - Player name (unique)
- `created_at` - Timestamp

### Sessions
- `id` - Primary key
- `name` - Session name
- `scheduled_datetime` - When session is scheduled (optional)
- `created_at` - Timestamp

### Session Players (Junction Table)
- `session_id` - Foreign key to sessions
- `player_id` - Foreign key to players

## 🔌 API Endpoints

### Players
- `GET /api/players` - Get all players
- `POST /api/players` - Create player
- `PUT /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player

### Sessions
- `GET /api/sessions` - Get all sessions with players
- `POST /api/sessions` - Create session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

## ☁️ Deployment

### Backend Deployment Options
- **Railway** (recommended) - One-click deployment
- **Render** - Free tier available
- **Vercel** - Serverless functions

### Frontend Deployment Options
- **Vercel** - Automatic deployments from Git
- **Netlify** - Static site hosting
- **GitHub Pages** - Free static hosting

## 🔧 Environment Variables

### Backend (`.env`)
```env
PORT=3001
NODE_ENV=production
```

### Frontend
Update `src/services/api.ts` with your deployed backend URL.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Future Enhancements

- [ ] User authentication and authorization
- [ ] Real-time updates with WebSockets
- [ ] Mobile app with React Native
- [ ] Advanced poker statistics
- [ ] Tournament bracket management
- [ ] Email notifications for scheduled sessions
