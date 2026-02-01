// Quick migration to add default_invite column to existing user_players table
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Adding default_invite column to user_players table...');
    
    // Add the column if it doesn't exist
    await client.query(`
      ALTER TABLE user_players 
      ADD COLUMN IF NOT EXISTS default_invite BOOLEAN DEFAULT TRUE
    `);
    
    console.log('✅ Successfully added default_invite column!');
    
    // Verify
    const result = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'user_players'
      AND column_name = 'default_invite'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Column verified:', result.rows[0]);
    } else {
      console.log('⚠️  Column not found - check if migration ran correctly');
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();