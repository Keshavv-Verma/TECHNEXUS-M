/**
 * TechNexus AI Features Test
 * 
 * This script demonstrates how to use the TechNexus AI endpoints
 * for product recommendations and chatting with the AI advisor.
 */

// Example 1: Get AI Recommendations via Query Parameter
console.log('Example 1: AI Recommendations Endpoint\n');
console.log('Endpoint: GET /api/ai/recommendations?query=<user_query>');
console.log(
  'Description: Get AI-powered product recommendations based on user requirements'
);
console.log('\nExample Requests:');
console.log('  1. GET /api/ai/recommendations?query=gaming%20laptop%20under%2070000');
console.log('  2. GET /api/ai/recommendations?query=wireless%20headphones%20for%20gym');
console.log(
  '  3. GET /api/ai/recommendations?query=budget%20smartphone%20with%20good%20camera'
);
console.log(
  '  4. GET /api/ai/recommendations?query=high%20end%20tablet%20for%20content%20creation'
);

console.log('\n---\n');

// Example 2: Chat with AI
console.log('Example 2: AI Chat Endpoint\n');
console.log('Endpoint: POST /api/ai/chat');
console.log('Description: Chat with AI advisor about products');
console.log('\nExample Request Body:');
console.log('  {');
console.log('    "message": "What is the best 4K TV for home entertainment?"');
console.log('  }');

console.log('\n---\n');

// Sample Responses
console.log('Example Response (Recommendations):\n');
console.log(
  JSON.stringify(
    {
      success: true,
      query: 'gaming laptop under 70000',
      recommendations: {
        recommendation: {
          productName: 'Asus ROG Gaming Laptop',
          why: [
            'Perfect for gaming within budget at ₹74,999.99',
            'High performance with excellent build quality',
            'Highly rated at 4.8/5 stars',
          ],
          price: '₹74,999.99',
          rating: 4.8,
          stock: 24,
          productId: '6a0dea24ee406a1098b8dead',
        },
        alternatives: [
          {
            productName: 'Microsoft Surface Pro 9',
            reason:
              'Premium 2-in-1 device if you need both work and entertainment',
            price: '₹96,999.99',
            rating: 4.7,
            productId: '6a0dea25ee406a1098b8deb5',
          },
        ],
        verdict:
          'Asus ROG Gaming Laptop is the best gaming laptop within your budget with excellent performance and value for money.',
      },
    },
    null,
    2
  )
);

console.log('\n---\n');

// Setup Instructions
console.log('SETUP INSTRUCTIONS:\n');
console.log('1. Ensure Gemini API key is set in .env:');
console.log('   GEMINI_API_KEY=your_gemini_api_key');
console.log('   GEMINI_MODEL=gemini-2.0-flash\n');

console.log('2. Ensure @google/generative-ai is installed:');
console.log('   npm install @google/generative-ai\n');

console.log('3. Make sure MongoDB is running with products seeded\n');

console.log('4. Start the backend server:');
console.log('   npm run dev\n');

console.log('5. Test the endpoints using curl or Postman:\n');

console.log('   CURL Example for Recommendations:');
console.log(
  '   curl "http://localhost:5000/api/ai/recommendations?query=gaming%20laptop%20under%2070000"\n'
);

console.log('   CURL Example for Chat:');
console.log(
  '   curl -X POST http://localhost:5000/api/ai/chat \\\n     -H "Content-Type: application/json" \\\n     -d \'{"message":"What is the best smartphone under 50000?"}\'\n'
);

console.log('---\n');
console.log('FEATURES:\n');
console.log('✓ AI-powered product recommendations based on user queries');
console.log('✓ Conversational chat interface for product advice');
console.log('✓ Recommendations ranked by relevance and value');
console.log('✓ Only recommends products from the actual catalog');
console.log('✓ Explanations for each recommendation');
console.log('✓ Real-time access to product prices, ratings, and stock\n');
