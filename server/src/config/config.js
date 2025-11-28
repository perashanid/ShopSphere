const config = {
  // Server settings
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database settings
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce',
  
  // JWT settings
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
  jwtExpire: process.env.JWT_EXPIRE || '24h',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  
  // Email settings
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  
  // Payment settings
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },
  
  // File upload settings
  upload: {
    maxFileSize: process.env.MAX_FILE_SIZE || 5242880, // 5MB
    uploadPath: process.env.UPLOAD_PATH || './uploads'
  },
  
  // Redis settings
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // Client URL for CORS
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000'
};

module.exports = config;