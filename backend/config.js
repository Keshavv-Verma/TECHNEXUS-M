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
    connectRetries: parseInt(process.env.MONGODB_CONNECT_RETRIES || '5', 10),
    connectRetryDelayMs: parseInt(process.env.MONGODB_CONNECT_RETRY_DELAY_MS || '5000', 10),
    options: {
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || '10000', 10),
      socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS || '45000', 10),
    },
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRE || '1h',
    // New: refresh token expiration (default 7 days)
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
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

  // Frontend (Stripe redirect URLs)
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, ''),

  // Payment
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

  // AI endpoints (stricter than general API)
  aiRateLimit: {
    windowMs: parseInt(process.env.AI_RATE_LIMIT_WINDOW_MS || 60000, 10),
    maxRequests: parseInt(process.env.AI_RATE_LIMIT_MAX_REQUESTS || 10, 10),
  },

  // Gemini AI (server-side only — never expose in frontend)
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    useFallback: process.env.AI_USE_FALLBACK !== 'false',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    file: process.env.LOG_FILE || null,
  },
};

// Validation for production
if (config.isProduction) {
  const requiredEnvVars = ['JWT_SECRET', 'STRIPE_SECRET_KEY', 'CORS_ORIGIN', 'GEMINI_API_KEY'];
  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (!process.env.DATABASE_URL && !process.env.MONGODB_URL) {
    missingEnvVars.push('DATABASE_URL or MONGODB_URL');
  }

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }

  // Ensure JWT secret is strong (at least 32 characters)
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long in production');
  }
}

module.exports = config;
