import express from 'express';
import { query } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all dayparts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        id,
        name,
        start_time,
        end_time,
        spot_frequency,
        multiplier,
        expected_views,
        lowest_cpm,
        days,
        created_at,
        updated_at
      FROM day_parts 
      ORDER BY start_time
    `);

    res.json({
      data: result.rows,
      error: null
    });
  } catch (error) {
    console.error('Get dayparts error:', error);
    res.status(500).json({ 
      data: null,
      error: { message: 'Failed to fetch dayparts' }
    });
  }
});

// Get daypart by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT 
        id,
        name,
        start_time,
        end_time,
        spot_frequency,
        multiplier,
        expected_views,
        lowest_cpm,
        days,
        created_at,
        updated_at
      FROM day_parts 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        data: null,
        error: { message: 'Daypart not found' }
      });
    }

    res.json({
      data: result.rows[0],
      error: null
    });
  } catch (error) {
    console.error('Get daypart error:', error);
    res.status(500).json({ 
      data: null,
      error: { message: 'Failed to fetch daypart' }
    });
  }
});

export default router; 