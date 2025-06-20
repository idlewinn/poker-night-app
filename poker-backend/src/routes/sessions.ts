import express, { Request, Response } from 'express';
import db from '../database/db';
import { 
  SessionWithPlayers, 
  CreateSessionRequest, 
  UpdateSessionRequest, 
  SessionQueryResult,
  TypedRequest 
} from '../types/index';

const router = express.Router();

// GET all sessions with their players
router.get('/', (req: Request, res: Response) => {
  const sql = `
    SELECT 
      s.*,
      GROUP_CONCAT(p.id) as player_ids,
      GROUP_CONCAT(p.name) as player_names
    FROM sessions s
    LEFT JOIN session_players sp ON s.id = sp.session_id
    LEFT JOIN players p ON sp.player_id = p.id
    GROUP BY s.id
    ORDER BY s.created_at DESC
  `;
  
  db.all(sql, [], (err: Error | null, rows: SessionQueryResult[]) => {
    if (err) {
      console.error('Error fetching sessions:', err.message);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    } else {
      // Transform the data to match frontend format
      const sessions: SessionWithPlayers[] = rows.map(row => ({
        id: row.id,
        name: row.name,
        scheduledDateTime: row.scheduled_datetime,
        createdAt: row.created_at,
        playerIds: row.player_ids ? row.player_ids.split(',').map(id => parseInt(id)) : []
      }));
      res.json(sessions);
    }
  });
});

// GET session by ID with players
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const sql = `
    SELECT 
      s.*,
      GROUP_CONCAT(p.id) as player_ids,
      GROUP_CONCAT(p.name) as player_names
    FROM sessions s
    LEFT JOIN session_players sp ON s.id = sp.session_id
    LEFT JOIN players p ON sp.player_id = p.id
    WHERE s.id = ?
    GROUP BY s.id
  `;
  
  db.get(sql, [id], (err: Error | null, row: SessionQueryResult | undefined) => {
    if (err) {
      console.error('Error fetching session:', err.message);
      res.status(500).json({ error: 'Failed to fetch session' });
    } else if (!row) {
      res.status(404).json({ error: 'Session not found' });
    } else {
      const session: SessionWithPlayers = {
        id: row.id,
        name: row.name,
        scheduledDateTime: row.scheduled_datetime,
        createdAt: row.created_at,
        playerIds: row.player_ids ? row.player_ids.split(',').map(id => parseInt(id)) : []
      };
      res.json(session);
    }
  });
});

// POST create new session
router.post('/', (req: TypedRequest<CreateSessionRequest>, res: Response): void => {
  const { name, scheduledDateTime, playerIds } = req.body;

  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Session name is required' });
    return;
  }

  if (!scheduledDateTime) {
    res.status(400).json({ error: 'Scheduled date and time is required' });
    return;
  }
  
  const sql = 'INSERT INTO sessions (name, scheduled_datetime) VALUES (?, ?)';

  db.run(sql, [name.trim(), scheduledDateTime], function(this: any, err: Error | null) {
    if (err) {
      console.error('Error creating session:', err.message);
      res.status(500).json({ error: 'Failed to create session' });
    } else {
      const sessionId = this.lastID;
      
      // Add players to session if provided
      if (playerIds && playerIds.length > 0) {
        addPlayersToSession(sessionId, playerIds, (err: Error | null) => {
          if (err) {
            console.error('Error adding players to session:', err.message);
            res.status(500).json({ error: 'Session created but failed to add players' });
          } else {
            fetchSessionById(sessionId, res);
          }
        });
      } else {
        fetchSessionById(sessionId, res);
      }
    }
  });
});

// PUT update session
router.put('/:id', (req: TypedRequest<UpdateSessionRequest>, res: Response): void => {
  const { id } = req.params;
  const { name, scheduledDateTime, playerIds } = req.body;

  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Session name is required' });
    return;
  }

  if (!scheduledDateTime) {
    res.status(400).json({ error: 'Scheduled date and time is required' });
    return;
  }
  
  const sql = 'UPDATE sessions SET name = ?, scheduled_datetime = ? WHERE id = ?';

  db.run(sql, [name.trim(), scheduledDateTime, id], function(this: any, err: Error | null) {
    if (err) {
      console.error('Error updating session:', err.message);
      res.status(500).json({ error: 'Failed to update session' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Session not found' });
    } else {
      // Remove existing players and add new ones
      db.run('DELETE FROM session_players WHERE session_id = ?', [id], (err: Error | null) => {
        if (err) {
          console.error('Error removing session players:', err.message);
          res.status(500).json({ error: 'Failed to update session players' });
        } else {
          if (playerIds && playerIds.length > 0) {
            addPlayersToSession(parseInt(id as string), playerIds, (err: Error | null) => {
              if (err) {
                console.error('Error adding players to session:', err.message);
                res.status(500).json({ error: 'Session updated but failed to update players' });
              } else {
                fetchSessionById(parseInt(id as string), res);
              }
            });
          } else {
            fetchSessionById(parseInt(id as string), res);
          }
        }
      });
    }
  });
});

// DELETE session
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const sql = 'DELETE FROM sessions WHERE id = ?';
  
  db.run(sql, [id], function(this: any, err: Error | null) {
    if (err) {
      console.error('Error deleting session:', err.message);
      res.status(500).json({ error: 'Failed to delete session' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Session not found' });
    } else {
      res.json({ message: 'Session deleted successfully' });
    }
  });
});

// Helper function to add players to session
function addPlayersToSession(sessionId: number, playerIds: number[], callback: (err: Error | null) => void): void {
  if (!playerIds || playerIds.length === 0) {
    return callback(null);
  }
  
  const placeholders = playerIds.map(() => '(?, ?)').join(', ');
  const sql = `INSERT INTO session_players (session_id, player_id) VALUES ${placeholders}`;
  const params: (number)[] = [];
  
  playerIds.forEach(playerId => {
    params.push(sessionId, playerId);
  });
  
  db.run(sql, params, callback);
}

// Helper function to fetch session by ID and return response
function fetchSessionById(sessionId: number, res: Response): void {
  const sql = `
    SELECT 
      s.*,
      GROUP_CONCAT(p.id) as player_ids,
      GROUP_CONCAT(p.name) as player_names
    FROM sessions s
    LEFT JOIN session_players sp ON s.id = sp.session_id
    LEFT JOIN players p ON sp.player_id = p.id
    WHERE s.id = ?
    GROUP BY s.id
  `;
  
  db.get(sql, [sessionId], (err: Error | null, row: SessionQueryResult | undefined) => {
    if (err) {
      console.error('Error fetching created/updated session:', err.message);
      res.status(500).json({ error: 'Session saved but failed to fetch' });
    } else if (row) {
      const session: SessionWithPlayers = {
        id: row.id,
        name: row.name,
        scheduledDateTime: row.scheduled_datetime,
        createdAt: row.created_at,
        playerIds: row.player_ids ? row.player_ids.split(',').map(id => parseInt(id)) : []
      };
      res.status(201).json(session);
    } else {
      res.status(500).json({ error: 'Session saved but not found' });
    }
  });
}

export default router;
