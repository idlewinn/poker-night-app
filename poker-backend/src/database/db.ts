import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Database file path - use /tmp for Railway production
const getDatabasePath = () => {
  if (process.env.NODE_ENV === 'production') {
    // Railway: use /tmp directory which is writable
    return '/tmp/poker.db';
  } else {
    // Development: use local database directory
    const dbDir = path.join(__dirname, '../../database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    return path.join(dbDir, 'poker.db');
  }
};

const dbPath = getDatabasePath();

// Create database connection
const db = new sqlite3.Database(dbPath, (err: Error | null) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase(): void {
  // Create players table
  db.run(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err: Error | null) => {
    if (err) {
      console.error('Error creating players table:', err.message);
    } else {
      console.log('Players table ready');
      // Add email column if it doesn't exist (for existing databases)
      db.run(`ALTER TABLE players ADD COLUMN email TEXT`, (alterErr: Error | null) => {
        if (alterErr && !alterErr.message.includes('duplicate column name')) {
          console.error('Error adding email column:', alterErr.message);
        } else if (!alterErr) {
          console.log('Email column added to players table');
        }
      });
    }
  });

  // Create sessions table
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      scheduled_datetime TEXT,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
    )
  `, (err: Error | null) => {
    if (err) {
      console.error('Error creating sessions table:', err.message);
    } else {
      console.log('Sessions table ready');

      // Add created_by column if it doesn't exist (for existing databases)
      db.run(`ALTER TABLE sessions ADD COLUMN created_by INTEGER`, (alterErr: Error | null) => {
        if (alterErr && !alterErr.message.includes('duplicate column name')) {
          console.error('Error adding created_by column:', alterErr.message);
        }
      });
    }
  });

  // Create session_players junction table for many-to-many relationship
  db.run(`
    CREATE TABLE IF NOT EXISTS session_players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      player_id INTEGER NOT NULL,
      status TEXT DEFAULT 'Invited' CHECK (status IN ('Invited', 'In', 'Out', 'Maybe', 'Attending but not playing')),
      buy_in DECIMAL(10,2) DEFAULT 0.00,
      cash_out DECIMAL(10,2) DEFAULT 0.00,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE,
      FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE CASCADE,
      UNIQUE(session_id, player_id)
    )
  `, (err: Error | null) => {
    if (err) {
      console.error('Error creating session_players table:', err.message);
    } else {
      console.log('Session_players table ready');

      // Add columns if they don't exist (for existing databases)
      const alterQueries = [
        `ALTER TABLE session_players ADD COLUMN status TEXT DEFAULT 'Invited' CHECK (status IN ('Invited', 'In', 'Out', 'Maybe', 'Attending but not playing'))`,
        `ALTER TABLE session_players ADD COLUMN buy_in DECIMAL(10,2) DEFAULT 0.00`,
        `ALTER TABLE session_players ADD COLUMN cash_out DECIMAL(10,2) DEFAULT 0.00`
      ];

      alterQueries.forEach((query, index) => {
        db.run(query, (alterErr: Error | null) => {
          if (alterErr && !alterErr.message.includes('duplicate column name')) {
            console.error(`Error adding column ${index + 1}:`, alterErr.message);
          } else if (!alterErr) {
            console.log(`Column ${index + 1} added to session_players table`);
          }
        });
      });
    }
  });

  // Create seating_charts table
  db.run(`
    CREATE TABLE IF NOT EXISTS seating_charts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      number_of_tables INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
    )
  `, (err: Error | null) => {
    if (err) {
      console.error('Error creating seating_charts table:', err.message);
    } else {
      console.log('Seating_charts table ready');
    }
  });

  // Create seating_assignments table
  db.run(`
    CREATE TABLE IF NOT EXISTS seating_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seating_chart_id INTEGER NOT NULL,
      player_id INTEGER NOT NULL,
      table_number INTEGER NOT NULL,
      seat_position INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seating_chart_id) REFERENCES seating_charts (id) ON DELETE CASCADE,
      FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE CASCADE
    )
  `, (err: Error | null) => {
    if (err) {
      console.error('Error creating seating_assignments table:', err.message);
    } else {
      console.log('Seating_assignments table ready');
    }
  });

  // Create users table for authentication
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      google_id TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    )
  `, (err: Error | null) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table ready');
    }
  });

  // Create user_players junction table to track which users have added which players
  db.run(`
    CREATE TABLE IF NOT EXISTS user_players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      player_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE CASCADE,
      UNIQUE(user_id, player_id)
    )
  `, (err: Error | null) => {
    if (err) {
      console.error('Error creating user_players table:', err.message);
    } else {
      console.log('User_players table ready');
    }
  });

  // Create user_metrics table for tracking user activity and engagement
  db.run(`
    CREATE TABLE IF NOT EXISTS user_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      player_email TEXT,
      session_id INTEGER,
      event_type TEXT NOT NULL,
      event_data TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
      FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
    )
  `, (err: Error | null) => {
    if (err) {
      console.error('Error creating user_metrics table:', err.message);
    } else {
      console.log('User_metrics table ready');
    }
  });

  // Create indexes for user_metrics table
  const metricsIndexes = [
    'CREATE INDEX IF NOT EXISTS idx_user_metrics_user_id ON user_metrics(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_metrics_session_id ON user_metrics(session_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_metrics_event_type ON user_metrics(event_type)',
    'CREATE INDEX IF NOT EXISTS idx_user_metrics_created_at ON user_metrics(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_user_metrics_player_email ON user_metrics(player_email)'
  ];

  metricsIndexes.forEach((indexQuery, index) => {
    db.run(indexQuery, (err: Error | null) => {
      if (err) {
        console.error(`Error creating metrics index ${index + 1}:`, err.message);
      }
    });
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err: Error | null) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

export default db;
