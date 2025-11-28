const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const next = require('next');
require('dotenv').config();

const config = require('./config/config');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Initialize Next.js
const dev = config.nodeEnv !== 'production';
const nextApp = next({
  dev,
  dir: path.join(__dirname, '../../client')
});
const handle = nextApp.getRequestHandler();

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware - Updated for Next.js
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Next.js
  crossOriginEmbedderPolicy: false // Disable COEP for Next.js
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: config.nodeEnv === 'production'
    ? config.clientUrl
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Serve static files from client/public directory
app.use(express.static(path.join(__dirname, '../../client/public')));

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');
const wishlistRoutes = require('./routes/wishlist');

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Modern E-commerce API',
    version: '1.0.0',
    status: 'running'
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Handle all other routes with Next.js
app.all('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'API route not found'
    });
  }

  // Let Next.js handle the request
  return handle(req, res);
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server with Next.js integration
async function startServer() {
  try {
    // Prepare Next.js app
    console.log('🏗️  Preparing Next.js app...');
    await nextApp.prepare();
    console.log('✅ Next.js app prepared');

    // Start server
    const server = app.listen(config.port, () => {
      console.log(`🚀 Full-stack server running on port ${config.port} in ${config.nodeEnv} mode`);
      console.log(`🌐 Frontend and API available at: http://localhost:${config.port}`);
      console.log(`🔌 API endpoints at: http://localhost:${config.port}/api`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      console.log(`Error: ${err.message}`);
      server.close(() => {
        process.exit(1);
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('💤 Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;