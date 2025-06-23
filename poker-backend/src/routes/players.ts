import express, { Request, Response } from 'express';
import db from '../database/index';
import { authenticateToken } from '../middleware/auth';
import {
  Player,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  TypedRequest
} from '../types/index';

const router = express.Router();

// GET players that the authenticated user has added or knows from shared sessions
router.get('/', authenticateToken, async (req: any, res: Response) => {
  const userId = req.user?.id;
  const userEmail = req.user?.email;

  if (!userId || !userEmail) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  // Get players that the user has encountered through:
  // 1. Players they've explicitly added (via user_players table) - with email
  // 2. Sessions they created (all players in those sessions) - with email
  // 3. Sessions they participated in (all players in those sessions) - without email
  const sql = `
    WITH user_accessible_players AS (
      -- Players the user has explicitly added
      SELECT up.player_id, 1 as user_added, 0 as from_owned_session
      FROM user_players up
      WHERE up.user_id = ?

      UNION

      -- Players from sessions the user created
      SELECT DISTINCT sp2.player_id, 0 as user_added, 1 as from_owned_session
      FROM sessions s2
      JOIN session_players sp2 ON s2.id = sp2.session_id
      WHERE s2.created_by = ?

      UNION

      -- Players from sessions the user participated in
      SELECT DISTINCT sp3.player_id, 0 as user_added, 0 as from_owned_session
      FROM sessions s3
      JOIN session_players sp3 ON s3.id = sp3.session_id
      WHERE s3.id IN (
        SELECT DISTINCT sp4.session_id
        FROM session_players sp4
        JOIN players p4 ON sp4.player_id = p4.id
        WHERE p4.email = ?
      )
    )
    SELECT DISTINCT
      p.id,
      p.name,
      CASE
        WHEN (MAX(uap.user_added) = 1 OR MAX(uap.from_owned_session) = 1) THEN p.email
        ELSE NULL
      END as email,
      p.created_at,
      CASE
        WHEN MAX(uap.user_added) = 1 THEN up.default_invite
        ELSE NULL
      END as default_invite
    FROM players p
    JOIN user_accessible_players uap ON p.id = uap.player_id
    LEFT JOIN user_players up ON p.id = up.player_id AND up.user_id = ?
    GROUP BY p.id, p.name, p.created_at, up.default_invite
    ORDER BY p.created_at DESC
  `;

  try {
    const rows = await db.all(sql, [userId, userId, userEmail, userId]);

    // Debug: Log raw data for first few players
    console.log('DEBUG - Raw player data for user', userId, ':',
      rows.slice(0, 3).map(r => ({
        id: r.id,
        name: r.name,
        default_invite: r.default_invite,
        default_invite_type: typeof r.default_invite
      }))
    );

    // Transform the results to standard Player format
    const players = rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email, // Will be null for players from other users' sessions
      created_at: row.created_at,
      // Handle both PostgreSQL (boolean) and SQLite (integer) default_invite values
      default_invite: row.default_invite === true || row.default_invite === 1 ? true :
                     row.default_invite === false || row.default_invite === 0 ? false :
                     undefined
    }));

    // Debug: Log transformed data
    console.log('DEBUG - Transformed player data:',
      players.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        default_invite: p.default_invite,
        default_invite_type: typeof p.default_invite
      }))
    );

    res.json(players);
  } catch (err: any) {
    console.error('Error fetching players:', err.message);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// GET player by ID
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM players WHERE id = ?';

  try {
    const row = await db.get(sql, [id]);
    if (!row) {
      res.status(404).json({ error: 'Player not found' });
    } else {
      res.json(row);
    }
  } catch (err: any) {
    console.error('Error fetching player:', err.message);
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

// POST create new player
router.post('/', authenticateToken, async (req: any, res: Response): Promise<void> => {
  const { name, email } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Player name is required' });
    return;
  }

  try {
    // First, check if player already exists
    const existingPlayer = await db.get('SELECT * FROM players WHERE name = ?', [name.trim()]);

    if (existingPlayer) {
      // Player exists, just add the relationship if it doesn't exist
      // Use INSERT ... ON CONFLICT for PostgreSQL compatibility
      const isPostgreSQL = process.env.DATABASE_URL?.startsWith('postgresql');
      const insertSql = isPostgreSQL
        ? 'INSERT INTO user_players (user_id, player_id, default_invite) VALUES (?, ?, ?) ON CONFLICT (user_id, player_id) DO NOTHING'
        : 'INSERT OR IGNORE INTO user_players (user_id, player_id, default_invite) VALUES (?, ?, ?)';

      const defaultInviteValue = isPostgreSQL ? true : 1;
      await db.run(insertSql, [userId, existingPlayer.id, defaultInviteValue]);
      res.status(201).json(existingPlayer);
    } else {
      // Player doesn't exist, create new player
      const sql = 'INSERT INTO players (name, email) VALUES (?, ?)';
      const result = await db.run(sql, [name.trim(), email?.trim() || null]);
      const playerId = result.lastID;

      if (!playerId) {
        throw new Error('Failed to get player ID');
      }

      // Add the user-player relationship with default_invite = true
      const isPostgreSQL = process.env.DATABASE_URL?.startsWith('postgresql');
      const defaultInviteValue = isPostgreSQL ? true : 1;
      await db.run('INSERT INTO user_players (user_id, player_id, default_invite) VALUES (?, ?, ?)', [userId, playerId, defaultInviteValue]);

      // Return the created player
      const player = await db.get('SELECT * FROM players WHERE id = ?', [playerId]);
      res.status(201).json(player);
    }
  } catch (err: any) {
    console.error('Error creating player:', err.message);
    res.status(500).json({ error: 'Failed to create player' });
  }
});

// PUT update player (only if user has access to this player)
router.put('/:id', authenticateToken, async (req: any, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, email } = req.body;

  console.log('PUT /api/players/:id received:', { id, name, email, emailType: typeof email });

  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Player name is required' });
    return;
  }

  const emailValue = email?.trim() || null;
  console.log('Email value to be saved:', emailValue);

  const sql = 'UPDATE players SET name = ?, email = ? WHERE id = ?';

  try {
    const result = await db.run(sql, [name.trim(), emailValue, id]);

    if (result.changes === 0) {
      res.status(404).json({ error: 'Player not found' });
    } else {
      // Return the updated player
      const player = await db.get('SELECT * FROM players WHERE id = ?', [id]);
      res.json(player);
    }
  } catch (err: any) {
    if (err.message.includes('UNIQUE constraint failed') || err.message.includes('duplicate key')) {
      res.status(409).json({ error: 'Player name already exists' });
    } else {
      console.error('Error updating player:', err.message);
      res.status(500).json({ error: 'Failed to update player' });
    }
  }
});

// PUT update player default invite setting
router.put('/:id/default-invite', authenticateToken, async (req: any, res: Response): Promise<void> => {
  const { id } = req.params;
  const { default_invite } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (typeof default_invite !== 'boolean') {
    res.status(400).json({ error: 'default_invite must be a boolean value' });
    return;
  }

  try {
    // Check if user has access to this player (they added it)
    const userPlayer = await db.get(
      'SELECT * FROM user_players WHERE user_id = ? AND player_id = ?',
      [userId, id]
    );

    console.log('DEBUG - Update default_invite - userPlayer found:', userPlayer);

    if (!userPlayer) {
      res.status(403).json({ error: 'You can only modify players you have added' });
      return;
    }

    // Update the default_invite setting in user_players table
    console.log('DEBUG - Updating default_invite to:', default_invite, 'for user:', userId, 'player:', id);

    // Use boolean for PostgreSQL, integer for SQLite
    const isPostgreSQL = process.env.DATABASE_URL?.startsWith('postgresql');
    const defaultInviteValue = isPostgreSQL ? default_invite : (default_invite ? 1 : 0);

    const result = await db.run(
      'UPDATE user_players SET default_invite = ? WHERE user_id = ? AND player_id = ?',
      [defaultInviteValue, userId, id]
    );

    console.log('DEBUG - Update result:', result);

    // Verify the update worked
    const updatedUserPlayer = await db.get(
      'SELECT * FROM user_players WHERE user_id = ? AND player_id = ?',
      [userId, id]
    );
    console.log('DEBUG - After update, userPlayer is:', updatedUserPlayer);

    if (result.changes === 0) {
      res.status(404).json({ error: 'Player relationship not found' });
    } else {
      res.json({ message: 'Default invite setting updated successfully' });
    }
  } catch (err: any) {
    console.error('Error updating default invite setting:', err.message);
    res.status(500).json({ error: 'Failed to update default invite setting' });
  }
});

// DELETE player (only if user has access to this player)
router.delete('/:id', authenticateToken, async (req: any, res: Response) => {
  const { id } = req.params;
  const sql = 'DELETE FROM players WHERE id = ?';

  try {
    const result = await db.run(sql, [id]);

    if (result.changes === 0) {
      res.status(404).json({ error: 'Player not found' });
    } else {
      res.json({ message: 'Player deleted successfully' });
    }
  } catch (err: any) {
    console.error('Error deleting player:', err.message);
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

export default router;
