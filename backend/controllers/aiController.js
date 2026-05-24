const { Product } = require('../models');
const logger = require('../utils/logger');
const { getAIRecommendations, chatWithAI } = require('../services/geminiService');

/**
 * GET /api/ai/recommendations
 * Get AI-powered product recommendations based on user query
 */
const getRecommendations = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required',
        example: '?query=gaming laptop under 70000',
      });
    }

    // Fetch all active products from database
    const products = await Product.find({ isActive: true })
      .select('name description price rating stock subcategory _id')
      .lean();

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No products available in catalog',
      });
    }

    // Get AI recommendations
    const recommendations = await getAIRecommendations(query, products);

    if (!recommendations.success) {
      return res.status(recommendations.statusCode || 500).json({
        success: false,
        error: recommendations.error,
        rawResponse: recommendations.rawResponse,
      });
    }

    res.json({
      success: true,
      query,
      recommendations: recommendations.data,
      source: recommendations.source || 'gemini',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching AI recommendations', error.message);
    next(error);
  }
};

/**
 * POST /api/ai/chat
 * Chat with AI about products
 */
const aiChat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required in request body',
      });
    }

    // Fetch all active products
    const products = await Product.find({ isActive: true })
      .select('name description price rating stock _id')
      .lean();

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No products available',
      });
    }

    // Get AI response
    const aiResponse = await chatWithAI(message, products);

    res.json({
      success: true,
      userMessage: message,
      aiResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in AI chat', error.message);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'AI chat failed',
    });
  }
};

module.exports = {
  getRecommendations,
  aiChat,
};
