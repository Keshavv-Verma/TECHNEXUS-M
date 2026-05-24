const express = require('express');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const { getRecommendations, aiChat } = require('../controllers/aiController');

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: config.aiRateLimit.windowMs,
  max: config.aiRateLimit.maxRequests,
  message: { error: 'Too many AI requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(aiLimiter);

/**
 * @route   GET /api/ai/recommendations
 * @desc    Get AI-powered product recommendations
 * @query   {string} query - User's search query (required)
 * @example GET /api/ai/recommendations?query=gaming laptop under 70000
 */
router.get('/recommendations', getRecommendations);

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with AI about products
 * @body    {string} message - User's message (required)
 * @example POST /api/ai/chat
 *          { "message": "What's a good smartphone under 50000?" }
 */
router.post('/chat', aiChat);

module.exports = router;
