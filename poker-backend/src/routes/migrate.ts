import express, { Request, Response } from 'express';
import migrateProduction from '../scripts/migrateProduction';

const router = express.Router();

// Temporary migration endpoint - REMOVE AFTER USE
router.post('/run-migration', async (req: Request, res: Response) => {
  try {
    console.log('🚀 Migration endpoint called');
    
    // Run the migration
    await migrateProduction();
    
    res.json({ 
      success: true, 
      message: 'Migration completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Migration failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
