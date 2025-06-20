const db = require('../database/db');

// Sample data for seeding
const samplePlayers = [
  { name: 'Alice Johnson' },
  { name: 'Bob Smith' },
  { name: 'Charlie Brown' },
  { name: 'Diana Prince' },
  { name: 'Eddie Murphy' }
];

const sampleSessions = [
  {
    name: 'Friday Night Poker',
    scheduled_datetime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
    playerIds: [1, 2, 3] // Will be mapped after players are created
  },
  {
    name: 'Weekend Tournament',
    scheduled_datetime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // Two weeks from now
    playerIds: [2, 3, 4, 5]
  },
  {
    name: 'Monthly Championship',
    scheduled_datetime: null, // No scheduled time
    playerIds: [1, 3, 5]
  }
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Clear existing data
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM session_players', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM sessions', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM players', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Cleared existing data');
    
    // Insert sample players
    const playerIds = [];
    for (const player of samplePlayers) {
      const playerId = await new Promise((resolve, reject) => {
        db.run('INSERT INTO players (name) VALUES (?)', [player.name], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });
      playerIds.push(playerId);
      console.log(`✅ Created player: ${player.name} (ID: ${playerId})`);
    }
    
    // Insert sample sessions
    for (const session of sampleSessions) {
      const sessionId = await new Promise((resolve, reject) => {
        db.run('INSERT INTO sessions (name, scheduled_datetime) VALUES (?, ?)', 
          [session.name, session.scheduled_datetime], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });
      
      console.log(`✅ Created session: ${session.name} (ID: ${sessionId})`);
      
      // Add players to session
      for (const playerIndex of session.playerIds) {
        if (playerIds[playerIndex - 1]) {
          await new Promise((resolve, reject) => {
            db.run('INSERT INTO session_players (session_id, player_id) VALUES (?, ?)', 
              [sessionId, playerIds[playerIndex - 1]], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        }
      }
      
      console.log(`✅ Added ${session.playerIds.length} players to session: ${session.name}`);
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Created ${playerIds.length} players and ${sampleSessions.length} sessions`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
      process.exit(0);
    });
  }
}

// Run seeding if this script is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
