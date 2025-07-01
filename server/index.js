import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';

// Import routes
import authRoutes from './routes/auth.js';
import estimatesRoutes from './routes/estimates.js';
import brandsRoutes from './routes/brands.js';
import daypartsRoutes from './routes/dayparts.js';
import estimateItemsRoutes from './routes/estimate-items.js';
import mediaRoutes from './routes/media.js';
import paymentMethodRoutes from './routes/payment-methods.js';

// Test database connection
import './database.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'], // Vite dev server
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '2gb' }));
app.use(express.urlencoded({ extended: true, limit: '2gb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/estimates', estimatesRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/dayparts', daypartsRoutes);
app.use('/api/estimate-items', estimateItemsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = config.server.port;

app.listen(PORT, () => {
  console.log(`🚀 SpotGrid API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Auth endpoint: http://localhost:${PORT}/api/auth`);
  console.log(`📈 Estimates endpoint: http://localhost:${PORT}/api/estimates`);
}); 