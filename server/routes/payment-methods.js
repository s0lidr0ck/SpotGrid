import express from 'express';
import { query } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import Stripe from 'stripe';

const router = express.Router();

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2023-10-16',
});

// Get all payment methods for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'traffic_admin';
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Non-admin users can only see their own payment methods
    if (!isAdmin) {
      paramCount++;
      whereClause += ` AND user_id = $${paramCount}`;
      params.push(req.user.id);
    }

    const result = await query(`
      SELECT pm.*
      FROM payment_methods pm
      ${whereClause}
      ORDER BY pm.is_default DESC, pm.created_at DESC
    `, params);

    res.json({ data: result.rows, error: null });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to fetch payment methods' } });
  }
});

// Get payment method by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'traffic_admin';

    let whereClause = 'WHERE pm.id = $1';
    const params = [id];

    // Non-admin users can only see their own payment methods
    if (!isAdmin) {
      whereClause += ' AND pm.user_id = $2';
      params.push(req.user.id);
    }

    const result = await query(`
      SELECT pm.*
      FROM payment_methods pm
      ${whereClause}
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ data: null, error: { message: 'Payment method not found' } });
    }

    res.json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Get payment method error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to fetch payment method' } });
  }
});

// Create new payment method with Stripe
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      stripe_payment_method_id,
      type,
      is_default = false,
      // For testing without Stripe
      test_data
    } = req.body;

    let paymentMethodData = {};

    if (test_data) {
      // Create test payment method without Stripe
      paymentMethodData = {
        type: test_data.type || 'card',
        brand: test_data.brand || 'visa',
        last4: test_data.last4 || '4242',
        exp_month: test_data.exp_month || 12,
        exp_year: test_data.exp_year || 2025,
        stripe_payment_method_id: `pm_test_${Date.now()}`
      };
    } else if (stripe_payment_method_id) {
      // Get payment method details from Stripe
      const stripePaymentMethod = await stripe.paymentMethods.retrieve(stripe_payment_method_id);
      
      paymentMethodData = {
        stripe_payment_method_id: stripePaymentMethod.id,
        type: stripePaymentMethod.type,
        brand: stripePaymentMethod.card?.brand || '',
        last4: stripePaymentMethod.card?.last4 || '',
        exp_month: stripePaymentMethod.card?.exp_month || null,
        exp_year: stripePaymentMethod.card?.exp_year || null
      };
    } else {
      return res.status(400).json({ 
        data: null, 
        error: { message: 'Either stripe_payment_method_id or test_data is required' } 
      });
    }

    // If this is set as default, unset other defaults for this user
    if (is_default) {
      await query(
        'UPDATE payment_methods SET is_default = false WHERE user_id = $1',
        [req.user.id]
      );
    }

    const result = await query(`
      INSERT INTO payment_methods (
        user_id, stripe_payment_method_id, type, brand, last4, 
        exp_month, exp_year, is_default, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `, [
      req.user.id,
      paymentMethodData.stripe_payment_method_id,
      paymentMethodData.type,
      paymentMethodData.brand,
      paymentMethodData.last4,
      paymentMethodData.exp_month,
      paymentMethodData.exp_year,
      is_default
    ]);

    res.status(201).json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Create payment method error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to create payment method' } });
  }
});

// Update payment method
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_default } = req.body;
    const isAdmin = req.user.role === 'traffic_admin';

    // Check if user owns the payment method or is admin
    let checkQuery = 'SELECT user_id FROM payment_methods WHERE id = $1';
    const checkParams = [id];
    
    const checkResult = await query(checkQuery, checkParams);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ data: null, error: { message: 'Payment method not found' } });
    }

    if (!isAdmin && checkResult.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ data: null, error: { message: 'Not authorized' } });
    }

    const updates = [];
    const params = [];
    let paramCount = 0;

    // If setting as default, unset other defaults for this user
    if (is_default === true) {
      await query(
        'UPDATE payment_methods SET is_default = false WHERE user_id = $1',
        [isAdmin ? checkResult.rows[0].user_id : req.user.id]
      );
    }

    // Build dynamic update query
    const allowedFields = ['is_default'];
    
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
      UPDATE payment_methods 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `, params);

    res.json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Update payment method error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to update payment method' } });
  }
});

// Delete payment method
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'traffic_admin';
    
    // Get payment method info first
    let whereClause = 'WHERE id = $1';
    const params = [id];

    // Non-admin users can only delete their own payment methods
    if (!isAdmin) {
      whereClause += ' AND user_id = $2';
      params.push(req.user.id);
    }

    const selectResult = await query(`
      SELECT stripe_payment_method_id FROM payment_methods ${whereClause}
    `, params);

    if (selectResult.rows.length === 0) {
      return res.status(404).json({ data: null, error: { message: 'Payment method not found or not authorized' } });
    }

    const stripePaymentMethodId = selectResult.rows[0].stripe_payment_method_id;

    // Delete from database first
    const result = await query(`
      DELETE FROM payment_methods ${whereClause} RETURNING id
    `, params);

    // Detach from Stripe if it's a real Stripe payment method (not test)
    if (result.rows.length > 0 && stripePaymentMethodId && !stripePaymentMethodId.startsWith('pm_test_')) {
      try {
        await stripe.paymentMethods.detach(stripePaymentMethodId);
      } catch (stripeError) {
        console.error('Failed to detach from Stripe:', stripeError);
        // Don't fail the entire operation if Stripe detach fails
      }
    }

    res.json({ data: { id: id }, error: null });
  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to delete payment method' } });
  }
});

// Validate coupon code
router.post('/validate-coupon', authenticateToken, async (req, res) => {
  try {
    const { coupon_code } = req.body;

    if (!coupon_code) {
      return res.status(400).json({ data: null, error: { message: 'Coupon code is required' } });
    }

    // Try to retrieve the coupon from Stripe
    try {
      const coupon = await stripe.coupons.retrieve(coupon_code);
      
      // Check if coupon is valid and not expired
      const isValid = coupon.valid && (!coupon.redeem_by || coupon.redeem_by > Math.floor(Date.now() / 1000));
      
      if (!isValid) {
        return res.json({ 
          data: { valid: false, message: 'Coupon code is expired or invalid' }, 
          error: null 
        });
      }

      // Return coupon details
      res.json({ 
        data: { 
          valid: true,
          coupon: {
            id: coupon.id,
            name: coupon.name,
            percent_off: coupon.percent_off,
            amount_off: coupon.amount_off,
            currency: coupon.currency,
            duration: coupon.duration,
            duration_in_months: coupon.duration_in_months,
            max_redemptions: coupon.max_redemptions,
            times_redeemed: coupon.times_redeemed
          }
        }, 
        error: null 
      });
    } catch (stripeError) {
      // Coupon doesn't exist or other Stripe error
      res.json({ 
        data: { valid: false, message: 'Coupon code not found' }, 
        error: null 
      });
    }
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to validate coupon code' } });
  }
});

export default router; 