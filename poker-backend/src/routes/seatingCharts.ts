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
function fetchSeatingChartById(chartId: number, res: Response): void {
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

  db.get(sql, [chartId], (err: Error | null, row: any) => {
    if (err) {
      console.error('Error fetching seating chart:', err.message);
      res.status(500).json({ error: 'Failed to fetch seating chart' });
    } else if (row) {
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
  });
}

// GET all seating charts for a session
router.get('/session/:sessionId', (req: Request, res: Response): void => {
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

  db.all(sql, [sessionId], (err: Error | null, rows: any[]) => {
    if (err) {
      console.error('Error fetching seating charts:', err.message);
      res.status(500).json({ error: 'Failed to fetch seating charts' });
    } else {
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
    }
  });
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
router.post('/', (req: TypedRequest<CreateSeatingChartRequest>, res: Response): void => {
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

  db.run(insertChartSql, [sessionId, name, numberOfTables], function(this: any, err: Error | null) {
    if (err) {
      console.error('Error creating seating chart:', err.message);
      res.status(500).json({ error: 'Failed to create seating chart' });
    } else {
      const chartId = this.lastID;

      // Distribute players to tables
      const tables = distributePlayersToTables(playerIds, numberOfTables);

      // Insert seating assignments
      const insertAssignmentSql = 'INSERT INTO seating_assignments (seating_chart_id, player_id, table_number, seat_position) VALUES (?, ?, ?, ?)';
      let assignmentsCompleted = 0;
      let totalAssignments = 0;

      tables.forEach((tablePlayerIds, tableIndex) => {
        tablePlayerIds.forEach((playerId, seatIndex) => {
          totalAssignments++;
        });
      });

      if (totalAssignments === 0) {
        fetchSeatingChartById(chartId, res);
        return;
      }

      tables.forEach((tablePlayerIds, tableIndex) => {
        tablePlayerIds.forEach((playerId, seatIndex) => {
          db.run(insertAssignmentSql, [chartId, playerId, tableIndex + 1, seatIndex + 1], (assignErr: Error | null) => {
            if (assignErr) {
              console.error('Error creating seating assignment:', assignErr.message);
            }

            assignmentsCompleted++;
            if (assignmentsCompleted === totalAssignments) {
              fetchSeatingChartById(chartId, res);
            }
          });
        });
      });
    }
  });
});

// PUT update seating chart
router.put('/:id', (req: TypedRequest<UpdateSeatingChartRequest>, res: Response): void => {
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

  db.run(sql, [name, id], function(this: any, err: Error | null) {
    if (err) {
      console.error('Error updating seating chart:', err.message);
      res.status(500).json({ error: 'Failed to update seating chart' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Seating chart not found' });
    } else {
      fetchSeatingChartById(parseInt(id), res);
    }
  });
});

// DELETE seating chart
router.delete('/:id', (req: Request, res: Response): void => {
  const { id } = req.params;

  const sql = 'DELETE FROM seating_charts WHERE id = ?';

  db.run(sql, [id], function(this: any, err: Error | null) {
    if (err) {
      console.error('Error deleting seating chart:', err.message);
      res.status(500).json({ error: 'Failed to delete seating chart' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Seating chart not found' });
    } else {
      res.json({ message: 'Seating chart deleted successfully' });
    }
  });
});

export default router;
