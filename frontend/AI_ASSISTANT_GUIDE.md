# TechNexus AI Assistant - Frontend Integration Guide

## Overview

The TechNexus AI Assistant is now integrated into your frontend! It appears as a floating chatbot button in the bottom-right corner of the screen.

## Features

✨ **Floating Chat Button** - Always accessible from any page  
💬 **Real-time Chat** - Talk naturally with AI about products  
🎯 **Quick Queries** - One-click product recommendations  
📦 **Product Recommendations** - Get ranked suggestions  
⚡ **Instant Response** - Fast, intelligent replies  
🎨 **Beautiful UI** - Modern, responsive design  
📱 **Mobile Friendly** - Works perfectly on all devices  

---

## Component Files

### Main Component
- **File:** `src/components/AIAssistant/AIAssistant.jsx`
- **Styling:** `src/components/AIAssistant/AIAssistant.css`
- **Integration:** Added to `src/App.js`

---

## How to Use

### 1. Start the Backend Server
```bash
cd backend
npm run dev
```

The backend should run on `http://localhost:5000`

### 2. Start the Frontend
```bash
cd frontend
npm start
```

The frontend runs on `http://localhost:3000`

### 3. Access the AI Assistant

You'll see a floating purple button with "AI" badge in the bottom-right corner of the screen.

**Click the button to:**
- Open the chat window
- See quick query suggestions
- Ask custom questions
- Get product recommendations

---

## Using the AI Assistant

### Method 1: Quick Queries

When you first open the chatbot, you'll see 4 pre-configured quick queries:

1. 🎮 **Gaming laptop under ₹70,000**
2. 📱 **Budget smartphone with good camera**
3. 🎧 **Wireless headphones for gym**
4. 📺 **4K TV for home entertainment**

Simply click any quick query to get instant recommendations.

### Method 2: Custom Questions

Type your own question in the input field at the bottom:

**Examples:**
- "What's the best tablet for content creation?"
- "Show me headphones under ₹5,000"
- "I need a gaming phone"
- "Recommend a smartwatch"
- "Best laptop for programming under ₹50,000"

Press Enter or click the Send button to get recommendations.

---

## API Endpoints Used

The AI Assistant connects to these backend endpoints:

### 1. Get Recommendations
```
GET /api/ai/recommendations?query=<user_query>
```

### 2. Chat with AI
```
POST /api/ai/chat
Body: { "message": "your question" }
```

---

## Configuration

### Environment Variables

The frontend uses `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000
```

This is already configured in your frontend `.env` file.

---

## UI Features

### Floating Button
- **Location:** Bottom-right corner (fixed position)
- **Style:** Purple gradient with "AI" badge
- **Animation:** Smooth slide-up when opened
- **Hover Effects:** Scale and shadow effects

### Chat Window
- **Size:** 420x600px (responsive on mobile)
- **Header:** Purple gradient with title and close button
- **Messages:** User messages on right (blue), AI on left (white)
- **Avatar:** 🤖 for AI, 👤 for user
- **Timestamps:** Shows message time in HH:MM format

### Quick Queries
- **Display:** Only shown when chat is first opened
- **Style:** Blue border buttons with hover effects
- **Animation:** Slide into view

### Input Area
- **Placeholder:** Helpful text about querying
- **Send Button:** Icon button with gradient background
- **Disabled State:** When loading or input empty

---

## Styling

### Colors Used
- **Primary Gradient:** #667eea to #764ba2 (purple/violet)
- **User Message:** #667eea (blue)
- **AI Message:** White with subtle border
- **Error Message:** #ff4757 (red)
- **Background:** #f8f9fa (light gray)

### Responsive Breakpoints
- **Desktop:** 420x600px
- **Tablet (768px):** Adjusted width
- **Mobile (480px):** Full screen with proper spacing

### Animations
- **Slide Up:** Chat window entry
- **Fade In:** Message appearance
- **Scale:** Button hover effect
- **Spin:** Loading spinner

---

## Troubleshooting

### Issue: "Connection error"
**Solution:** 
- Check if backend is running: `npm run dev` in backend folder
- Verify `REACT_APP_API_URL` in `.env` matches backend URL
- Check browser console for CORS errors

### Issue: Quick queries don't work
**Solution:**
- Ensure MongoDB is running with products seeded
- Check backend logs for errors
- Try asking a custom question instead

### Issue: No response from AI
**Solution:**
- Check if Gemini API key is set in backend `.env`
- Verify internet connection
- Check backend logs: `npm run dev`

### Issue: Chat doesn't appear on mobile
**Solution:**
- The chat is fully responsive
- Check if bottom bar/keyboard is blocking it
- Try rotating device to landscape
- Close other floating elements

---

## Customization

### Change Button Position
Edit `AIAssistant.css`:
```css
.ai-assistant-button {
  bottom: 30px;  /* Distance from bottom */
  right: 30px;   /* Distance from right */
}
```

### Change Button Color
Modify the gradient in `AIAssistant.jsx`:
```jsx
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Change Chat Window Size
Edit `AIAssistant.css`:
```css
.ai-assistant-container {
  width: 420px;   /* Width */
  height: 600px;  /* Height */
}
```

### Add More Quick Queries
Modify `AIAssistant.jsx`:
```javascript
const quickQueries = [
  '🎮 Gaming laptop under ₹70,000',
  '📱 Budget smartphone with good camera',
  '🎧 Wireless headphones for gym',
  '📺 4K TV for home entertainment',
  '✨ Add your new query here',
];
```

---

## Integration with Your App

The AIAssistant component is now:
- ✅ Imported in `App.js`
- ✅ Rendered as `<AIAssistant />`
- ✅ Available on all pages
- ✅ Floating above all content (z-index: 999)
- ✅ Fully responsive

It automatically fetches products from your MongoDB and uses the Gemini API for AI recommendations.

---

## API Response Examples

### Successful Recommendation
```json
{
  "success": true,
  "query": "gaming laptop under 70000",
  "recommendations": {
    "recommendation": {
      "productName": "Asus ROG Gaming Laptop",
      "why": ["Perfect for gaming", "Great build quality", "4.8★ rating"],
      "price": "₹74,999.99",
      "rating": 4.8,
      "stock": 24,
      "productId": "..."
    },
    "alternatives": [...]
  }
}
```

### Successful Chat
```json
{
  "success": true,
  "userMessage": "What's the best 4K TV?",
  "aiResponse": "Based on our catalog, I recommend the Samsung 65\" 4K TV..."
}
```

---

## Performance Tips

1. **Cache Products:** The component fetches products on each query
   - Consider caching for better performance
   - Use React Context or Redux for global state

2. **Rate Limiting:** Backend has rate limiting enabled
   - Default: 100 requests per 15 minutes
   - Handle rate limit errors gracefully

3. **Load Time:** First AI response may take 1-2 seconds
   - Loading indicator shows while waiting
   - User sees "Thinking..." message

---

## Browser Support

✅ Chrome/Edge (Chromium)  
✅ Firefox  
✅ Safari  
✅ Mobile browsers  
✅ IE 11+ (with polyfills)  

---

## Future Enhancements

- [ ] Message history persistence
- [ ] User preferences/favorites
- [ ] Product comparison mode
- [ ] Voice input support
- [ ] Dark mode toggle
- [ ] Multiple language support
- [ ] Integration with order history
- [ ] Product wishlist functionality

---

## Support

For issues or questions:
1. Check backend logs: `npm run dev`
2. Check browser console: F12 → Console
3. Verify API connectivity
4. Check MongoDB connection

---

## Summary

Your TechNexus AI Assistant is now:
- 🎯 Fully integrated into the frontend
- 🤖 Connected to Gemini API for AI
- 📦 Pulling real products from MongoDB
- 💬 Ready for customer interactions
- 📱 Responsive on all devices
- ⚡ Fast and reliable

**Just start both servers and click the AI button to begin!**

---

**Last Updated:** May 23, 2026  
**Component Version:** 1.0  
**Status:** Production Ready ✅
