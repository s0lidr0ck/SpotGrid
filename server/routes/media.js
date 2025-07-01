import express from 'express';
import { query } from '../database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { multerUpload, uploadFileToS3, generatePresignedUrl, deleteFromS3 } from '../services/s3.js';
import { generateVideoPreview, generateVideoThumbnail, isVideoFile } from '../services/preview.js';

const router = express.Router();

// Store active SSE connections for progress updates
const progressConnections = new Map();

// Server-Sent Events endpoint for upload progress
router.get('/upload-progress/:uploadId', (req, res) => {
  const { uploadId } = req.params;
  const { token } = req.query;
  
  // Simple token validation (in production, use proper JWT verification)
  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }
  
  // Set up SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Store connection
  progressConnections.set(uploadId, res);
  
  // Send initial connection message
  res.write(`data: ${JSON.stringify({ stage: 'connected', progress: 0, message: 'Connected to progress stream' })}\n\n`);

  // Clean up on disconnect
  req.on('close', () => {
    progressConnections.delete(uploadId);
  });
});

// Helper function to send progress updates
const sendProgressUpdate = (uploadId, data) => {
  const res = progressConnections.get(uploadId);
  if (res) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
};

// Get all media assets for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { brand_id, status } = req.query;
    const isAdmin = req.user.role === 'traffic_admin';
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Filter by brand
    if (brand_id) {
      paramCount++;
      whereClause += ` AND m.brand_id = $${paramCount}`;
      params.push(brand_id);
    }

    // Filter by status
    if (status) {
      paramCount++;
      whereClause += ` AND m.status = $${paramCount}`;
      params.push(status);
    }

    // Non-admin users can only see their own media or approved media
    if (!isAdmin) {
      paramCount++;
      whereClause += ` AND (m.uploaded_by = $${paramCount} OR m.status = 'approved')`;
      params.push(req.user.id);
    }

    const result = await query(`
      SELECT 
        m.*,
        b.common_name as brand_name,
        u1.email as uploaded_by_email,
        u2.email as approved_by_email
      FROM media_assets m
      LEFT JOIN brands b ON m.brand_id = b.id
      LEFT JOIN users u1 ON m.uploaded_by = u1.id
      LEFT JOIN users u2 ON m.approved_by = u2.id
      ${whereClause}
      ORDER BY m.created_at DESC
    `, params);

    res.json({ data: result.rows, error: null });
  } catch (error) {
    console.error('Get media assets error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to fetch media assets' } });
  }
});

// Get media asset by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'traffic_admin';

    let whereClause = 'WHERE m.id = $1';
    const params = [id];

    // Non-admin users can only see their own media or approved media
    if (!isAdmin) {
      whereClause += ' AND (m.uploaded_by = $2 OR m.status = \'approved\')';
      params.push(req.user.id);
    }

    const result = await query(`
      SELECT 
        m.*,
        b.common_name as brand_name,
        u1.email as uploaded_by_email,
        u2.email as approved_by_email
      FROM media_assets m
      LEFT JOIN brands b ON m.brand_id = b.id
      LEFT JOIN users u1 ON m.uploaded_by = u1.id
      LEFT JOIN users u2 ON m.approved_by = u2.id
      ${whereClause}
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ data: null, error: { message: 'Media asset not found' } });
    }

    res.json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Get media asset error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to fetch media asset' } });
  }
});

// Upload new media asset with S3 storage
router.post('/upload', authenticateToken, multerUpload.single('file'), async (req, res) => {
  console.log('=== UPLOAD ROUTE START ===');
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  
  const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    if (!req.file) {
      return res.status(400).json({ 
        data: null, 
        error: { message: 'No file provided' } 
      });
    }

    const { brand_id, estimate_id } = req.body;

    if (!brand_id) {
      return res.status(400).json({ 
        data: null, 
        error: { message: 'Brand ID is required' } 
      });
    }

    console.log('About to process file...');
    
    // Initialize preview data
    let previewData = {};
    
    // Progress callback for preview generation
    const progressCallback = (data) => {
      sendProgressUpdate(uploadId, data);
    };
    
    // Generate preview and thumbnail for video files BEFORE uploading original
    if (isVideoFile(req.file.mimetype)) {
      console.log('Video file detected, generating preview and thumbnail...');
      
      try {
        sendProgressUpdate(uploadId, { 
          stage: 'processing', 
          progress: 0, 
          message: 'Starting video processing...' 
        });
        
        // Generate low-res preview with progress updates
        const preview = await generateVideoPreview(
          req.file.path, 
          req.file.originalname, 
          req.user.id, 
          brand_id,
          progressCallback
        );
        previewData.preview_path = preview.preview_path;
        console.log('Preview generated:', preview.preview_path);
        
        // Generate thumbnail with progress updates
        const thumbnail = await generateVideoThumbnail(
          req.file.path, 
          req.file.originalname, 
          req.user.id, 
          brand_id,
          progressCallback
        );
        previewData.thumbnail_path = thumbnail.thumbnail_path;
        console.log('Thumbnail generated:', thumbnail.thumbnail_path);
        
      } catch (previewError) {
        console.error('Error generating preview/thumbnail:', previewError);
        sendProgressUpdate(uploadId, { 
          stage: 'error', 
          progress: 0, 
          message: 'Preview generation failed, continuing with upload...' 
        });
        // Continue without preview - don't fail the entire upload
      }
    }
    
    sendProgressUpdate(uploadId, { 
      stage: 'uploading', 
      progress: 0, 
      message: 'Uploading original file to S3...' 
    });
    
    // Upload original file to S3
    const uploadResult = await uploadFileToS3(req.file, req.user.id, brand_id);
    console.log('S3 upload result:', uploadResult);

    sendProgressUpdate(uploadId, { 
      stage: 'complete', 
      progress: 100, 
      message: 'Upload and processing complete!' 
    });

    // Save to database with preview paths
    const result = await query(`
      INSERT INTO media_assets (
        filename, file_path, file_size, mime_type, brand_id, estimate_id,
        status, uploaded_by, preview_path, thumbnail_path, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8, $9, NOW(), NOW())
      RETURNING *
    `, [
      uploadResult.originalname, 
      uploadResult.key, 
      uploadResult.size, 
      uploadResult.mimetype, 
      brand_id, 
      estimate_id,
      req.user.id,
      previewData.preview_path || null,
      previewData.thumbnail_path || null
    ]);

    console.log('Database insert successful');

    // Close progress connection
    setTimeout(() => {
      const progressRes = progressConnections.get(uploadId);
      if (progressRes) {
        progressRes.end();
        progressConnections.delete(uploadId);
      }
    }, 1000);

    res.status(201).json({ 
      data: { ...result.rows[0], uploadId }, 
      error: null 
    });
  } catch (error) {
    console.error('Upload error:', error);
    sendProgressUpdate(uploadId, { 
      stage: 'error', 
      progress: 0, 
      message: 'Upload failed: ' + error.message 
    });
    res.status(500).json({ 
      data: null, 
      error: { message: 'Failed to upload media asset' } 
    });
  }
});

// Create new media asset (legacy endpoint for compatibility)
router.post('/', authenticateToken, async (req, res) => {
  console.log('=== LEGACY MEDIA ROUTE CALLED ===');
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);
  
  try {
    const {
      filename,
      file_path,
      file_size,
      mime_type,
      brand_id,
      estimate_id
    } = req.body;

    if (!filename || !file_path || !mime_type) {
      return res.status(400).json({ 
        data: null, 
        error: { message: 'Filename, file path, and MIME type are required' } 
      });
    }

    const result = await query(`
      INSERT INTO media_assets (
        filename, file_path, file_size, mime_type, brand_id, estimate_id,
        status, uploaded_by, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, NOW(), NOW())
      RETURNING *
    `, [
      filename, file_path, file_size, mime_type, brand_id, estimate_id,
      req.user.id
    ]);

    res.status(201).json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Create media asset error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to create media asset' } });
  }
});

// Get presigned URL for preview file access
router.get('/:id/preview-url', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // 'preview' or 'thumbnail'
    const isAdmin = req.user.role === 'traffic_admin';

    // Get media asset
    let whereClause = 'WHERE id = $1';
    const params = [id];

    // Non-admin users can only access their own media or approved media
    if (!isAdmin) {
      whereClause += ' AND (uploaded_by = $2 OR status = \'approved\')';
      params.push(req.user.id);
    }

    const result = await query(`
      SELECT preview_path, thumbnail_path, status FROM media_assets ${whereClause}
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ data: null, error: { message: 'Media asset not found' } });
    }

    const mediaAsset = result.rows[0];
    let filePath;
    
    if (type === 'thumbnail' && mediaAsset.thumbnail_path) {
      filePath = mediaAsset.thumbnail_path;
    } else if (type === 'preview' && mediaAsset.preview_path) {
      filePath = mediaAsset.preview_path;
    } else {
      return res.status(404).json({ data: null, error: { message: `${type || 'preview'} not available` } });
    }
    
    // Generate presigned URL
    const presignedUrl = generatePresignedUrl(filePath, 3600); // 1 hour expiry

    res.json({ 
      data: { 
        url: presignedUrl, 
        expires_in: 3600,
        type: type || 'preview'
      }, 
      error: null 
    });
  } catch (error) {
    console.error('Get preview URL error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to generate preview URL' } });
  }
});

// Get presigned URL for file access
router.get('/:id/url', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'traffic_admin';

    // Get media asset
    let whereClause = 'WHERE id = $1';
    const params = [id];

    // Non-admin users can only access their own media or approved media
    if (!isAdmin) {
      whereClause += ' AND (uploaded_by = $2 OR status = \'approved\')';
      params.push(req.user.id);
    }

    const result = await query(`
      SELECT file_path, status FROM media_assets ${whereClause}
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ data: null, error: { message: 'Media asset not found' } });
    }

    const mediaAsset = result.rows[0];
    
    // Generate presigned URL
    const presignedUrl = generatePresignedUrl(mediaAsset.file_path, 3600); // 1 hour expiry

    res.json({ 
      data: { 
        url: presignedUrl, 
        expires_in: 3600 
      }, 
      error: null 
    });
  } catch (error) {
    console.error('Get presigned URL error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to generate file URL' } });
  }
});

// Update media asset (admin only for approval)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const isAdmin = req.user.role === 'traffic_admin';
    
    // Check if user owns the media or is admin
    let checkQuery = 'SELECT uploaded_by FROM media_assets WHERE id = $1';
    const checkParams = [id];
    
    const checkResult = await query(checkQuery, checkParams);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ data: null, error: { message: 'Media asset not found' } });
    }

    // Only admin can approve/reject, users can only update their own pending media
    if (!isAdmin && checkResult.rows[0].uploaded_by !== req.user.id) {
      return res.status(403).json({ data: null, error: { message: 'Not authorized' } });
    }

    const updates = [];
    const params = [];
    let paramCount = 0;

    // Build dynamic update query
    const allowedFields = ['filename', 'brand_id', 'estimate_id'];
    
    // Admin can update status
    if (isAdmin && status) {
      allowedFields.push('status');
    }

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        paramCount++;
        updates.push(`${field} = $${paramCount}`);
        params.push(req.body[field]);
      }
    });

    // If admin is approving, set approved_by and approved_at
    if (isAdmin && status === 'approved') {
      paramCount++;
      updates.push(`approved_by = $${paramCount}`);
      params.push(req.user.id);
      
      paramCount++;
      updates.push(`approved_at = $${paramCount}`);
      params.push(new Date().toISOString());
    }

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
      UPDATE media_assets 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `, params);

    res.json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Update media asset error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to update media asset' } });
  }
});

// Delete media asset
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'traffic_admin';
    
    // Get media asset info first
    let whereClause = 'WHERE id = $1';
    const params = [id];

    // Non-admin users can only delete their own pending media
    if (!isAdmin) {
      whereClause += ' AND uploaded_by = $2 AND status = \'pending\'';
      params.push(req.user.id);
    }

    const selectResult = await query(`
      SELECT file_path FROM media_assets ${whereClause}
    `, params);

    if (selectResult.rows.length === 0) {
      return res.status(404).json({ data: null, error: { message: 'Media asset not found or not authorized' } });
    }

    const filePath = selectResult.rows[0].file_path;

    // Delete from database first
    const result = await query(`
      DELETE FROM media_assets ${whereClause} RETURNING id
    `, params);

    // Delete from S3 if database deletion was successful
    if (result.rows.length > 0 && filePath) {
      try {
        await deleteFromS3(filePath);
      } catch (s3Error) {
        console.error('Failed to delete from S3:', s3Error);
        // Don't fail the request if S3 deletion fails
      }
    }

    res.json({ data: { id: result.rows[0].id }, error: null });
  } catch (error) {
    console.error('Delete media asset error:', error);
    res.status(500).json({ data: null, error: { message: 'Failed to delete media asset' } });
  }
});

export default router; 