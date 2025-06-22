import db from '../database/index';

// Sample data for seeding
interface SamplePlayer {
  name: string;
}

interface SampleSession {
  name: string;
  scheduled_datetime: string | null;
  playerIds: number[];
}

const samplePlayers: SamplePlayer[] = [
  { name: 'Alice Johnson' },
  { name: 'Bob Smith' },
  { name: 'Charlie Brown' },
  { name: 'Diana Prince' },
  { name: 'Eddie Murphy' }
];

const sampleSessions: SampleSession[] = [
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

async function seedDatabase(): Promise<void> {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data
    await db.run('DELETE FROM session_players');
    await db.run('DELETE FROM sessions');
    await db.run('DELETE FROM players');

    console.log('✅ Cleared existing data');
    
    // Insert sample players
    const playerIds: number[] = [];
    for (const player of samplePlayers) {
      const result = await db.run('INSERT INTO players (name) VALUES (?)', [player.name]);
      const playerId = result.lastID!;
      playerIds.push(playerId);
      console.log(`✅ Created player: ${player.name} (ID: ${playerId})`);
    }
    
    // Insert sample sessions (need a default user ID for created_by)
    const defaultUserId = 1; // Assuming we have a user with ID 1

    for (const session of sampleSessions) {
      const result = await db.run('INSERT INTO sessions (name, scheduled_datetime, created_by) VALUES (?, ?, ?)',
        [session.name, session.scheduled_datetime, defaultUserId]);
      const sessionId = result.lastID!;

      console.log(`✅ Created session: ${session.name} (ID: ${sessionId})`);

      // Add players to session
      for (const playerIndex of session.playerIds) {
        if (playerIds[playerIndex - 1]) {
          await db.run('INSERT INTO session_players (session_id, player_id, status, buy_in, cash_out) VALUES (?, ?, ?, ?, ?)',
            [sessionId, playerIds[playerIndex - 1], 'Invited', 0, 0]);
        }
      }

      console.log(`✅ Added ${session.playerIds.length} players to session: ${session.name}`);
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Created ${playerIds.length} players and ${sampleSessions.length} sessions`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run seeding if this script is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
