import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { query } from '../database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Get user from database to ensure they still exist
    const result = await query('SELECT id, email, role FROM users WHERE id = $1', [decoded.userId]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'traffic_admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}; 