const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');
const {
  rankProductsForQuery,
  buildFallbackRecommendations,
  enrichRecommendations,
} = require('./productMatcher');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const USE_GEMINI_FALLBACK = process.env.AI_USE_FALLBACK !== 'false';

const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

/** Map Gemini SDK errors to HTTP-friendly status codes */
const classifyGeminiError = (error) => {
  const message = error?.message || String(error);
  if (message.includes('429') || message.includes('quota') || message.includes('Quota exceeded')) {
    return { statusCode: 503, error: 'AI service is temporarily busy. Please try again in a minute.' };
  }
  if (message.includes('404') && message.includes('models/')) {
    return {
      statusCode: 503,
      error: `AI model "${GEMINI_MODEL}" is unavailable. Set GEMINI_MODEL in .env to a supported model.`,
    };
  }
  if (message.includes('API key') || message.includes('API_KEY_INVALID')) {
    return { statusCode: 503, error: 'AI service is not configured. Set GEMINI_API_KEY in backend .env.' };
  }
  return { statusCode: 500, error: `AI service error: ${message}` };
};

/**
 * Get AI-powered product recommendations based on user query
 * @param {string} userQuery - User's product search query/requirements
 * @param {Array} products - Array of available products from database
 * @returns {Promise<Object>} - AI recommendation response with structured data
 */
const getAIRecommendations = async (userQuery, products) => {
  try {
    // Validate inputs
    if (!userQuery || userQuery.trim().length === 0) {
      throw new Error('User query is empty');
    }

    if (!products || products.length === 0) {
      throw new Error('No products available in catalog');
    }

    const relevantProducts = rankProductsForQuery(userQuery, products, 25);

    if (relevantProducts.length === 0) {
      return buildFallbackRecommendations(userQuery, products);
    }

    const model = getGenAI().getGenerativeModel({ model: GEMINI_MODEL });

    const productCatalog = relevantProducts.map((p) => ({
      name: p.name,
      price: typeof p.price === 'number' ? `₹${p.price}` : p.price,
      rating: p.rating || 4,
      description: (p.description || 'N/A').substring(0, 100),
      stock: p.stock || 0,
      id: String(p._id),
    }));

    const systemPrompt = `You are TechNexus AI, an expert shopping advisor for TechNexus, a tech e-commerce platform.

INSTRUCTIONS:
1. ONLY recommend products from the catalog provided (names must match exactly)
2. Ignore emojis in the user query; parse prices like "₹70,000" as 70000
3. For "under X" budgets, prefer products at or below X; if none exist, pick the closest option slightly above budget and mention that in "why"
4. "Gaming laptop" means laptop products (not keyboards, mice, or phones)
5. If no matching product exists, return JSON with recommendation.productName set to "No matching products found"
6. Return ONLY valid JSON, no markdown or extra text
7. Use this exact JSON structure:
{
  "recommendation": {
    "productName": "Product Name",
    "why": ["reason1", "reason2", "reason3"],
    "price": "₹XXXX or $XXX",
    "rating": 4.5,
    "stock": 10,
    "productId": "id"
  },
  "alternatives": [
    {
      "productName": "Product Name",
      "reason": "why it's relevant",
      "price": "price",
      "rating": 4.0,
      "productId": "id"
    }
  ],
  "verdict": "summary"
}
8. Include 6–8 alternatives when enough catalog items match; each must include productId from the catalog`;

    const userMessage = `PRODUCT CATALOG:
${JSON.stringify(productCatalog, null, 2)}

USER QUERY: "${userQuery}"

Find the best matching product(s) from the catalog. Return ONLY valid JSON.`;

    const result = await model.generateContent(`${systemPrompt}\n\n${userMessage}`);

    const response = result.response;
    const textContent = response.text();

    logger.debug('Gemini response received', { length: textContent.length });

    // Parse JSON response
    try {
      // Extract JSON from response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        logger.warn('No JSON found in Gemini response');
        if (USE_GEMINI_FALLBACK) {
          return buildFallbackRecommendations(userQuery, products);
        }
        return {
          success: false,
          statusCode: 502,
          error: 'Invalid AI response format - no JSON found',
          rawResponse: textContent.substring(0, 500),
        };
      }

      const recommendations = JSON.parse(jsonMatch[0]);
      
      const productName = recommendations.recommendation?.productName || '';
      const noMatch =
        !productName ||
        /no matching products/i.test(productName);

      if (noMatch) {
        if (USE_GEMINI_FALLBACK) {
          return buildFallbackRecommendations(userQuery, products);
        }
        return {
          success: false,
          statusCode: 404,
          error: 'No matching products found for your query',
          rawResponse: textContent,
        };
      }

      return {
        success: true,
        data: enrichRecommendations(recommendations, userQuery, products),
        source: 'gemini',
      };
    } catch (parseError) {
      logger.warn('Gemini JSON parse error', parseError.message);
      if (USE_GEMINI_FALLBACK) {
        return buildFallbackRecommendations(userQuery, products);
      }
      return {
        success: false,
        statusCode: 502,
        error: `Failed to parse AI response: ${parseError.message}`,
        rawResponse: textContent.substring(0, 500),
      };
    }
  } catch (error) {
    logger.error('Error in getAIRecommendations', error.message);
    if (USE_GEMINI_FALLBACK) {
      logger.warn('Gemini unavailable, using keyword fallback');
      return buildFallbackRecommendations(userQuery, products);
    }
    const classified = classifyGeminiError(error);
    return { success: false, ...classified };
  }
};

/**
 * Chat with AI about products
 * @param {string} message - User message/query
 * @param {Array} products - Available products
 * @returns {Promise<string>} - AI response
 */
const chatWithAI = async (message, products) => {
  try {
    if (!message || message.trim().length === 0) {
      throw new Error('Message is empty');
    }

    if (!products || products.length === 0) {
      throw new Error('No products available in catalog');
    }

    const relevantProducts = rankProductsForQuery(message, products, 15);
    const model = getGenAI().getGenerativeModel({ model: GEMINI_MODEL });

    const productCatalog = relevantProducts
      .map(
        (p) =>
          `- ${p.name}: ${typeof p.price === 'number' ? `₹${p.price}` : p.price} (Rating: ${p.rating || 4}/5, Stock: ${p.stock || 0})`
      )
      .join('\n');

    const prompt = `You are TechNexus AI, a helpful shopping advisor for TechNexus e-commerce. Available products:

${productCatalog}

User: ${message}

Respond helpfully with product recommendations ONLY from the list above. Be concise and friendly (1-2 sentences max). Only mention products that exist in the list.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    logger.debug('AI chat response received', { length: response.length });

    return response;
  } catch (error) {
    logger.error('Error in chatWithAI', error.message);
    if (USE_GEMINI_FALLBACK) {
      const fallback = buildFallbackRecommendations(message, products);
      if (fallback.success) {
        const { recommendation, verdict } = fallback.data;
        return `${recommendation.productName} (${recommendation.price}) — ${verdict}`;
      }
    }
    const classified = classifyGeminiError(error);
    const err = new Error(classified.error);
    err.statusCode = classified.statusCode;
    throw err;
  }
};

module.exports = {
  getAIRecommendations,
  chatWithAI,
};
