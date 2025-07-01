import AWS from 'aws-sdk';
import multer from 'multer';
import { config } from '../config.js';
import { query } from '../database.js';
import fs from 'fs';
import path from 'path';

// Configure AWS
console.log('AWS Configuration:', {
  accessKey: config.aws.accessKey ? `${config.aws.accessKey.substring(0, 4)}...` : 'NOT SET',
  secretKey: config.aws.secretKey ? `${config.aws.secretKey.substring(0, 4)}...` : 'NOT SET',
  s3Bucket: config.aws.s3Bucket,
  region: 'us-east-1'
});

AWS.config.update({
  accessKeyId: config.aws.accessKey,
  secretAccessKey: config.aws.secretKey,
  region: 'us-east-1'
});

const s3 = new AWS.S3();

// Create temporary uploads directory
const tempDir = './temp-uploads';
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Create multer upload middleware for temporary local storage
export const multerUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, tempDir);
    },
    filename: function (req, file, cb) {
      // Generate unique temporary filename
      const timestamp = Date.now();
      const extension = path.extname(file.originalname);
      const filename = `temp_${timestamp}${extension}`;
      cb(null, filename);
    }
  }),
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow video and audio files
    const allowedMimes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-ms-wmv',
      'audio/mpeg',
      'audio/wav',
      'audio/x-wav',
      'audio/mp4'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video and audio files are allowed.'), false);
    }
  }
});

// Upload file to S3 after multer processing
export const uploadFileToS3 = async (file, userId, brandId, isPreview = false) => {
  try {
    console.log('Starting S3 upload for file:', file.originalname);
    console.log('User ID:', userId, 'Brand ID:', brandId, 'Is Preview:', isPreview);
    
    // Fetch username and brand name from database
    const userResult = await query('SELECT email FROM users WHERE id = $1', [userId]);
    const brandResult = await query('SELECT common_name FROM brands WHERE id = $1', [brandId]);
    
    if (!userResult.rows.length) {
      throw new Error(`User not found with ID: ${userId}`);
    }
    if (!brandResult.rows.length) {
      throw new Error(`Brand not found with ID: ${brandId}`);
    }
    
    const username = userResult.rows[0].email.split('@')[0]; // Use email prefix as username
    const brandName = brandResult.rows[0].common_name;
    
    console.log('Username:', username, 'Brand name:', brandName);
    
    // Generate S3 key with username/brand name structure
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const baseName = file.originalname.replace(/\.[^/.]+$/, "");
    
    // Sanitize names for file paths (remove special characters)
    const sanitizedUsername = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const sanitizedBrandName = brandName.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    // Different path structure for previews
    let s3Key;
    if (isPreview) {
      s3Key = `SpotGrid/previews/${sanitizedUsername}/${sanitizedBrandName}/${timestamp}_${baseName}${extension}`;
    } else {
      s3Key = `SpotGrid/uploads/${sanitizedUsername}/${sanitizedBrandName}/${timestamp}_${baseName}${extension}`;
    }
    
    console.log('Generated S3 key:', s3Key);
    console.log('Reading file from:', file.path);
    
    // Read file from temporary location
    const fileContent = fs.readFileSync(file.path);
    console.log('File content size:', fileContent.length, 'bytes');
    
    // Upload to S3
    const params = {
      Bucket: config.aws.s3Bucket,
      Key: s3Key,
      Body: fileContent,
      ContentType: file.mimetype,
      ACL: 'private',
      Metadata: {
        originalName: file.originalname,
        uploadedBy: userId.toString(),
        brandId: brandId.toString(),
        username: sanitizedUsername,
        brandName: sanitizedBrandName,
        isPreview: isPreview.toString(),
        uploadedAt: new Date().toISOString()
      }
    };
    
    console.log('S3 upload params:', {
      Bucket: params.Bucket,
      Key: params.Key,
      ContentType: params.ContentType,
      BodySize: params.Body.length
    });
    
    const result = await s3.upload(params).promise();
    console.log('S3 upload successful:', result.Location);
    
    // Clean up temporary file
    fs.unlinkSync(file.path);
    console.log('Temporary file cleaned up:', file.path);
    
    return {
      key: s3Key,
      location: result.Location,
      bucket: result.Bucket,
      size: file.size,
      mimetype: file.mimetype,
      originalname: file.originalname
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    // Clean up temporary file on error
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
      console.log('Temporary file cleaned up after error:', file.path);
    }
    throw error;
  }
};

// Generate presigned URL for private file access
export const generatePresignedUrl = (key, expiresIn = 3600) => {
  const params = {
    Bucket: config.aws.s3Bucket,
    Key: key,
    Expires: expiresIn
  };
  
  return s3.getSignedUrl('getObject', params);
};

// Delete file from S3
export const deleteFromS3 = async (key) => {
  const params = {
    Bucket: config.aws.s3Bucket,
    Key: key
  };
  
  try {
    await s3.deleteObject(params).promise();
    console.log(`Successfully deleted ${key} from S3`);
    return true;
  } catch (error) {
    console.error(`Error deleting ${key} from S3:`, error);
    throw error;
  }
};

// Get file metadata from S3
export const getS3FileInfo = async (key) => {
  const params = {
    Bucket: config.aws.s3Bucket,
    Key: key
  };
  
  try {
    const data = await s3.headObject(params).promise();
    return {
      size: data.ContentLength,
      lastModified: data.LastModified,
      contentType: data.ContentType,
      metadata: data.Metadata
    };
  } catch (error) {
    console.error(`Error getting file info for ${key}:`, error);
    throw error;
  }
};

export default s3; 