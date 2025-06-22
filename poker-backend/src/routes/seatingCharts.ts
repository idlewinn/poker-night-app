import express, { Request, Response } from 'express';
import db from '../database/index';
import { 
  SeatingChart, 
  SeatingAssignment, 
  CreateSeatingChartRequest, 
  UpdateSeatingChartRequest,
  TypedRequest,
  Player
} from '../types';

const router = express.Router();

// Helper function to shuffle array (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp;
  }
  return shuffled;
}

// Helper function to distribute players across tables
function distributePlayersToTables(playerIds: number[], numberOfTables: number): number[][] {
  const shuffledPlayers = shuffleArray(playerIds);
  const tables: number[][] = Array.from({ length: numberOfTables }, (): number[] => []);

  // Distribute players round-robin style
  shuffledPlayers.forEach((playerId, index) => {
    const tableIndex = index % numberOfTables;
    if (tables[tableIndex]) {
      tables[tableIndex].push(playerId);
    }
  });

  return tables;
}

// Helper function to fetch seating chart with assignments
async function fetchSeatingChartById(chartId: number, res: Response): Promise<void> {
  const sql = `
    SELECT
      sc.*,
      GROUP_CONCAT(sa.id) as assignment_ids,
      GROUP_CONCAT(sa.player_id) as player_ids,
      GROUP_CONCAT(sa.table_number) as table_numbers,
      GROUP_CONCAT(sa.seat_position) as seat_positions,
      GROUP_CONCAT(p.name) as player_names
    FROM seating_charts sc
    LEFT JOIN seating_assignments sa ON sc.id = sa.seating_chart_id
    LEFT JOIN players p ON sa.player_id = p.id
    WHERE sc.id = ?
    GROUP BY sc.id
  `;

  try {
    const row = await db.get(sql, [chartId]);
    if (row) {
      const seatingChart: SeatingChart = {
        id: row.id,
        session_id: row.session_id,
        name: row.name,
        number_of_tables: row.number_of_tables,
        created_at: row.created_at,
        assignments: row.assignment_ids ? row.assignment_ids.split(',').map((id: string, index: number) => ({
          id: parseInt(id),
          seating_chart_id: row.id,
          player_id: parseInt(row.player_ids.split(',')[index]),
          table_number: parseInt(row.table_numbers.split(',')[index]),
          seat_position: parseInt(row.seat_positions.split(',')[index]),
          created_at: row.created_at,
          player: {
            id: parseInt(row.player_ids.split(',')[index]),
            name: row.player_names.split(',')[index],
            created_at: row.created_at
          }
        })) : []
      };
      res.json(seatingChart);
    } else {
      res.status(404).json({ error: 'Seating chart not found' });
    }
  } catch (err: any) {
    console.error('Error fetching seating chart:', err.message);
    res.status(500).json({ error: 'Failed to fetch seating chart' });
  }
}

// GET all seating charts for a session
router.get('/session/:sessionId', async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params;

  const sql = `
    SELECT 
      sc.*,
      GROUP_CONCAT(sa.id) as assignment_ids,
      GROUP_CONCAT(sa.player_id) as player_ids,
      GROUP_CONCAT(sa.table_number) as table_numbers,
      GROUP_CONCAT(sa.seat_position) as seat_positions,
      GROUP_CONCAT(p.name) as player_names
    FROM seating_charts sc
    LEFT JOIN seating_assignments sa ON sc.id = sa.seating_chart_id
    LEFT JOIN players p ON sa.player_id = p.id
    WHERE sc.session_id = ?
    GROUP BY sc.id
    ORDER BY sc.created_at DESC
  `;

  try {
    const rows = await db.all(sql, [sessionId]);
    const seatingCharts: SeatingChart[] = rows.map(row => ({
      id: row.id,
      session_id: row.session_id,
      name: row.name,
      number_of_tables: row.number_of_tables,
      created_at: row.created_at,
      assignments: row.assignment_ids ? row.assignment_ids.split(',').map((id: string, index: number) => ({
        id: parseInt(id),
        seating_chart_id: row.id,
        player_id: parseInt(row.player_ids.split(',')[index]),
        table_number: parseInt(row.table_numbers.split(',')[index]),
        seat_position: parseInt(row.seat_positions.split(',')[index]),
        created_at: row.created_at,
        player: {
          id: parseInt(row.player_ids.split(',')[index]),
          name: row.player_names.split(',')[index],
          created_at: row.created_at
        }
      })) : []
    }));
    res.json(seatingCharts);
  } catch (err: any) {
    console.error('Error fetching seating charts:', err.message);
    res.status(500).json({ error: 'Failed to fetch seating charts' });
  }
});

// GET seating chart by ID
router.get('/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: 'Seating chart ID is required' });
    return;
  }
  fetchSeatingChartById(parseInt(id), res);
});

// POST create new seating chart
router.post('/', async (req: TypedRequest<CreateSeatingChartRequest>, res: Response): Promise<void> => {
  const { sessionId, name, numberOfTables, playerIds } = req.body;

  if (!sessionId || !name || !numberOfTables || !playerIds || playerIds.length === 0) {
    res.status(400).json({ error: 'Session ID, name, number of tables, and player IDs are required' });
    return;
  }

  if (numberOfTables < 1 || numberOfTables > playerIds.length) {
    res.status(400).json({ error: 'Invalid number of tables' });
    return;
  }

  // Create the seating chart
  const insertChartSql = 'INSERT INTO seating_charts (session_id, name, number_of_tables) VALUES (?, ?, ?)';

  try {
    const result = await db.run(insertChartSql, [sessionId, name, numberOfTables]);
    const chartId = result.lastID;

    if (!chartId) {
      throw new Error('Failed to get chart ID');
    }

    // Distribute players to tables
    const tables = distributePlayersToTables(playerIds, numberOfTables);

    // Insert seating assignments
    const insertAssignmentSql = 'INSERT INTO seating_assignments (seating_chart_id, player_id, table_number, seat_position) VALUES (?, ?, ?, ?)';

    // Create all assignments
    for (let tableIndex = 0; tableIndex < tables.length; tableIndex++) {
      const tablePlayerIds = tables[tableIndex];
      for (let seatIndex = 0; seatIndex < tablePlayerIds.length; seatIndex++) {
        const playerId = tablePlayerIds[seatIndex];
        await db.run(insertAssignmentSql, [chartId, playerId, tableIndex + 1, seatIndex + 1]);
      }
    }

    await fetchSeatingChartById(chartId, res);
  } catch (err: any) {
    console.error('Error creating seating chart:', err.message);
    res.status(500).json({ error: 'Failed to create seating chart' });
  }
});

// PUT update seating chart
router.put('/:id', async (req: TypedRequest<UpdateSeatingChartRequest>, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name } = req.body;

  if (!id) {
    res.status(400).json({ error: 'Seating chart ID is required' });
    return;
  }

  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  const sql = 'UPDATE seating_charts SET name = ? WHERE id = ?';

  try {
    const result = await db.run(sql, [name, id]);

    if (result.changes === 0) {
      res.status(404).json({ error: 'Seating chart not found' });
    } else {
      await fetchSeatingChartById(parseInt(id), res);
    }
  } catch (err: any) {
    console.error('Error updating seating chart:', err.message);
    res.status(500).json({ error: 'Failed to update seating chart' });
  }
});

// DELETE seating chart
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const sql = 'DELETE FROM seating_charts WHERE id = ?';

  try {
    const result = await db.run(sql, [id]);

    if (result.changes === 0) {
      res.status(404).json({ error: 'Seating chart not found' });
    } else {
      res.json({ message: 'Seating chart deleted successfully' });
    }
  } catch (err: any) {
    console.error('Error deleting seating chart:', err.message);
    res.status(500).json({ error: 'Failed to delete seating chart' });
  }
});

export default router;
