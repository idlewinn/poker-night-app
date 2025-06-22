import dotenv from 'dotenv';

dotenv.config();

// Determine which database to use based on environment
const usePostgres = !!process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql');

console.log(`Using database: ${usePostgres ? 'PostgreSQL' : 'SQLite'}`);

if (usePostgres) {
  // Use PostgreSQL in production
  const { initializePostgresDatabase } = require('./postgres');
  const pool = require('./postgres').default;

  // Initialize PostgreSQL
  initializePostgresDatabase().catch((error: any) => {
    console.error('Failed to initialize PostgreSQL:', error);
    console.log('Falling back to SQLite...');
    const db = require('./db').default;
    module.exports = db;
  });

  module.exports = pool;
} else {
  // Use SQLite for development
  const db = require('./db').default;
  module.exports = db;
}

// Export the database instance
export default module.exports;
