import express from 'express';
import { query } from '../database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all brands
router.get('/', authenticateToken, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'traffic_admin';
    
    let whereClause = '';
    const params = [];

    // Non-admin users can only see their own brands
    if (!isAdmin) {
      whereClause = 'WHERE owner_id = $1';
      params.push(req.user.id);
    }

    // Get brands with order count
    const result = await query(`
      SELECT 
        b.*,
        COUNT(e.id) > 0 as has_orders
      FROM brands b
      LEFT JOIN estimates e ON b.id = e.brand_id
      ${whereClause}
      GROUP BY b.id
      ORDER BY b.common_name
    `, params);

    res.json({ data: result.rows, error: null });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to fetch brands' } });
  }
});

// Get brand by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'traffic_admin';

    let whereClause = 'WHERE b.id = $1';
    const params = [id];

    // Non-admin users can only see their own brands
    if (!isAdmin) {
      whereClause += ' AND b.owner_id = $2';
      params.push(req.user.id);
    }

    const result = await query(`
      SELECT 
        b.*,
        COUNT(e.id) > 0 as has_orders
      FROM brands b
      LEFT JOIN estimates e ON b.id = e.brand_id
      ${whereClause}
      GROUP BY b.id
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ data: null, error: { message: 'Brand not found' } });
    }

    res.json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Get brand error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to fetch brand' } });
  }
});

// Create new brand
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      common_name,
      legal_name,
      address,
      phone,
      email,
      contact_person
    } = req.body;

    if (!common_name || !legal_name) {
      return res.status(400).json({ 
        data: null, 
        error: { message: 'Common name and legal name are required' } 
      });
    }

    const result = await query(`
      INSERT INTO brands (
        common_name, legal_name, address, phone, email,
        contact_person, owner_id, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `, [
      common_name, legal_name, address, phone, email,
      contact_person, req.user.id
    ]);

    res.status(201).json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to create brand' } });
  }
});

// Update brand
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'traffic_admin';
    
    // Check if user owns the brand or is admin
    let checkQuery = 'SELECT owner_id FROM brands WHERE id = $1';
    const checkParams = [id];
    
    const checkResult = await query(checkQuery, checkParams);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ data: null, error: { message: 'Brand not found' } });
    }

    if (!isAdmin && checkResult.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ data: null, error: { message: 'Not authorized' } });
    }

    const updates = [];
    const params = [];
    let paramCount = 0;

    // Build dynamic update query
    const allowedFields = [
      'common_name', 'legal_name', 'address', 'phone', 'email',
      'contact_person'
    ];

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

    // Add ID for WHERE clause
    paramCount++;
    params.push(id);

    const result = await query(`
      UPDATE brands 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `, params);

    res.json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Update brand error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to update brand' } });
  }
});

// Delete brand
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'traffic_admin';
    
    // Check if user owns the brand or is admin
    let checkQuery = `
      SELECT b.owner_id, COUNT(e.id) as order_count
      FROM brands b
      LEFT JOIN estimates e ON b.id = e.brand_id
      WHERE b.id = $1
      GROUP BY b.id, b.owner_id
    `;
    const checkParams = [id];
    
    const checkResult = await query(checkQuery, checkParams);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ data: null, error: { message: 'Brand not found' } });
    }

    const brand = checkResult.rows[0];

    if (!isAdmin && brand.owner_id !== req.user.id) {
      return res.status(403).json({ data: null, error: { message: 'Not authorized' } });
    }

    // Check if brand has orders
    if (parseInt(brand.order_count) > 0) {
      return res.status(400).json({ 
        data: null, 
        error: { message: 'Cannot delete brand that has associated orders' } 
      });
    }

    const result = await query('DELETE FROM brands WHERE id = $1 RETURNING *', [id]);

    res.json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to delete brand' } });
  }
});

export default router; 