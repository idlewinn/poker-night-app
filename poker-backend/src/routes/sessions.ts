import express, { Request, Response } from 'express';
import db from '../database/db';
import { authenticateToken, requireSessionOwnership, requireAuth } from '../middleware/auth';
import {
  SessionWithPlayers,
  CreateSessionRequest,
  UpdateSessionRequest,
  UpdatePlayerStatusRequest,
  UpdatePlayerFinancialsRequest,
  SessionQueryResult,
  TypedRequest,
  PlayerStatus
} from '../types/index';

const router = express.Router();

// Helper function to generate session name from date/time
function generateSessionNameFromDateTime(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    hour12: true
  };
  return date.toLocaleDateString('en-US', options);
}

// GET all sessions where user is creator OR participant
router.get('/', authenticateToken, (req: any, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  // First, find the user's email to match with players table
  const userEmail = req.user?.email;

  const sql = `
    SELECT DISTINCT
      s.*,
      GROUP_CONCAT(p.id) as player_ids,
      GROUP_CONCAT(p.name) as player_names,
      GROUP_CONCAT(sp.status) as player_statuses,
      GROUP_CONCAT(sp.buy_in) as player_buy_ins,
      GROUP_CONCAT(sp.cash_out) as player_cash_outs
    FROM sessions s
    LEFT JOIN session_players sp ON s.id = sp.session_id
    LEFT JOIN players p ON sp.player_id = p.id
    WHERE s.created_by = ?
       OR s.id IN (
         SELECT DISTINCT sp2.session_id
         FROM session_players sp2
         JOIN players p2 ON sp2.player_id = p2.id
         WHERE p2.email = ?
       )
    GROUP BY s.id
    ORDER BY s.created_at DESC
  `;

  db.all(sql, [userId, userEmail], (err: Error | null, rows: any[]) => {
    if (err) {
      console.error('Error fetching sessions:', err.message);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    } else {
      // Transform the data to match frontend format
      const sessions: SessionWithPlayers[] = rows.map(row => ({
        id: row.id,
        name: row.name,
        scheduledDateTime: row.scheduled_datetime,
        createdBy: row.created_by,
        createdAt: row.created_at,
        players: row.player_ids ? row.player_ids.split(',').map((id: string, index: number) => ({
          id: `${row.id}-${parseInt(id)}`, // Unique session_player id using session-player combination
          session_id: row.id,
          player_id: parseInt(id),
          status: row.player_statuses ? row.player_statuses.split(',')[index] as PlayerStatus : 'Invited' as PlayerStatus,
          buy_in: row.player_buy_ins ? parseFloat(row.player_buy_ins.split(',')[index]) || 0 : 0,
          cash_out: row.player_cash_outs ? parseFloat(row.player_cash_outs.split(',')[index]) || 0 : 0,
          created_at: row.created_at,
          player: {
            id: parseInt(id),
            name: row.player_names.split(',')[index],
            created_at: row.created_at
          }
        })) : []
      }));
      res.json(sessions);
    }
  });
});


// GET session by ID
router.get('/:id', (req: Request, res: Response): void => {
  const { id } = req.params;

  const sql = `
    SELECT
      s.*,
      GROUP_CONCAT(p.id) as player_ids,
      GROUP_CONCAT(p.name) as player_names,
      GROUP_CONCAT(p.email) as player_emails,
      GROUP_CONCAT(sp.status) as player_statuses,
      GROUP_CONCAT(sp.buy_in) as player_buy_ins,
      GROUP_CONCAT(sp.cash_out) as player_cash_outs
    FROM sessions s
    LEFT JOIN session_players sp ON s.id = sp.session_id
    LEFT JOIN players p ON sp.player_id = p.id
    WHERE s.id = ?
    GROUP BY s.id
  `;

  db.get(sql, [id], (err: Error | null, row: any) => {
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
        createdBy: row.created_by,
        createdAt: row.created_at,
        players: row.player_ids ? row.player_ids.split(',').map((id: string, index: number) => ({
          id: `${row.id}-${parseInt(id)}`, // Unique session_player id using session-player combination
          session_id: row.id,
          player_id: parseInt(id),
          status: row.player_statuses ? row.player_statuses.split(',')[index] as PlayerStatus : 'Invited' as PlayerStatus,
          buy_in: row.player_buy_ins ? parseFloat(row.player_buy_ins.split(',')[index]) || 0 : 0,
          cash_out: row.player_cash_outs ? parseFloat(row.player_cash_outs.split(',')[index]) || 0 : 0,
          created_at: row.created_at,
          player: {
            id: parseInt(id),
            name: row.player_names.split(',')[index],
            email: row.player_emails ? row.player_emails.split(',')[index] : null,
            created_at: row.created_at
          }
        })) : []
      };
      res.json(session);
    }
  });
});

// POST create new session
router.post('/', authenticateToken, (req: any, res: Response): void => {
  const { name, scheduledDateTime, playerIds } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (!scheduledDateTime) {
    res.status(400).json({ error: 'Scheduled date and time is required' });
    return;
  }

  // Generate session name from date/time if not provided
  const sessionName = name?.trim() || generateSessionNameFromDateTime(scheduledDateTime);

  const sql = 'INSERT INTO sessions (name, scheduled_datetime, created_by) VALUES (?, ?, ?)';

  db.run(sql, [sessionName, scheduledDateTime, userId], function(this: any, err: Error | null) {
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

// PUT update session (only by owner)
router.put('/:id', authenticateToken, requireSessionOwnership, (req: any, res: Response): void => {
  const { id } = req.params;
  const { name, scheduledDateTime, playerIds } = req.body;

  if (!scheduledDateTime) {
    res.status(400).json({ error: 'Scheduled date and time is required' });
    return;
  }

  // Generate session name from date/time if not provided
  const sessionName = name?.trim() || generateSessionNameFromDateTime(scheduledDateTime);
  
  const sql = 'UPDATE sessions SET name = ?, scheduled_datetime = ? WHERE id = ?';

  db.run(sql, [sessionName, scheduledDateTime, id], function(this: any, err: Error | null) {
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

// DELETE session (only by owner)
router.delete('/:id', authenticateToken, requireSessionOwnership, (req: any, res: Response) => {
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

// PUT update player status in session
router.put('/:sessionId/players/:playerId/status', (req: TypedRequest<UpdatePlayerStatusRequest>, res: Response): void => {
  const { sessionId, playerId } = req.params;
  const { status } = req.body;

  if (!sessionId || !playerId) {
    res.status(400).json({ error: 'Session ID and Player ID are required' });
    return;
  }

  const sessionIdNum = parseInt(sessionId);
  const playerIdNum = parseInt(playerId);

  if (!status) {
    res.status(400).json({ error: 'Status is required' });
    return;
  }

  const validStatuses: PlayerStatus[] = ['Invited', 'In', 'Out', 'Maybe', 'Attending but not playing'];
  if (!validStatuses.includes(status as PlayerStatus)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  const sql = 'UPDATE session_players SET status = ? WHERE session_id = ? AND player_id = ?';

  db.run(sql, [status, sessionIdNum, playerIdNum], function(this: any, err: Error | null) {
    if (err) {
      console.error('Error updating player status:', err.message);
      res.status(500).json({ error: 'Failed to update player status' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Player not found in session' });
    } else {
      res.json({ message: 'Player status updated successfully', status });
    }
  });
});

// PUT update player financials in session
router.put('/:sessionId/players/:playerId/financials', (req: TypedRequest<UpdatePlayerFinancialsRequest>, res: Response): void => {
  const { sessionId, playerId } = req.params;
  const { buy_in, cash_out } = req.body;

  if (!sessionId || !playerId) {
    res.status(400).json({ error: 'Session ID and Player ID are required' });
    return;
  }

  const sessionIdNum = parseInt(sessionId);
  const playerIdNum = parseInt(playerId);

  if (buy_in === undefined && cash_out === undefined) {
    res.status(400).json({ error: 'At least one of buy_in or cash_out is required' });
    return;
  }

  // Validate that amounts are non-negative numbers
  if ((buy_in !== undefined && (isNaN(buy_in) || buy_in < 0)) ||
      (cash_out !== undefined && (isNaN(cash_out) || cash_out < 0))) {
    res.status(400).json({ error: 'Buy-in and cash-out amounts must be non-negative numbers' });
    return;
  }

  // Build dynamic SQL based on what fields are being updated
  const updates: string[] = [];
  const params: (number | string)[] = [];

  if (buy_in !== undefined) {
    updates.push('buy_in = ?');
    params.push(buy_in);
  }

  if (cash_out !== undefined) {
    updates.push('cash_out = ?');
    params.push(cash_out);
  }

  params.push(sessionIdNum, playerIdNum);

  const sql = `UPDATE session_players SET ${updates.join(', ')} WHERE session_id = ? AND player_id = ?`;

  db.run(sql, params, function(this: any, err: Error | null) {
    if (err) {
      console.error('Error updating player financials:', err.message);
      res.status(500).json({ error: 'Failed to update player financials' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Player not found in session' });
    } else {
      res.json({
        message: 'Player financials updated successfully',
        buy_in: buy_in || null,
        cash_out: cash_out || null
      });
    }
  });
});

// POST add player to session (or update existing player status)
router.post('/:sessionId/players/:playerId', (req: TypedRequest<UpdatePlayerStatusRequest>, res: Response): void => {
  const { sessionId, playerId } = req.params;
  const { status } = req.body;

  if (!sessionId || !playerId) {
    res.status(400).json({ error: 'Session ID and Player ID are required' });
    return;
  }

  const sessionIdNum = parseInt(sessionId);
  const playerIdNum = parseInt(playerId);

  if (!status) {
    res.status(400).json({ error: 'Status is required' });
    return;
  }

  const validStatuses: PlayerStatus[] = ['Invited', 'In', 'Out', 'Maybe', 'Attending but not playing'];
  if (!validStatuses.includes(status as PlayerStatus)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  // First check if player already exists in session
  const checkSql = 'SELECT id FROM session_players WHERE session_id = ? AND player_id = ?';

  db.get(checkSql, [sessionIdNum, playerIdNum], (err: Error | null, row: any) => {
    if (err) {
      console.error('Error checking player existence:', err.message);
      res.status(500).json({ error: 'Failed to check player status' });
      return;
    }

    if (row) {
      // Player exists, update their status
      const updateSql = 'UPDATE session_players SET status = ? WHERE session_id = ? AND player_id = ?';
      db.run(updateSql, [status, sessionIdNum, playerIdNum], function(this: any, err: Error | null) {
        if (err) {
          console.error('Error updating player status:', err.message);
          res.status(500).json({ error: 'Failed to update player status' });
        } else {
          res.json({ message: 'Player status updated successfully', status, action: 'updated' });
        }
      });
    } else {
      // Player doesn't exist, add them with the specified status
      const insertSql = 'INSERT INTO session_players (session_id, player_id, status, buy_in, cash_out) VALUES (?, ?, ?, 0, 0)';
      db.run(insertSql, [sessionIdNum, playerIdNum, status], function(this: any, err: Error | null) {
        if (err) {
          console.error('Error adding player to session:', err.message);
          res.status(500).json({ error: 'Failed to add player to session' });
        } else {
          res.json({ message: 'Player added to session successfully', status, action: 'added' });
        }
      });
    }
  });
});

// Helper function to add players to session with default "Invited" status
function addPlayersToSession(sessionId: number, playerIds: number[], callback: (err: Error | null) => void): void {
  if (!playerIds || playerIds.length === 0) {
    return callback(null);
  }

  const placeholders = playerIds.map(() => '(?, ?, ?, ?, ?)').join(', ');
  const sql = `INSERT INTO session_players (session_id, player_id, status, buy_in, cash_out) VALUES ${placeholders}`;
  const params: (number | string)[] = [];

  playerIds.forEach(playerId => {
    params.push(sessionId, playerId, 'Invited', 0, 0);
  });

  db.run(sql, params, callback);
}

// Helper function to fetch session by ID and return response
function fetchSessionById(sessionId: number, res: Response): void {
  const sql = `
    SELECT
      s.*,
      GROUP_CONCAT(p.id) as player_ids,
      GROUP_CONCAT(p.name) as player_names,
      GROUP_CONCAT(p.email) as player_emails,
      GROUP_CONCAT(sp.status) as player_statuses,
      GROUP_CONCAT(sp.buy_in) as player_buy_ins,
      GROUP_CONCAT(sp.cash_out) as player_cash_outs
    FROM sessions s
    LEFT JOIN session_players sp ON s.id = sp.session_id
    LEFT JOIN players p ON sp.player_id = p.id
    WHERE s.id = ?
    GROUP BY s.id
  `;

  db.get(sql, [sessionId], (err: Error | null, row: any) => {
    if (err) {
      console.error('Error fetching created/updated session:', err.message);
      res.status(500).json({ error: 'Session saved but failed to fetch' });
    } else if (row) {
      const session: SessionWithPlayers = {
        id: row.id,
        name: row.name,
        scheduledDateTime: row.scheduled_datetime,
        createdBy: row.created_by,
        createdAt: row.created_at,
        players: row.player_ids ? row.player_ids.split(',').map((id: string, index: number) => ({
          id: `${row.id}-${parseInt(id)}`, // Unique session_player id using session-player combination
          session_id: row.id,
          player_id: parseInt(id),
          status: row.player_statuses ? row.player_statuses.split(',')[index] as PlayerStatus : 'Invited' as PlayerStatus,
          buy_in: row.player_buy_ins ? parseFloat(row.player_buy_ins.split(',')[index]) || 0 : 0,
          cash_out: row.player_cash_outs ? parseFloat(row.player_cash_outs.split(',')[index]) || 0 : 0,
          created_at: row.created_at,
          player: {
            id: parseInt(id),
            name: row.player_names.split(',')[index],
            email: row.player_emails ? row.player_emails.split(',')[index] : null,
            created_at: row.created_at
          }
        })) : []
      };
      res.status(201).json(session);
    } else {
      res.status(500).json({ error: 'Session saved but not found' });
    }
  });
}

export default router;
