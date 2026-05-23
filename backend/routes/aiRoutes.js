const express = require('express');
const { getRecommendations, aiChat } = require('../controllers/aiController');

const router = express.Router();

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
