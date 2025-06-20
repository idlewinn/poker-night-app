const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET all sessions with their players
router.get('/', (req, res) => {
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
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching sessions:', err.message);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    } else {
      // Transform the data to match frontend format
      const sessions = rows.map(row => ({
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
router.get('/:id', (req, res) => {
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
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error('Error fetching session:', err.message);
      res.status(500).json({ error: 'Failed to fetch session' });
    } else if (!row) {
      res.status(404).json({ error: 'Session not found' });
    } else {
      const session = {
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
router.post('/', (req, res) => {
  const { name, scheduledDateTime, playerIds } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Session name is required' });
  }
  
  const sql = 'INSERT INTO sessions (name, scheduled_datetime) VALUES (?, ?)';
  
  db.run(sql, [name.trim(), scheduledDateTime || null], function(err) {
    if (err) {
      console.error('Error creating session:', err.message);
      res.status(500).json({ error: 'Failed to create session' });
    } else {
      const sessionId = this.lastID;
      
      // Add players to session if provided
      if (playerIds && playerIds.length > 0) {
        addPlayersToSession(sessionId, playerIds, (err) => {
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
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, scheduledDateTime, playerIds } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Session name is required' });
  }
  
  const sql = 'UPDATE sessions SET name = ?, scheduled_datetime = ? WHERE id = ?';
  
  db.run(sql, [name.trim(), scheduledDateTime || null, id], function(err) {
    if (err) {
      console.error('Error updating session:', err.message);
      res.status(500).json({ error: 'Failed to update session' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Session not found' });
    } else {
      // Remove existing players and add new ones
      db.run('DELETE FROM session_players WHERE session_id = ?', [id], (err) => {
        if (err) {
          console.error('Error removing session players:', err.message);
          res.status(500).json({ error: 'Failed to update session players' });
        } else {
          if (playerIds && playerIds.length > 0) {
            addPlayersToSession(id, playerIds, (err) => {
              if (err) {
                console.error('Error adding players to session:', err.message);
                res.status(500).json({ error: 'Session updated but failed to update players' });
              } else {
                fetchSessionById(id, res);
              }
            });
          } else {
            fetchSessionById(id, res);
          }
        }
      });
    }
  });
});

// DELETE session
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM sessions WHERE id = ?';
  
  db.run(sql, [id], function(err) {
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
function addPlayersToSession(sessionId, playerIds, callback) {
  if (!playerIds || playerIds.length === 0) {
    return callback(null);
  }
  
  const placeholders = playerIds.map(() => '(?, ?)').join(', ');
  const sql = `INSERT INTO session_players (session_id, player_id) VALUES ${placeholders}`;
  const params = [];
  
  playerIds.forEach(playerId => {
    params.push(sessionId, playerId);
  });
  
  db.run(sql, params, callback);
}

// Helper function to fetch session by ID and return response
function fetchSessionById(sessionId, res) {
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
  
  db.get(sql, [sessionId], (err, row) => {
    if (err) {
      console.error('Error fetching created/updated session:', err.message);
      res.status(500).json({ error: 'Session saved but failed to fetch' });
    } else {
      const session = {
        id: row.id,
        name: row.name,
        scheduledDateTime: row.scheduled_datetime,
        createdAt: row.created_at,
        playerIds: row.player_ids ? row.player_ids.split(',').map(id => parseInt(id)) : []
      };
      res.status(row.id === sessionId ? 201 : 200).json(session);
    }
  });
}

module.exports = router;
