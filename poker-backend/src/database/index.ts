import dotenv from 'dotenv';

dotenv.config();

// Determine which database to use based on environment
const usePostgres = !!process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql');

console.log(`Using database: ${usePostgres ? 'PostgreSQL' : 'SQLite'}`);

if (usePostgres) {
  // Use PostgreSQL in production
  const { initializePostgresDatabase } = require('./postgres');

  // Initialize PostgreSQL
  initializePostgresDatabase().catch((error: any) => {
    console.error('Failed to initialize PostgreSQL:', error);
    console.log('Falling back to SQLite...');
  });
}

// Export the database adapter (provides consistent interface)
import adapter from './adapter';
export default adapter;
