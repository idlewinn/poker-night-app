import express, { Request, Response } from 'express';
import db from '../database/db';
import {
  Player,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  TypedRequest
} from '../types/index';

const router = express.Router();

// GET all players
router.get('/', (req: Request, res: Response) => {
  const sql = 'SELECT * FROM players ORDER BY created_at DESC';
  
  db.all(sql, [], (err: Error | null, rows: Player[]) => {
    if (err) {
      console.error('Error fetching players:', err.message);
      res.status(500).json({ error: 'Failed to fetch players' });
    } else {
      res.json(rows);
    }
  });
});

// GET player by ID
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM players WHERE id = ?';
  
  db.get(sql, [id], (err: Error | null, row: Player | undefined) => {
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
router.post('/', (req: TypedRequest<CreatePlayerRequest>, res: Response): void => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Player name is required' });
    return;
  }
  
  const sql = 'INSERT INTO players (name) VALUES (?)';
  
  db.run(sql, [name.trim()], function(this: any, err: Error | null) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(409).json({ error: 'Player name already exists' });
      } else {
        console.error('Error creating player:', err.message);
        res.status(500).json({ error: 'Failed to create player' });
      }
    } else {
      // Return the created player
      db.get('SELECT * FROM players WHERE id = ?', [this.lastID], (err: Error | null, row: Player | undefined) => {
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
router.put('/:id', (req: TypedRequest<UpdatePlayerRequest>, res: Response): void => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Player name is required' });
    return;
  }
  
  const sql = 'UPDATE players SET name = ? WHERE id = ?';
  
  db.run(sql, [name.trim(), id], function(this: any, err: Error | null) {
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
      db.get('SELECT * FROM players WHERE id = ?', [id], (err: Error | null, row: Player | undefined) => {
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
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const sql = 'DELETE FROM players WHERE id = ?';
  
  db.run(sql, [id], function(this: any, err: Error | null) {
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

export default router;
