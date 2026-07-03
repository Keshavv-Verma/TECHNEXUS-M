require('express-async-errors');
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const config = require('./config');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const addressRoutes = require('./routes/addressRoutes');
const couponRoutes = require('./routes/couponRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const cartRoutes = require('./routes/cartRoutes');
const aiRoutes = require('./routes/aiRoutes');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Proxy endpoint for matveyan.com to bypass SAMEORIGIN restriction
app.get('/api/proxy-matveyan', async (req, res) => {
  try {
    const response = await fetch('https://matveyan.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).send(`Failed to fetch matveyan.com: ${response.statusText}`);
    }

    let html = await response.text();
    // Inject <base> tag to resolve all relative assets to the source domain
    html = html.replace('<head>', '<head><base href="https://matveyan.com/">');

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    logger.error('Error in matveyan.com proxy', error.message);
    res.status(500).send('Failed to proxy website');
  }
});

// Security headers (CSP, HSTS in production, deny framing)
const helmetOptions = {
  frameguard: { action: 'deny' },
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
};

if (config.isProduction) {
  helmetOptions.hsts = {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  };
} else {
  helmetOptions.hsts = false;
}

app.use(helmet(helmetOptions));

// CORS configuration from config
app.use(cors(config.cors));

// Body parser middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Request logging using Morgan
if (config.isDevelopment) {
  app.use(morgan('dev')); // Detailed logging in development
} else {
  app.use(morgan('combined')); // Standard format in production
}

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api', addressRoutes);
app.use('/api', couponRoutes);
app.use('/api', checkoutRoutes);
app.use('/api', orderRoutes);
app.use('/api', paymentRoutes);
app.use('/api', cartRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
