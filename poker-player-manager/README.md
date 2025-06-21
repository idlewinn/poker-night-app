# 🃏 Poker Night

A modern React application for managing poker night players. Built with React 18, Vite, and modern CSS for a smooth and responsive user experience.

## ✨ Features

- **Add Players**: Easily add new players to your poker night
- **Remove Players**: Remove players with a single click
- **Rename Players**: Edit player names inline with keyboard shortcuts
- **Persistent Storage**: Player data is automatically saved to localStorage
- **Duplicate Prevention**: Prevents adding players with duplicate names
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd poker-night
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## 🛠 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint to check code quality

## 🏗 Project Structure

```
src/
├── components/
│   ├── AddPlayerForm.jsx    # Form for adding new players
│   ├── PlayerList.jsx       # List container component
│   └── PlayerItem.jsx       # Individual player component
├── App.jsx                  # Main application component
├── App.css                  # Application styles
├── index.css                # Global styles
└── main.jsx                 # Application entry point
```

## 🎯 How to Use

1. **Adding Players**: Type a player name in the input field and click "Add Player" or press Enter
2. **Editing Players**: Click the ✏️ button next to a player's name to edit it inline
3. **Removing Players**: Click the 🗑️ button to remove a player
4. **Keyboard Shortcuts**:
   - Press Enter to save changes when editing
   - Press Escape to cancel editing

## 🔧 Technical Details

- **React 18** with modern hooks (useState, useEffect)
- **Vite** for fast development and building
- **localStorage** for data persistence
- **CSS Grid** and **Flexbox** for responsive layouts
- **ESLint** for code quality

## 📱 Browser Support

This application works in all modern browsers that support ES6+ features.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
