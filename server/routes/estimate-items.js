import express from 'express';
import { query } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all estimate items for a specific estimate
router.get('/:estimateId', authenticateToken, async (req, res) => {
  try {
    const { estimateId } = req.params;
    const isAdmin = req.user.role === 'traffic_admin';
    
    // Check if user has access to this estimate
    let accessCheck = 'SELECT owner_id FROM estimates WHERE id = $1';
    const accessParams = [estimateId];
    
    const accessResult = await query(accessCheck, accessParams);
    
    if (accessResult.rows.length === 0) {
      return res.status(404).json({ data: null, error: { message: 'Estimate not found' } });
    }
    
    if (!isAdmin && accessResult.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ data: null, error: { message: 'Not authorized' } });
    }
    
    // Get estimate items with daypart information
    const result = await query(`
      SELECT 
        ei.*,
        dp.name as daypart_name,
        dp.start_time,
        dp.end_time
      FROM estimate_items ei
      LEFT JOIN day_parts dp ON ei.day_part_id = dp.id
      WHERE ei.estimate_id = $1
      ORDER BY ei.created_at
    `, [estimateId]);

    res.json({ data: result.rows, error: null });
  } catch (error) {
    console.error('Get estimate items error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to fetch estimate items' } });
  }
});

// Create new estimate item (add slot selection)
router.post('/:estimateId', authenticateToken, async (req, res) => {
  try {
    const { estimateId } = req.params;
    const { day_part_id, specific_date, user_defined_cpm, spots_per_occurrence } = req.body;
    const isAdmin = req.user.role === 'traffic_admin';
    
    // Check if user has access to this estimate
    let accessCheck = 'SELECT owner_id FROM estimates WHERE id = $1';
    const accessParams = [estimateId];
    
    const accessResult = await query(accessCheck, accessParams);
    
    if (accessResult.rows.length === 0) {
      return res.status(404).json({ data: null, error: { message: 'Estimate not found' } });
    }
    
    if (!isAdmin && accessResult.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ data: null, error: { message: 'Not authorized' } });
    }
    
    // Validate required fields
    if (!day_part_id || !specific_date || !user_defined_cpm || !spots_per_occurrence) {
      return res.status(400).json({ 
        data: null, 
        error: { message: 'Missing required fields: day_part_id, specific_date, user_defined_cpm, spots_per_occurrence' } 
      });
    }
    
    // Insert the new estimate item
    const result = await query(`
      INSERT INTO estimate_items (
        estimate_id, day_part_id, specific_date, user_defined_cpm, spots_per_occurrence, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `, [estimateId, day_part_id, specific_date, user_defined_cpm, spots_per_occurrence]);

    res.status(201).json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Create estimate item error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to create estimate item' } });
  }
});

// Update estimate item
router.put('/:estimateId/:itemId', authenticateToken, async (req, res) => {
  try {
    const { estimateId, itemId } = req.params;
    const { day_part_id, specific_date, user_defined_cpm, spots_per_occurrence } = req.body;
    const isAdmin = req.user.role === 'traffic_admin';
    
    // Check if user has access to this estimate
    let accessCheck = 'SELECT owner_id FROM estimates WHERE id = $1';
    const accessParams = [estimateId];
    
    const accessResult = await query(accessCheck, accessParams);
    
    if (accessResult.rows.length === 0) {
      return res.status(404).json({ data: null, error: { message: 'Estimate not found' } });
    }
    
    if (!isAdmin && accessResult.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ data: null, error: { message: 'Not authorized' } });
    }
    
    const updates = [];
    const params = [];
    let paramCount = 0;

    // Build dynamic update query
    const allowedFields = ['day_part_id', 'specific_date', 'user_defined_cpm', 'spots_per_occurrence'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        paramCount++;
        updates.push(`${field} = $${paramCount}`);
        params.push(req.body[field]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ data: null, error: { message: 'No valid fields to update' } });
    }

    // Add updated_at
    paramCount++;
    updates.push(`updated_at = $${paramCount}`);
    params.push(new Date().toISOString());

    // Add item ID and estimate ID for WHERE clause
    paramCount++;
    params.push(itemId);
    paramCount++;
    params.push(estimateId);

    const result = await query(`
      UPDATE estimate_items 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount - 1} AND estimate_id = $${paramCount}
      RETURNING *
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ data: null, error: { message: 'Estimate item not found' } });
    }

    res.json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Update estimate item error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to update estimate item' } });
  }
});

// Delete estimate item
router.delete('/:estimateId/:itemId', authenticateToken, async (req, res) => {
  try {
    const { estimateId, itemId } = req.params;
    const isAdmin = req.user.role === 'traffic_admin';
    
    // Check if user has access to this estimate
    let accessCheck = 'SELECT owner_id FROM estimates WHERE id = $1';
    const accessParams = [estimateId];
    
    const accessResult = await query(accessCheck, accessParams);
    
    if (accessResult.rows.length === 0) {
      return res.status(404).json({ data: null, error: { message: 'Estimate not found' } });
    }
    
    if (!isAdmin && accessResult.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ data: null, error: { message: 'Not authorized' } });
    }
    
    const result = await query(`
      DELETE FROM estimate_items 
      WHERE id = $1 AND estimate_id = $2
      RETURNING id
    `, [itemId, estimateId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ data: null, error: { message: 'Estimate item not found' } });
    }

    res.json({ data: { id: result.rows[0].id }, error: null });
  } catch (error) {
    console.error('Delete estimate item error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to delete estimate item' } });
  }
});

export default router; 