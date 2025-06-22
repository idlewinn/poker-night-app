import { SeatingChart, SeatingAssignment, SeatingTable, Player } from '../types/index';

/**
 * Fisher-Yates shuffle algorithm to randomize array order
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Distribute players across tables in a round-robin fashion
 */
export function distributePlayersToTables(playerIds: number[], numberOfTables: number): number[][] {
  if (numberOfTables <= 0 || playerIds.length === 0) {
    return [];
  }

  const shuffledPlayers = shuffleArray(playerIds);
  const tables: number[][] = Array.from({ length: numberOfTables }, () => []);
  
  // Distribute players round-robin style to ensure even distribution
  shuffledPlayers.forEach((playerId, index) => {
    const tableIndex = index % numberOfTables;
    tables[tableIndex].push(playerId);
  });
  
  return tables;
}

/**
 * Generate seating assignments from player distribution
 */
export function generateSeatingAssignments(
  seatingChartId: number,
  playerDistribution: number[][]
): Omit<SeatingAssignment, 'id' | 'created_at' | 'player'>[] {
  const assignments: Omit<SeatingAssignment, 'id' | 'created_at' | 'player'>[] = [];
  
  playerDistribution.forEach((tablePlayerIds, tableIndex) => {
    // Shuffle the players at each table for random seating positions
    const shuffledTablePlayers = shuffleArray(tablePlayerIds);
    
    shuffledTablePlayers.forEach((playerId, seatIndex) => {
      assignments.push({
        seating_chart_id: seatingChartId,
        player_id: playerId,
        table_number: tableIndex + 1, // Tables are 1-indexed
        seat_position: seatIndex + 1   // Seats are 1-indexed
      });
    });
  });
  
  return assignments;
}

/**
 * Convert seating assignments to table structure for display
 */
export function groupAssignmentsByTable(assignments: SeatingAssignment[]): SeatingTable[] {
  const tableMap = new Map<number, SeatingAssignment[]>();
  
  // Group assignments by table number
  assignments.forEach(assignment => {
    const tableNumber = assignment.table_number;
    if (!tableMap.has(tableNumber)) {
      tableMap.set(tableNumber, []);
    }
    tableMap.get(tableNumber)!.push(assignment);
  });
  
  // Convert to SeatingTable array and sort by seat position
  const tables: SeatingTable[] = [];
  tableMap.forEach((tableAssignments, tableNumber) => {
    const sortedAssignments = tableAssignments.sort((a, b) => a.seat_position - b.seat_position);
    tables.push({
      tableNumber,
      players: sortedAssignments
    });
  });
  
  // Sort tables by table number
  return tables.sort((a, b) => a.tableNumber - b.tableNumber);
}

/**
 * Calculate optimal table distribution suggestions
 */
export function getTableDistributionSuggestions(playerCount: number): Array<{
  tables: number;
  playersPerTable: string;
  description: string;
}> {
  if (playerCount <= 0) return [];
  
  const suggestions = [];
  
  // Calculate suggestions for different table counts
  for (let tables = 1; tables <= Math.min(playerCount, 8); tables++) {
    const basePlayersPerTable = Math.floor(playerCount / tables);
    const extraPlayers = playerCount % tables;
    
    let playersPerTable: string;
    let description: string;
    
    if (extraPlayers === 0) {
      playersPerTable = basePlayersPerTable.toString();
      description = `${basePlayersPerTable} players per table`;
    } else {
      playersPerTable = `${basePlayersPerTable}-${basePlayersPerTable + 1}`;
      description = `${tables - extraPlayers} tables with ${basePlayersPerTable} players, ${extraPlayers} tables with ${basePlayersPerTable + 1} players`;
    }
    
    suggestions.push({
      tables,
      playersPerTable,
      description
    });
  }
  
  return suggestions;
}

/**
 * Validate seating chart parameters
 */
export function validateSeatingChartParams(
  playerIds: number[],
  numberOfTables: number
): { isValid: boolean; error?: string } {
  if (playerIds.length === 0) {
    return { isValid: false, error: 'At least one player must be selected' };
  }
  
  if (numberOfTables <= 0) {
    return { isValid: false, error: 'Number of tables must be at least 1' };
  }
  
  if (numberOfTables > playerIds.length) {
    return { isValid: false, error: 'Cannot have more tables than players' };
  }
  
  // Check for reasonable table sizes (2-10 players per table is typical for poker)
  const minPlayersPerTable = Math.floor(playerIds.length / numberOfTables);
  if (minPlayersPerTable < 2 && playerIds.length >= 2) {
    return { isValid: false, error: 'Each table should have at least 2 players' };
  }
  
  const maxPlayersPerTable = Math.ceil(playerIds.length / numberOfTables);
  if (maxPlayersPerTable > 10) {
    return { isValid: false, error: 'Tables should not have more than 10 players' };
  }
  
  return { isValid: true };
}

/**
 * Generate a complete seating chart with all logic
 */
export function generateCompleteSeatingChart(
  seatingChartId: number,
  playerIds: number[],
  numberOfTables: number
): {
  success: boolean;
  assignments?: Omit<SeatingAssignment, 'id' | 'created_at' | 'player'>[];
  tables?: SeatingTable[];
  error?: string;
} {
  // Validate parameters
  const validation = validateSeatingChartParams(playerIds, numberOfTables);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }
  
  try {
    // Distribute players to tables
    const playerDistribution = distributePlayersToTables(playerIds, numberOfTables);
    
    // Generate seating assignments
    const assignments = generateSeatingAssignments(seatingChartId, playerDistribution);
    
    // Create table structure for display (we'll need to populate player data separately)
    const tables = groupAssignmentsByTable(assignments as SeatingAssignment[]);
    
    return {
      success: true,
      assignments,
      tables
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate seating chart'
    };
  }
}
