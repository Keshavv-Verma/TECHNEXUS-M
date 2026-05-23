require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...corsOrigins,
  ...(isProduction ? [] : ['http://localhost:3000', 'http://localhost:3001']),
];

const config = {
  // Environment
  nodeEnv,
  isDevelopment: nodeEnv === 'development',
  isProduction,

  // Server
  port: parseInt(process.env.PORT || 5000),
  host: process.env.HOST || '0.0.0.0',

  // Database (MongoDB Atlas)
  mongodb: {
    url: process.env.MONGODB_URL || process.env.DATABASE_URL,
    options: {
      retryWrites: true,
      w: 'majority',
    },
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRE || '1h',
  },

  // CORS
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Mobile apps, curl, etc.

      const allowVercelPreview =
        !isProduction &&
        process.env.ALLOW_VERCEL_PREVIEWS === 'true' &&
        origin.endsWith('.vercel.app');

      if (allowedOrigins.includes(origin) || allowVercelPreview) {
        return callback(null, true);
      }
      
      return callback(new Error('CORS blocked origin: ' + origin), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },

  // Payment Gateways
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
  },

  // Checkout / e-commerce
  checkout: {
    freeDeliveryThreshold: parseFloat(process.env.FREE_DELIVERY_THRESHOLD || 999),
    shippingCharge: parseFloat(process.env.SHIPPING_CHARGE || 49),
    gstRate: parseFloat(process.env.GST_RATE || 0.18),
    businessDaysMin: parseInt(process.env.BUSINESS_DAYS_MIN || 5, 10),
    businessDaysMax: parseInt(process.env.BUSINESS_DAYS_MAX || 7, 10),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 15000),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    file: process.env.LOG_FILE || null,
  },
};

// Validation for production
if (config.isProduction) {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'STRIPE_SECRET_KEY',
    'CORS_ORIGIN',
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }

  // Ensure JWT secret is strong (at least 32 characters)
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long in production');
  }
}

module.exports = config;
