import dotenv from 'dotenv';

dotenv.config();

export const config = {
  db: {
    host: process.env.DB_HOST || '52.206.24.38',
    port: process.env.DB_PORT || 7260,
    database: process.env.DB_NAME || 'spotgrid',
    user: process.env.DB_USER || 'spotgrid',
    password: process.env.DB_PASSWORD || 'Make-Jesus-Known',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  },
  server: {
    port: process.env.PORT || 3001,
  }
}; 