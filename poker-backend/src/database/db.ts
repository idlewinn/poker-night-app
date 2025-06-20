import sqlite3 from 'sqlite3';
import path from 'path';

// Create database directory if it doesn't exist
const dbPath = path.join(__dirname, '../../database/poker.db');

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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err: Error | null) => {
    if (err) {
      console.error('Error creating sessions table:', err.message);
    } else {
      console.log('Sessions table ready');
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
