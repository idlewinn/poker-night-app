import db from '../database/index';
import * as fs from 'fs';
import * as path from 'path';

// Interface for parsed CSV data
interface SessionData {
  date: string;
  players: {
    name: string;
    buyIn: number;
    netProfit: number;
    cashOut: number;
  }[];
}

// Script to import historical poker session data from CSV files
async function importHistoricalData(): Promise<void> {
  console.log('🎯 Starting historical data import...');
  
  try {
    // You'll need to create these CSV files in the scripts directory
    const buyInsFile = path.join(__dirname, 'buyins.csv');
    const netProfitsFile = path.join(__dirname, 'net_profits.csv');
    
    console.log('📁 Reading CSV files...');
    
    // Check if files exist
    if (!fs.existsSync(buyInsFile)) {
      console.error(`❌ Buy-ins file not found: ${buyInsFile}`);
      console.log('📝 Please create buyins.csv in the scripts directory with your buy-in data');
      return;
    }
    
    if (!fs.existsSync(netProfitsFile)) {
      console.error(`❌ Net profits file not found: ${netProfitsFile}`);
      console.log('📝 Please create net_profits.csv in the scripts directory with your net profit data');
      return;
    }
    
    // Read and parse CSV files
    const buyInsContent = fs.readFileSync(buyInsFile, 'utf-8');
    const netProfitsContent = fs.readFileSync(netProfitsFile, 'utf-8');
    
    const buyInsLines = buyInsContent.split('\n').filter(line => line.trim());
    const netProfitsLines = netProfitsContent.split('\n').filter(line => line.trim());
    
    console.log(`📊 Found ${buyInsLines.length} lines in buy-ins file`);
    console.log(`📊 Found ${netProfitsLines.length} lines in net profits file`);
    
    // Parse headers (dates)
    const buyInsHeaders = buyInsLines[0].split(',').slice(1); // Skip first column (player names)
    const netProfitsHeaders = netProfitsLines[0].split(',').slice(1);
    
    console.log(`📅 Found ${buyInsHeaders.length} sessions in buy-ins data`);
    console.log(`📅 Found ${netProfitsHeaders.length} sessions in net profits data`);
    
    // Verify headers match
    if (buyInsHeaders.length !== netProfitsHeaders.length) {
      console.error('❌ Mismatch in number of sessions between files');
      return;
    }
    
    // Parse session data
    const sessions: SessionData[] = [];
    
    for (let i = 0; i < buyInsHeaders.length; i++) {
      const date = buyInsHeaders[i].trim();
      if (!date || date === '') continue;
      
      console.log(`📅 Processing session: ${date}`);
      
      const sessionData: SessionData = {
        date,
        players: []
      };
      
      // Process each player row
      for (let j = 1; j < buyInsLines.length; j++) {
        const buyInRow = buyInsLines[j].split(',');
        const netProfitRow = netProfitsLines[j].split(',');
        
        const playerName = buyInRow[0].trim();
        if (!playerName || playerName === '') continue;
        
        const buyInValue = buyInRow[i + 1]?.trim();
        const netProfitValue = netProfitRow[i + 1]?.trim();
        
        // Skip if no data for this session
        if (!buyInValue || buyInValue === '' || !netProfitValue || netProfitValue === '') continue;
        
        const buyIn = parseFloat(buyInValue);
        const netProfit = parseFloat(netProfitValue);
        
        // Skip if invalid numbers
        if (isNaN(buyIn) || isNaN(netProfit)) continue;
        
        const cashOut = buyIn + netProfit;
        
        sessionData.players.push({
          name: playerName,
          buyIn,
          netProfit,
          cashOut
        });
      }
      
      if (sessionData.players.length > 0) {
        sessions.push(sessionData);
      }
    }
    
    console.log(`✅ Parsed ${sessions.length} sessions with data`);
    
    // Get the user ID (assuming you want to assign these to the first user)
    const users = await db.all('SELECT * FROM users ORDER BY id LIMIT 1');
    if (users.length === 0) {
      console.error('❌ No users found. Please make sure you have logged in at least once.');
      return;
    }
    
    const userId = users[0].id;
    console.log(`👤 Assigning sessions to user: ${users[0].email} (ID: ${userId})`);
    
    // Import sessions
    let importedSessions = 0;
    let importedPlayers = 0;
    
    for (const sessionData of sessions) {
      console.log(`\n🎲 Importing session: ${sessionData.date}`);
      
      // Parse date and create ISO string
      const sessionDate = parseDate(sessionData.date);
      if (!sessionDate) {
        console.warn(`⚠️  Skipping session with invalid date: ${sessionData.date}`);
        continue;
      }
      
      // Create session
      const sessionResult = await db.run(`
        INSERT INTO sessions (name, scheduled_datetime, created_by, game_type, created_at)
        VALUES (?, ?, ?, ?, ?)
      `, [
        'Poker Night',
        sessionDate.toISOString(),
        userId,
        'cash', // Assuming all historical sessions were cash games
        sessionDate.toISOString()
      ]);
      
      const sessionId = sessionResult.lastID;
      console.log(`  📝 Created session ID: ${sessionId}`);
      
      // Process players
      for (const playerData of sessionData.players) {
        // Check if player exists
        let player = await db.get('SELECT * FROM players WHERE name = ?', [playerData.name]);
        
        if (!player) {
          // Create new player
          const playerResult = await db.run('INSERT INTO players (name) VALUES (?)', [playerData.name]);
          const playerId = playerResult.lastID;
          
          // Add user-player relationship
          await db.run('INSERT INTO user_players (user_id, player_id, default_invite) VALUES (?, ?, ?)', [userId, playerId, 1]);
          
          player = { id: playerId, name: playerData.name };
          importedPlayers++;
          console.log(`    👤 Created player: ${playerData.name} (ID: ${playerId})`);
        }
        
        // Add player to session
        await db.run(`
          INSERT INTO session_players (session_id, player_id, status, buy_in, cash_out)
          VALUES (?, ?, ?, ?, ?)
        `, [
          sessionId,
          player.id,
          'In', // All historical players were 'In'
          playerData.buyIn,
          playerData.cashOut
        ]);
        
        console.log(`    💰 Added ${playerData.name}: $${playerData.buyIn} → $${playerData.cashOut} (${playerData.netProfit >= 0 ? '+' : ''}$${playerData.netProfit})`);
      }
      
      importedSessions++;
    }
    
    console.log('\n🎉 Historical data import completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`  📅 Sessions imported: ${importedSessions}`);
    console.log(`  👥 New players created: ${importedPlayers}`);
    console.log(`  💰 Total session-player records created: ${sessions.reduce((sum, s) => sum + s.players.length, 0)}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

// Helper function to parse various date formats
function parseDate(dateStr: string): Date | null {
  try {
    // Handle formats like "10/1/2022", "11/05/2022", "2/8", "3/22"
    const parts = dateStr.split('/');
    
    if (parts.length === 2) {
      // Format like "2/8" - assume current year or 2025
      const month = parseInt(parts[0]);
      const day = parseInt(parts[1]);
      const year = 2025; // Adjust as needed
      
      const date = new Date(year, month - 1, day, 19, 0, 0); // 7 PM
      return date;
    } else if (parts.length === 3) {
      // Format like "10/1/2022"
      const month = parseInt(parts[0]);
      const day = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      
      const date = new Date(year, month - 1, day, 19, 0, 0); // 7 PM
      return date;
    }
    
    return null;
  } catch (error) {
    console.error(`Error parsing date: ${dateStr}`, error);
    return null;
  }
}

// Run the import
if (require.main === module) {
  importHistoricalData()
    .then(() => {
      console.log('🎯 Import script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Import script failed:', error);
      process.exit(1);
    });
}

export default importHistoricalData;
