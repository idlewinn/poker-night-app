import db from '../database/index';

// Production migration script to add missing columns
async function migrateProduction(): Promise<void> {
  console.log('🚀 Starting production database migration...');
  
  try {
    // Check if we're using PostgreSQL
    const isPostgreSQL = process.env.DATABASE_URL?.startsWith('postgresql');
    console.log(`📊 Database type: ${isPostgreSQL ? 'PostgreSQL' : 'SQLite'}`);

    // Add game_type column to sessions table
    console.log('📊 Adding game_type column to sessions table...');
    try {
      if (isPostgreSQL) {
        await db.run(`
          ALTER TABLE sessions 
          ADD COLUMN game_type TEXT DEFAULT 'cash' 
          CHECK (game_type IN ('cash', 'tournament'))
        `);
      } else {
        await db.run(`
          ALTER TABLE sessions 
          ADD COLUMN game_type TEXT DEFAULT 'cash' CHECK (game_type IN ('cash', 'tournament'))
        `);
      }
      console.log('✅ Added game_type column to sessions');
    } catch (error: any) {
      if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
        console.log('ℹ️  game_type column already exists in sessions');
      } else {
        throw error;
      }
    }

    // Add default_invite column to user_players table
    console.log('👥 Adding default_invite column to user_players table...');
    try {
      if (isPostgreSQL) {
        await db.run(`
          ALTER TABLE user_players 
          ADD COLUMN default_invite BOOLEAN DEFAULT TRUE
        `);
      } else {
        await db.run(`
          ALTER TABLE user_players 
          ADD COLUMN default_invite BOOLEAN DEFAULT 1
        `);
      }
      console.log('✅ Added default_invite column to user_players');
    } catch (error: any) {
      if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
        console.log('ℹ️  default_invite column already exists in user_players');
      } else {
        throw error;
      }
    }

    // Update existing sessions to have default game_type of 'cash'
    console.log('🎯 Setting default game_type for existing sessions...');
    const sessionResult = await db.run(`
      UPDATE sessions 
      SET game_type = 'cash' 
      WHERE game_type IS NULL
    `);
    console.log(`✅ Updated ${sessionResult.changes || 0} sessions with default game_type`);

    // Update existing user_players to have default_invite = true
    console.log('📧 Setting default_invite = true for existing players...');
    const playerResult = await db.run(`
      UPDATE user_players 
      SET default_invite = ${isPostgreSQL ? 'TRUE' : '1'}
      WHERE default_invite IS NULL
    `);
    console.log(`✅ Updated ${playerResult.changes || 0} user_players with default_invite = true`);

    // Verify the changes
    console.log('\n📋 Verifying migration...');
    
    // Check sessions table
    const sessionSample = await db.get(`
      SELECT id, name, game_type 
      FROM sessions 
      LIMIT 1
    `);
    
    if (sessionSample) {
      console.log(`✅ Sessions table: ID ${sessionSample.id}, game_type: ${sessionSample.game_type}`);
    } else {
      console.log('ℹ️  No sessions found to verify');
    }

    // Check user_players table
    const playerSample = await db.get(`
      SELECT id, user_id, player_id, default_invite 
      FROM user_players 
      LIMIT 1
    `);
    
    if (playerSample) {
      console.log(`✅ User_players table: ID ${playerSample.id}, default_invite: ${playerSample.default_invite}`);
    } else {
      console.log('ℹ️  No user_players found to verify');
    }

    // Show summary
    const sessionCount = await db.get('SELECT COUNT(*) as count FROM sessions');
    const userPlayerCount = await db.get('SELECT COUNT(*) as count FROM user_players');
    
    console.log('\n🎉 Production migration completed successfully!');
    console.log(`📊 Total sessions: ${sessionCount.count}`);
    console.log(`👥 Total user_players: ${userPlayerCount.count}`);
    console.log('\n✨ New features ready:');
    console.log('  🎲 Sessions can now be marked as "cash" or "tournament"');
    console.log('  📧 Players can be configured for default invite inclusion');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration
if (require.main === module) {
  migrateProduction()
    .then(() => {
      console.log('🎯 Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

export default migrateProduction;
