const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET all players
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM players ORDER BY created_at DESC';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching players:', err.message);
      res.status(500).json({ error: 'Failed to fetch players' });
    } else {
      res.json(rows);
    }
  });
});

// GET player by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM players WHERE id = ?';
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error('Error fetching player:', err.message);
      res.status(500).json({ error: 'Failed to fetch player' });
    } else if (!row) {
      res.status(404).json({ error: 'Player not found' });
    } else {
      res.json(row);
    }
  });
});

// POST create new player
router.post('/', (req, res) => {
  const { name } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Player name is required' });
  }
  
  const sql = 'INSERT INTO players (name) VALUES (?)';
  
  db.run(sql, [name.trim()], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(409).json({ error: 'Player name already exists' });
      } else {
        console.error('Error creating player:', err.message);
        res.status(500).json({ error: 'Failed to create player' });
      }
    } else {
      // Return the created player
      db.get('SELECT * FROM players WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          console.error('Error fetching created player:', err.message);
          res.status(500).json({ error: 'Player created but failed to fetch' });
        } else {
          res.status(201).json(row);
        }
      });
    }
  });
});

// PUT update player
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Player name is required' });
  }
  
  const sql = 'UPDATE players SET name = ? WHERE id = ?';
  
  db.run(sql, [name.trim(), id], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(409).json({ error: 'Player name already exists' });
      } else {
        console.error('Error updating player:', err.message);
        res.status(500).json({ error: 'Failed to update player' });
      }
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Player not found' });
    } else {
      // Return the updated player
      db.get('SELECT * FROM players WHERE id = ?', [id], (err, row) => {
        if (err) {
          console.error('Error fetching updated player:', err.message);
          res.status(500).json({ error: 'Player updated but failed to fetch' });
        } else {
          res.json(row);
        }
      });
    }
  });
});

// DELETE player
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM players WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      console.error('Error deleting player:', err.message);
      res.status(500).json({ error: 'Failed to delete player' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Player not found' });
    } else {
      res.json({ message: 'Player deleted successfully' });
    }
  });
});

module.exports = router;
