import dotenv from 'dotenv';

dotenv.config();

// Debug environment variables
console.log('Database Environment Check:');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`DATABASE_URL present: ${!!process.env.DATABASE_URL}`);
console.log(`DATABASE_URL starts with postgresql: ${process.env.DATABASE_URL?.startsWith('postgresql')}`);

// Determine which database to use based on environment
const usePostgres = !!process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql');

console.log(`🗄️ Using database: ${usePostgres ? 'PostgreSQL' : 'SQLite'}`);

if (usePostgres) {
  // Use PostgreSQL in production
  console.log('🐘 Initializing PostgreSQL database...');
  const { initializePostgresDatabase } = require('./postgres');
  const pool = require('./postgres').default;

  // Initialize PostgreSQL
  initializePostgresDatabase().catch((error: any) => {
    console.error('❌ Failed to initialize PostgreSQL:', error);
    console.log('🔄 Falling back to SQLite...');
    const db = require('./db').default;
    module.exports = db;
  });

  module.exports = pool;
} else {
  // Use SQLite for development
  console.log('📁 Initializing SQLite database...');
  const db = require('./db').default;
  module.exports = db;
}

// Export the database instance
export default module.exports;
