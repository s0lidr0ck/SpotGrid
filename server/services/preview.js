import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import fs from 'fs';
import path from 'path';
import { uploadFileToS3 } from './s3.js';

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath.path);

// Create preview directory
const previewDir = './temp-previews';
if (!fs.existsSync(previewDir)) {
  fs.mkdirSync(previewDir, { recursive: true });
}

/**
 * Generate a low-resolution preview of a video file
 * @param {string} inputPath - Path to the original video file
 * @param {string} originalFilename - Original filename
 * @param {string} userId - User ID
 * @param {string} brandId - Brand ID
 * @param {Function} progressCallback - Optional callback for progress updates
 * @returns {Promise<Object>} Preview file information
 */
export const generateVideoPreview = async (inputPath, originalFilename, userId, brandId, progressCallback) => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const baseName = path.parse(originalFilename).name;
    const previewFilename = `preview_${timestamp}_${baseName}.mp4`;
    const previewPath = path.join(previewDir, previewFilename);

    // Make a copy of the input file since uploadFileToS3 will delete it
    const tempInputPath = path.join(previewDir, `temp_input_${timestamp}${path.extname(originalFilename)}`);
    
    console.log('Generating preview for:', originalFilename);
    console.log('Making temp copy from:', inputPath, 'to:', tempInputPath);
    
    try {
      // Copy the input file to a temporary location
      fs.copyFileSync(inputPath, tempInputPath);
    } catch (copyError) {
      console.error('Error copying input file:', copyError);
      reject(copyError);
      return;
    }

    console.log('Preview output path:', previewPath);

    if (progressCallback) {
      progressCallback({ stage: 'preview', progress: 0, message: 'Starting preview generation...' });
    }

    ffmpeg(tempInputPath)
      .size('640x360') // Low resolution for previews
      .videoBitrate('500k') // Low bitrate for smaller file size
      .audioBitrate('64k') // Low audio bitrate
      .format('mp4')
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-preset fast', // Fast encoding
        '-crf 28', // Higher CRF for smaller file size
        '-movflags +faststart' // Optimize for web streaming
      ])
      .on('start', (commandLine) => {
        console.log('FFmpeg command:', commandLine);
        if (progressCallback) {
          progressCallback({ stage: 'preview', progress: 0, message: 'Encoding preview video...' });
        }
      })
      .on('progress', (progress) => {
        const percent = Math.round(progress.percent || 0);
        console.log(`Preview generation progress: ${percent}%`);
        if (progressCallback) {
          progressCallback({ 
            stage: 'preview', 
            progress: percent, 
            message: `Generating preview... ${percent}%` 
          });
        }
      })
      .on('end', async () => {
        try {
          console.log('Preview generation completed');
          
          if (progressCallback) {
            progressCallback({ stage: 'preview', progress: 100, message: 'Preview generated, uploading to S3...' });
          }
          
          // Clean up temp input file
          if (fs.existsSync(tempInputPath)) {
            fs.unlinkSync(tempInputPath);
          }
          
          // Check if preview file was created
          if (!fs.existsSync(previewPath)) {
            throw new Error('Preview file was not created');
          }

          const stats = fs.statSync(previewPath);
          console.log('Preview file size:', stats.size, 'bytes');

          // Create a file object similar to multer's format
          const previewFile = {
            originalname: previewFilename,
            path: previewPath,
            size: stats.size,
            mimetype: 'video/mp4'
          };

          // Upload preview to S3
          const previewResult = await uploadFileToS3(previewFile, userId, brandId, true); // Pass true for isPreview
          
          console.log('Preview uploaded to S3:', previewResult.location);
          
          if (progressCallback) {
            progressCallback({ stage: 'preview', progress: 100, message: 'Preview upload complete!' });
          }
          
          resolve({
            preview_path: previewResult.key,
            preview_size: previewResult.size,
            preview_url: previewResult.location
          });
        } catch (error) {
          console.error('Error uploading preview:', error);
          // Clean up files on error
          if (fs.existsSync(previewPath)) {
            fs.unlinkSync(previewPath);
          }
          if (fs.existsSync(tempInputPath)) {
            fs.unlinkSync(tempInputPath);
          }
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('FFmpeg error:', error);
        // Clean up files on error
        if (fs.existsSync(previewPath)) {
          fs.unlinkSync(previewPath);
        }
        if (fs.existsSync(tempInputPath)) {
          fs.unlinkSync(tempInputPath);
        }
        reject(error);
      })
      .save(previewPath);
  });
};

/**
 * Generate a thumbnail image from a video file
 * @param {string} inputPath - Path to the original video file
 * @param {string} originalFilename - Original filename
 * @param {string} userId - User ID
 * @param {string} brandId - Brand ID
 * @param {Function} progressCallback - Optional callback for progress updates
 * @returns {Promise<Object>} Thumbnail file information
 */
export const generateVideoThumbnail = async (inputPath, originalFilename, userId, brandId, progressCallback) => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const baseName = path.parse(originalFilename).name;
    const thumbnailFilename = `thumb_${timestamp}_${baseName}.jpg`;
    const thumbnailPath = path.join(previewDir, thumbnailFilename);

    // Make a copy of the input file since uploadFileToS3 will delete it
    const tempInputPath = path.join(previewDir, `temp_thumb_input_${timestamp}${path.extname(originalFilename)}`);
    
    console.log('Generating thumbnail for:', originalFilename);
    console.log('Making temp copy from:', inputPath, 'to:', tempInputPath);
    
    try {
      // Copy the input file to a temporary location
      fs.copyFileSync(inputPath, tempInputPath);
    } catch (copyError) {
      console.error('Error copying input file for thumbnail:', copyError);
      reject(copyError);
      return;
    }

    console.log('Thumbnail output path:', thumbnailPath);

    if (progressCallback) {
      progressCallback({ stage: 'thumbnail', progress: 0, message: 'Generating thumbnail...' });
    }

    ffmpeg(tempInputPath)
      .screenshots({
        timestamps: ['10%'], // Take screenshot at 10% of video duration
        filename: thumbnailFilename,
        folder: previewDir,
        size: '320x180' // Small thumbnail size
      })
      .on('end', async () => {
        try {
          console.log('Thumbnail generation completed');
          
          if (progressCallback) {
            progressCallback({ stage: 'thumbnail', progress: 50, message: 'Thumbnail generated, uploading to S3...' });
          }
          
          // Clean up temp input file
          if (fs.existsSync(tempInputPath)) {
            fs.unlinkSync(tempInputPath);
          }
          
          // Check if thumbnail file was created
          if (!fs.existsSync(thumbnailPath)) {
            throw new Error('Thumbnail file was not created');
          }

          const stats = fs.statSync(thumbnailPath);
          console.log('Thumbnail file size:', stats.size, 'bytes');

          // Create a file object similar to multer's format
          const thumbnailFile = {
            originalname: thumbnailFilename,
            path: thumbnailPath,
            size: stats.size,
            mimetype: 'image/jpeg'
          };

          // Upload thumbnail to S3
          const thumbnailResult = await uploadFileToS3(thumbnailFile, userId, brandId, true); // Pass true for isPreview
          
          console.log('Thumbnail uploaded to S3:', thumbnailResult.location);
          
          if (progressCallback) {
            progressCallback({ stage: 'thumbnail', progress: 100, message: 'Thumbnail upload complete!' });
          }
          
          resolve({
            thumbnail_path: thumbnailResult.key,
            thumbnail_size: thumbnailResult.size,
            thumbnail_url: thumbnailResult.location
          });
        } catch (error) {
          console.error('Error uploading thumbnail:', error);
          // Clean up files on error
          if (fs.existsSync(thumbnailPath)) {
            fs.unlinkSync(thumbnailPath);
          }
          if (fs.existsSync(tempInputPath)) {
            fs.unlinkSync(tempInputPath);
          }
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('FFmpeg thumbnail error:', error);
        // Clean up files on error
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
        if (fs.existsSync(tempInputPath)) {
          fs.unlinkSync(tempInputPath);
        }
        reject(error);
      });
  });
};

/**
 * Check if a file is a video that can be processed
 * @param {string} mimetype - File MIME type
 * @returns {boolean}
 */
export const isVideoFile = (mimetype) => {
  const videoMimes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv'
  ];
  return videoMimes.includes(mimetype);
};

/**
 * Clean up temporary preview files older than 1 hour
 */
export const cleanupOldPreviews = () => {
  try {
    const files = fs.readdirSync(previewDir);
    const oneHourAgo = Date.now() - (60 * 60 * 1000);

    files.forEach(file => {
      const filePath = path.join(previewDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime.getTime() < oneHourAgo) {
        fs.unlinkSync(filePath);
        console.log('Cleaned up old preview file:', file);
      }
    });
  } catch (error) {
    console.error('Error cleaning up old previews:', error);
  }
};

// Clean up old previews every hour
setInterval(cleanupOldPreviews, 60 * 60 * 1000); 