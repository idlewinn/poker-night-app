import dotenv from 'dotenv';

dotenv.config();

// Determine which database to use based on environment
const usePostgres = process.env.DATABASE_URL && process.env.NODE_ENV === 'production';

console.log(`Using database: ${usePostgres ? 'PostgreSQL' : 'SQLite'}`);

if (usePostgres) {
  // Use PostgreSQL in production
  console.log('Initializing PostgreSQL database...');
  const { initializePostgresDatabase } = require('./postgres');
  const pool = require('./postgres').default;
  
  // Initialize PostgreSQL
  initializePostgresDatabase().catch((error: any) => {
    console.error('Failed to initialize PostgreSQL:', error);
    process.exit(1);
  });
  
  module.exports = pool;
} else {
  // Use SQLite for development
  console.log('Initializing SQLite database...');
  const db = require('./db').default;
  module.exports = db;
}

// Export the database instance
export default module.exports;
