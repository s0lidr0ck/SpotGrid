import express from 'express';
import { query } from '../database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all estimates (with filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, exclude_status } = req.query;
    const isAdmin = req.user.role === 'traffic_admin';
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Filter by status
    if (status) {
      const statuses = Array.isArray(status) ? status : [status];
      paramCount++;
      whereClause += ` AND e.status = ANY($${paramCount})`;
      params.push(statuses);
    }

    // Exclude statuses (for orders view)
    if (exclude_status) {
      const excludeStatuses = Array.isArray(exclude_status) ? exclude_status : [exclude_status];
      paramCount++;
      whereClause += ` AND NOT (e.status = ANY($${paramCount}))`;
      params.push(excludeStatuses);
    }

    // Non-admin users can only see their own estimates
    if (!isAdmin) {
      paramCount++;
      whereClause += ` AND e.owner_id = $${paramCount}`;
      params.push(req.user.id);
    }

    const result = await query(`
      SELECT 
        e.*,
        b.common_name as brand_name,
        COUNT(ma.id) as media_asset_count
      FROM estimates e
      LEFT JOIN brands b ON e.brand_id = b.id
      LEFT JOIN media_assets ma ON e.id = ma.estimate_id
      ${whereClause}
      GROUP BY e.id, b.common_name
      ORDER BY e.updated_at DESC
    `, params);

    res.json({ data: result.rows, error: null });
  } catch (error) {
    console.error('Get estimates error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to fetch estimates' } });
  }
});

// Get estimate by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'traffic_admin';

    let whereClause = 'WHERE e.id = $1';
    const params = [id];

    // Non-admin users can only see their own estimates
    if (!isAdmin) {
      whereClause += ' AND e.owner_id = $2';
      params.push(req.user.id);
    }

    const result = await query(`
      SELECT 
        e.*,
        b.common_name as brand_name,
        b.legal_name as brand_legal_name,
        ma.filename as media_filename,
        pm.brand as payment_brand,
        pm.last4 as payment_last4
      FROM estimates e
      LEFT JOIN brands b ON e.brand_id = b.id
      LEFT JOIN media_assets ma ON e.media_asset_id = ma.id
      LEFT JOIN payment_methods pm ON e.payment_method_id = pm.id
      ${whereClause}
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ data: null, error: { message: 'Estimate not found' } });
    }

    res.json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Get estimate error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to fetch estimate' } });
  }
});

// Create new estimate
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      estimate_name = 'New Order',
      start_date = new Date().toISOString().split('T')[0],
      total_spend = 0,
      total_estimated_cost = 0,
      status = 'draft',
      brand_id
    } = req.body;

    // Ensure we have a valid name value
    const name = estimate_name || 'New Order';

    const result = await query(`
      INSERT INTO estimates (
        name, estimate_name, start_date, total_spend, total_estimated_cost, 
        status, owner_id, brand_id, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `, [
      name, estimate_name, start_date, total_spend, total_estimated_cost,
      status, req.user.id, brand_id
    ]);

    res.status(201).json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Create estimate error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to create estimate' } });
  }
});

// Update estimate
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'traffic_admin';
    
    // Check if user owns the estimate or is admin
    let checkQuery = 'SELECT owner_id FROM estimates WHERE id = $1';
    const checkParams = [id];
    
    const checkResult = await query(checkQuery, checkParams);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ data: null, error: { message: 'Estimate not found' } });
    }

    if (!isAdmin && checkResult.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ data: null, error: { message: 'Not authorized' } });
    }

    const updates = [];
    const params = [];
    let paramCount = 0;

    // Build dynamic update query
    const allowedFields = [
      'estimate_name', 'start_date', 'end_date', 'total_spend', 
      'total_estimated_cost', 'status', 'brand_id', 'media_asset_id', 'payment_method_id'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        paramCount++;
        updates.push(`${field} = $${paramCount}`);
        params.push(req.body[field]);
        
        // Also update 'name' field when 'estimate_name' is updated
        if (field === 'estimate_name') {
          paramCount++;
          updates.push(`name = $${paramCount}`);
          params.push(req.body[field]);
        }
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
      UPDATE estimates 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `, params);

    res.json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Update estimate error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to update estimate' } });
  }
});

// Delete estimate
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'traffic_admin';
    
    let whereClause = 'WHERE id = $1';
    const params = [id];

    // Non-admin users can only delete their own estimates
    if (!isAdmin) {
      whereClause += ' AND owner_id = $2';
      params.push(req.user.id);
    }

    const result = await query(`
      DELETE FROM estimates ${whereClause} RETURNING id
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ data: null, error: { message: 'Estimate not found or not authorized' } });
    }

    res.json({ data: { id: result.rows[0].id }, error: null });
  } catch (error) {
    console.error('Delete estimate error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to delete estimate' } });
  }
});

// Get dashboard stats
router.get('/stats/dashboard', authenticateToken, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'traffic_admin';
    let userFilter = '';
    const params = [];
    
    if (!isAdmin) {
      userFilter = 'WHERE owner_id = $1';
      params.push(req.user.id);
    }

    // Get counts by status
    const statsResult = await query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'approved' THEN total_spend ELSE 0 END) as total_budgeted
      FROM estimates 
      ${userFilter}
      GROUP BY status
    `, params);

    // Get brands count
    const brandsResult = await query('SELECT COUNT(*) as count FROM brands');

    // Get media assets count
    const mediaResult = await query('SELECT COUNT(*) as count FROM media_assets');

    // For now, set weekly impressions to 0 since we don't have estimate_items table yet
    const weeklyImpressions = 0;

    // Process stats
    const stats = {
      draftOrders: 0,
      pendingOrders: 0,
      activeOrders: 0,
      totalBudgeted: 0,
      weeklyImpressions: weeklyImpressions,
      activeBrands: parseInt(brandsResult.rows[0]?.count || 0),
      mediaAssets: parseInt(mediaResult.rows[0]?.count || 0),
      paymentMethods: 1 // Mock for now
    };

    statsResult.rows.forEach(row => {
      const count = parseInt(row.count);
      switch (row.status) {
        case 'draft':
          stats.draftOrders = count;
          break;
        case 'ordered':
        case 'modified':
          stats.pendingOrders += count;
          break;
        case 'approved':
          stats.activeOrders = count;
          stats.totalBudgeted = parseFloat(row.total_budgeted || 0);
          break;
      }
    });

    res.json({ data: stats, error: null });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to fetch dashboard stats' } });
  }
});

export default router; 