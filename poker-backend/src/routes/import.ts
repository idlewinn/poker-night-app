import express, { Request, Response } from 'express';
import db from '../database/index';

const router = express.Router();

// Historical data embedded in the endpoint
const buyInsData = `
,10/1/2022,11/05/2022,12/17/2022,01/28/2023,03/04/2023,04/08/2023,06/17/2023,09/30/2023,10/21/2023,12/2/2023,3/23/2024,04/27/2024,07/20/2024,08/10/2024,10/05/2024,12/7/2024,1/18/2025,2/8,3/22,5/31
Edwin Lin,25,25,75,25,25,25,25,25,25,100,25,100,75,25,25,125,25,75,25,225
Kevin Cheng,25,50,,50,25,25,25,25,25,,50,25,25,50,50,,25,75,25,25,
Brenton Fong,75,25,,50,50,50,,25,,,25,150,25,25,,,50,,175,75,
Nelson Tsai,25,25,,,,25,,50,50,25,25,25,25,25,25,,25,25,25,50,
Laura Lin,25,50,25,,25,,25,25,50,100,25,75,,75,,25,75,75,25,25,
Mike Tsan,25,50,50,,25,25,25,100,75,50,75,25,,25,,75,75,75,25,175,
Tim Yung,50,,50,,25,,75,100,25,50,125,100,,,25,175,25,175,,275,
Thomas Chen,50,,25,,25,,50,25,50,,25,75,,,,,50,25,,25,
Steve Cao,,25,25,25,,50,25,75,,25,25,25,,,25,,125,75,125,,
Aaron Dang,,,50,,50,,75,100,100,125,75,175,75,75,25,175,100,225,200,25,
Kevin Lee,,,,25,,25,,,,,,25,25,,50,25,,25,50,25,
Lenira Chan,,,,25,,,,25,,,,,,,,,,,,,
Robert Chao,,,,,50,25,50,25,50,25,,25,50,50,25,75,75,25,75,25,
William Vuong,,,,,,,,25,,,,,,,,,,,,,
Li Zhu,,,,,,,,,50,50,50,,,,,,,75,,,
Lici Zhu,,,,,,,,,25,,,,,,,,,,,,
Ryan Kwok,,,,,,,,,,100,,,,,,,,125,,,
Daniel Chen,,,,,,,,,,,25,,,,25,,,,,25,
Elaine ???,,,,,,,,,,,50,,,,,,,,,,
Pearson Pong,,,,,,,,,,,,,,,,,,,,,
Mike Lin,,,,,,,,,,,,,,,,25,,,,,
`.trim();

const netProfitsData = `
,10/1/2022,11/05/2022,12/17/2022,01/28/2023,03/04/2023,04/08/2023,06/17/2023,09/30/2023,10/21/2023,12/02/2023,03/23/2024,04/27/2024,07/20/2024,08/10/2024,10/05,12/07,1/18,2/8,3/22,5/31
Edwin Lin,20,11.75,8,-25,24,52,98,17.75,8.25,-100,88.75,31.25,44,34.5,8.75,-36.5,163.5,-1.25,101.5,-9
Kevin Cheng,5,-6,,-21,-25,-25,0.75,-25,58.5,,-19.5,64.75,,71.75,-50,,-4,21.75,-25,72.75
Brenton Fong,-5,77.75,,,-9,-50,,-13.75,,,11,-132.25,37.5,56.25,,,-50,,-175,-8
Nelson Tsai,-25,-25,,-33,,-25,,-50,-50,11.75,-25,-25,-25,44.5,38.5,,-25,36.5,-5.25,-50
Laura Lin,-25,-33.5,-25,,-25,,-25,76.25,37.5,26.25,-25,-52.25,,-57,,121,-75,-75,164,8.25
Mike Tsan,28,-50,-18,,118,49,-25,-34,-75,-50,-37,117.5,,-25,,-75,86.75,-4.25,149,-39
Tim Yung,24,,26,,-25,,-6.5,15,-25,79.25,8.5,1.25,,,-25,56,86,-128,,-56.25
Thomas Chen,-22,,16,,42,,-25,30,-50,,12.5,10,,,,,-50,103,,61.5
Steve Cao,,25,-17,50,,-50,49.5,-75,,7.25,25,97.25,,,3,,-84.25,-25.75,-116.5,0
Aaron Dang,,,10,,-50,,-75,-17,44.5,116.5,6,-127.5,-75,-75,81,-59.75,27,-28,32.25,60.75
Kevin Lee,,,,26,,32,,,,,,0,62.75,,-50,-25,,-25,-50,9
Lenira Chan,,,,3,,,,-7.5,,,,,,,,,,,,0
Robert Chao,,,,,-50,17,8.25,20.75,13.75,-14.5,,15,-44.25,-50,18.75,44.25,-75,13.25,-75,-25
William Vuong,,,,,,,,4,,,,,,,,,,,,0
Li Zhu,,,,,,,,58.5,44.5,-50,4.75,,,,,,,-69.25,,0
Lici Zhu,,,,,,,,,-7,,,,,,,,,,,0
Ryan Kwok,,,,,,,,,,-26.5,,,,,,,,182,,0
Daniel Chen,,,,,,,,,,,0,,,,-25,,,,,-25
Elaine ???,,,,,,,,,,,-50,,,,,,,,,0
Pearson Pong,,,,,,,,,,,,,,,,,,,,0
Mike Lin,,,,,,,,,,,,,,,,-25,,,,0
`.trim();

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

// Helper function to parse various date formats
function parseDate(dateStr: string): Date | null {
  try {
    // Handle formats like "10/1/2022", "11/05/2022", "2/8", "3/22"
    const parts = dateStr.split('/');
    
    if (parts.length === 2) {
      // Format like "2/8" - assume 2025
      const month = parseInt(parts[0]);
      const day = parseInt(parts[1]);
      const year = 2025;
      
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

// Temporary import endpoint - REMOVE AFTER USE
router.post('/run-historical-import', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🎯 Historical data import endpoint called');
    
    // Parse CSV data
    const buyInsLines = buyInsData.split('\n').filter(line => line.trim());
    const netProfitsLines = netProfitsData.split('\n').filter(line => line.trim());
    
    console.log(`📊 Found ${buyInsLines.length} lines in buy-ins data`);
    console.log(`📊 Found ${netProfitsLines.length} lines in net profits data`);
    
    // Parse headers (dates)
    const buyInsHeaders = buyInsLines[0].split(',').slice(1); // Skip first column (player names)
    const netProfitsHeaders = netProfitsLines[0].split(',').slice(1);
    
    console.log(`📅 Found ${buyInsHeaders.length} sessions in buy-ins data`);
    
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
      res.status(400).json({
        success: false,
        error: 'No users found. Please make sure you have logged in at least once.',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    const userId = users[0].id;
    console.log(`👤 Assigning sessions to user: ${users[0].email} (ID: ${userId})`);
    
    // Import sessions
    let importedSessions = 0;
    let importedPlayers = 0;
    let totalSessionPlayers = 0;
    
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
          await db.run('INSERT INTO user_players (user_id, player_id, default_invite) VALUES (?, ?, ?)', [userId, playerId, true]);
          
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
        
        totalSessionPlayers++;
        console.log(`    💰 Added ${playerData.name}: $${playerData.buyIn} → $${playerData.cashOut} (${playerData.netProfit >= 0 ? '+' : ''}$${playerData.netProfit})`);
      }
      
      importedSessions++;
    }
    
    console.log('\n🎉 Historical data import completed successfully!');
    
    res.json({ 
      success: true, 
      message: 'Historical data import completed successfully',
      summary: {
        sessionsImported: importedSessions,
        newPlayersCreated: importedPlayers,
        totalSessionPlayerRecords: totalSessionPlayers,
        assignedToUser: users[0].email
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Historical import failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
