import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

export const config = {
  db: {
    host: process.env.VITE_DB_HOST || process.env.DB_HOST || '52.206.24.38',
    port: parseInt(process.env.VITE_DB_PORT || process.env.DB_PORT) || 5432,
    database: process.env.VITE_DB_NAME || process.env.DB_NAME || 'spotgrid',
    user: process.env.VITE_DB_USER || process.env.DB_USER || 'spotgrid',
    password: process.env.VITE_DB_PASSWORD || process.env.DB_PASSWORD || 'Make-Jesus-Known',
    ssl: process.env.VITE_DB_SSL === 'true' || process.env.DB_SSL === 'true',
  },
  jwt: {
    secret: process.env.VITE_JWT_SECRET || process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  },
  server: {
    port: process.env.PORT || 3001,
  },
  aws: {
    accessKey: process.env.AWS_ACCESS_KEY || process.env.AWS_ACCES_KEY || process.env.VITE_AWS_ACCESS_KEY,
    secretKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.VITE_AWS_SECRET_ACCESS_KEY,
    s3Bucket: (process.env.S3_BUCKET || process.env.VITE_S3_BUCKET || '').replace('s3://', '').split('/')[0],
    region: process.env.AWS_REGION || process.env.VITE_AWS_REGION || 'us-east-1',
  }
}; 