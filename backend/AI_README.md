# TechNexus AI - Product Recommendation System

## Overview

TechNexus AI is an intelligent product recommendation engine powered by Google's Gemini API. It helps customers discover products from the TechNexus catalog based on their specific needs, budget, and preferences.

## Features

✅ **AI-Powered Recommendations** - Get personalized product suggestions based on natural language queries  
✅ **Budget-Aware** - Respects user's budget constraints  
✅ **Real-time Product Data** - Access to live product catalog with prices, ratings, and stock  
✅ **Smart Ranking** - Alternatives ranked from best to worst  
✅ **Conversational Interface** - Chat naturally with the AI advisor  
✅ **Explainable Recommendations** - Clear explanations for why each product is recommended  

---

## API Endpoints

### 1. Get AI Recommendations

**Endpoint:** `GET /api/ai/recommendations?query=<user_query>`

**Description:** Get AI-powered product recommendations based on user requirements

**Query Parameters:**
- `query` (required, string): User's product search query

**Example Requests:**
```
GET /api/ai/recommendations?query=gaming%20laptop%20under%2070000
GET /api/ai/recommendations?query=wireless%20headphones%20for%20gym
GET /api/ai/recommendations?query=budget%20smartphone%20with%20good%20camera
GET /api/ai/recommendations?query=4k%20tv%20for%20home%20entertainment
```

**Response:**
```json
{
  "success": true,
  "query": "gaming laptop under 70000",
  "recommendations": {
    "recommendation": {
      "productName": "Asus ROG Gaming Laptop",
      "why": [
        "Perfect for gaming within budget at ₹74,999.99",
        "High performance with excellent build quality",
        "Highly rated at 4.8/5 stars"
      ],
      "price": "₹74,999.99",
      "rating": 4.8,
      "stock": 24,
      "productId": "6a0dea24ee406a1098b8dead"
    },
    "alternatives": [
      {
        "productName": "Microsoft Surface Pro 9",
        "reason": "Premium 2-in-1 device if you need both work and entertainment",
        "price": "₹96,999.99",
        "rating": 4.7,
        "productId": "6a0dea25ee406a1098b8deb5"
      }
    ],
    "verdict": "Asus ROG Gaming Laptop is the best gaming laptop within your budget with excellent performance and value for money."
  },
  "timestamp": "2026-05-23T10:30:00.000Z"
}
```

---

### 2. Chat with AI

**Endpoint:** `POST /api/ai/chat`

**Description:** Have a conversational chat with the AI advisor about products

**Request Body:**
```json
{
  "message": "What is the best 4K TV for home entertainment?"
}
```

**Example Requests:**
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Recommend a smartphone under ₹50,000 with a great camera"}'
```

**Response:**
```json
{
  "success": true,
  "userMessage": "What is the best 4K TV for home entertainment?",
  "aiResponse": "Based on our catalog, I recommend the Samsung 65\" 4K TV for ₹1,299.99. It offers excellent picture quality, smooth performance, and great value for money. If you prefer OLED technology for perfect blacks and superior contrast, the LG OLED 55\" TV at ₹179,999.99 is also available with a 4.9★ rating.",
  "timestamp": "2026-05-23T10:30:00.000Z"
}
```

---

## Setup & Installation

### 1. Install Dependencies

The `@google/generative-ai` package is already installed:

```bash
npm install @google/generative-ai
```

### 2. Configure Environment Variables

Add the Gemini API key to `.env`:

```env
# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
```

### 3. Verify MongoDB & Product Data

Ensure MongoDB is running and products are seeded:

```bash
# Seed products if not already done
npm run seed:products

# Or verify existing products
node scripts/fetch-products.js
```

### 4. Start the Backend Server

```bash
npm run dev
```

---

## Testing the Endpoints

### Using cURL

**Test Recommendations:**
```bash
curl "http://localhost:5000/api/ai/recommendations?query=gaming%20laptop%20under%2070000"
```

**Test Chat:**
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What smartphone should I buy under 50000?"}'
```

### Using Postman

1. **Recommendations Request:**
   - Method: GET
   - URL: `http://localhost:5000/api/ai/recommendations?query=gaming laptop under 70000`
   - Send

2. **Chat Request:**
   - Method: POST
   - URL: `http://localhost:5000/api/ai/chat`
   - Body (JSON):
     ```json
     {
       "message": "Recommend a budget smartphone with good camera"
     }
     ```
   - Send

### Using Node Script

```bash
node scripts/test-ai-endpoints.js
```

---

## Example Use Cases

### 1. Budget-Conscious Shopping
**Query:** "Best laptop under ₹1,50,000"
- AI will search through available laptops and recommend the best value options

### 2. Specific Purpose
**Query:** "Gaming laptop with 4K display for video editing"
- AI considers both gaming and professional specs, matches with available products

### 3. Category Search
**Query:** "Affordable smartphone with great camera"
- AI prioritizes camera quality among budget smartphones

### 4. Brand Preference
**Query:** "Best Sony headphones in our store"
- AI finds Sony products matching the requirements

### 5. Gift Shopping
**Query:** "Gift for a programmer under ₹2,000"
- AI recommends practical tech gifts within budget

---

## Current Product Categories

### Smartphones 📱
- Samsung Galaxy S24 Ultra (₹130,000)
- Samsung Galaxy S24 (₹90,000)
- Nothing Phone 4A (₹35,000)
- Google Pixel 8 Pro (₹79,999.99)
- OnePlus 12 Pro (₹79,999.99)

### Laptops 💻
- Dell XPS 13 ($1,499.99)
- Asus ROG Gaming Laptop (₹74,999.99)
- Microsoft Surface Pro 9 (₹96,999.99)

### Audio Equipment 🎧
- Sony Headphones WH-1000XM4 ($349.99)
- Bose HeadPhones (₹21,000)
- Skullcandy Crusher (₹6,000)

### Televisions 📺
- Samsung 65" 4K TV ($1,299.99)
- LG OLED 55" TV (₹179,999.99)

### Tablets & Accessories 📱
- Apple iPad Pro 12.9" ($10,099.99)
- PDF Smartwatch Series 7 ($4,299.99)

### Professional Equipment 📷
- Nikon Z9 Camera ($5,499.99)
- DJI Mavic 3 Drone ($2,199.99)

### Smart Devices 🔊
- Bose Smart Speaker ($3,999.99)

---

## How It Works

1. **User Query** → User provides a natural language query about their product needs
2. **Database Fetch** → System retrieves all active products from MongoDB
3. **AI Processing** → Gemini API analyzes the query against the product catalog
4. **Recommendation** → AI provides ranked recommendations with explanations
5. **Response** → Structured JSON response with top pick and alternatives

---

## Error Handling

### No Query Provided
```json
{
  "success": false,
  "error": "Query parameter is required",
  "example": "?query=gaming laptop under 70000"
}
```

### No Products Available
```json
{
  "success": false,
  "error": "No products available in catalog"
}
```

### AI Service Error
```json
{
  "success": false,
  "error": "AI recommendation failed: [error details]"
}
```

---

## Rate Limiting

- Rate limiting is applied to all `/api/` endpoints
- Default: 100 requests per 15 minutes per IP
- Recommendations and Chat endpoints are rate-limited

---

## Best Practices

✅ **Use Natural Language** - Queries work best with conversational language  
✅ **Be Specific** - Include budget, purpose, and preferences  
✅ **Mention Budget** - Helps AI filter relevant options  
✅ **Describe Use Case** - Gaming, work, content creation, etc.  
✅ **Add Preferences** - Brand, color, specifications  

**Good Query Examples:**
- "I need a gaming laptop under ₹70,000 for 1080p gaming"
- "Best budget smartphone with great camera for photography"
- "High-end tablet for video editing and drawing"
- "Wireless headphones for gym with long battery life"
- "4K TV for movie watching under ₹2,00,000"

---

## Integration Examples

### Frontend Integration

```javascript
// Get recommendations
async function getRecommendations(userQuery) {
  const response = await fetch(
    `/api/ai/recommendations?query=${encodeURIComponent(userQuery)}`
  );
  return await response.json();
}

// Chat with AI
async function chatWithAI(message) {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  return await response.json();
}
```

---

## Troubleshooting

### Issue: "GEMINI_API_KEY is not defined"
**Solution:** Check if `GEMINI_API_KEY` is set in `.env` file

### Issue: "No products available in catalog"
**Solution:** Seed products to MongoDB: `npm run seed:products`

### Issue: "AI response parsing failed"
**Solution:** Check MongoDB connection and ensure products are properly formatted

### Issue: Rate limit exceeded
**Solution:** Wait for 15 minutes or use a different IP/device

---

## Future Enhancements

- [ ] Multi-language support
- [ ] User preference learning
- [ ] Price history tracking
- [ ] Comparison mode (compare 2-3 products)
- [ ] Product reviews integration
- [ ] Personalized recommendations based on purchase history
- [ ] Voice input support
- [ ] Integration with recommendation analytics

---

## Support & Contact

For issues or feature requests, contact the TechNexus development team.

**Last Updated:** May 23, 2026  
**API Version:** 1.0  
**Gemini Model:** gemini-2.0-flash (override with `GEMINI_MODEL` in `.env`)
