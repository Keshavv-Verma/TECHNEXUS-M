import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AIAssistant.css';
import { FiSend, FiX, FiMessageCircle, FiExternalLink } from 'react-icons/fi';
import { BiLoader } from 'react-icons/bi';

const productPagePath = (productId) =>
  productId ? `/productpage/${productId}` : null;

const RecommendationCards = ({ data }) => {
  const { recommendation, alternatives = [], verdict } = data;
  const topPath = productPagePath(recommendation.productId);

  return (
    <div className="ai-rec-block">
      <div className="ai-rec-best">
        <span className="ai-rec-label">Top pick</span>
        {topPath ? (
          <Link to={topPath} className="ai-rec-best-link">
            {recommendation.productName}
            <FiExternalLink className="ai-rec-link-icon" aria-hidden />
          </Link>
        ) : (
          <strong className="ai-rec-best-name">{recommendation.productName}</strong>
        )}
        <div className="ai-rec-meta">
          <span>{recommendation.price}</span>
          <span>⭐ {recommendation.rating}/5</span>
          <span>📦 {recommendation.stock} in stock</span>
        </div>
        {recommendation.why?.length > 0 && (
          <ul className="ai-rec-why">
            {recommendation.why.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        )}
        {topPath && (
          <Link to={topPath} className="ai-rec-cta">
            View product page
          </Link>
        )}
      </div>

      {alternatives.length > 0 && (
        <div className="ai-rec-alternatives">
          <p className="ai-rec-alt-title">More options ({alternatives.length})</p>
          <ul className="ai-rec-alt-list">
            {alternatives.map((alt) => {
              const altPath = productPagePath(alt.productId);
              return (
                <li key={alt.productId || alt.productName} className="ai-rec-alt-item">
                  {altPath ? (
                    <Link to={altPath} className="ai-rec-alt-link">
                      <span className="ai-rec-alt-name">{alt.productName}</span>
                      <FiExternalLink className="ai-rec-link-icon" aria-hidden />
                    </Link>
                  ) : (
                    <span className="ai-rec-alt-name">{alt.productName}</span>
                  )}
                  <span className="ai-rec-alt-meta">
                    {alt.price}
                    {alt.rating != null && ` · ⭐ ${alt.rating}/5`}
                  </span>
                  {alt.reason && <span className="ai-rec-alt-reason">{alt.reason}</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {verdict && <p className="ai-rec-verdict">{verdict}</p>}
    </div>
  );
};

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! 👋 I\'m TechNexus AI, your shopping advisor. What are you looking for today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submitProductQuery = async (query) => {
    const userMessage = {
      id: messages.length + 1,
      text: query,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/ai/recommendations?query=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      if (data.success && data.recommendations?.recommendation?.productName) {
        const aiMessage = {
          id: messages.length + 2,
          sender: 'ai',
          timestamp: new Date(),
          isRecommendation: true,
          recommendationData: data.recommendations,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const errorText =
          data.error ||
          (response.status === 404
            ? 'No matching products in our catalog for that query. Try a broader search or different budget.'
            : response.status >= 500
              ? 'Our AI service is temporarily unavailable. Please try again in a minute.'
              : 'Sorry, I couldn\'t find matching products. Please try a different query.');
        const errorMessage = {
          id: messages.length + 2,
          text: errorText,
          sender: 'ai',
          timestamp: new Date(),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: messages.length + 2,
        text: 'Connection error. Please check if the server is running.',
        sender: 'ai',
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const query = inputValue.trim();
    setInputValue('');
    await submitProductQuery(query);
  };

  const handleQuickQuery = async (query) => {
    setInputValue(query);
    await submitProductQuery(query);
  };

  const quickQueries = [
    '🎮 Gaming laptop under ₹70,000',
    '📱 Budget smartphone with good camera',
    '🎧 Wireless headphones for gym',
    '📺 4K TV for home entertainment',
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        className="ai-assistant-button"
        onClick={() => setIsOpen(!isOpen)}
        title="TechNexus AI Assistant"
      >
        <FiMessageCircle size={24} />
        <span className="ai-assistant-badge">AI</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="ai-assistant-container">
          {/* Header */}
          <div className="ai-assistant-header">
            <div className="ai-assistant-title">
              <FiMessageCircle size={20} />
              <span>TechNexus AI Assistant</span>
            </div>
            <button
              className="ai-close-button"
              onClick={() => setIsOpen(false)}
              title="Close"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="ai-assistant-messages">
            {messages.length <= 1 && (
              <div className="ai-quick-queries">
                <p className="ai-quick-title">Quick queries:</p>
                {quickQueries.map((query, idx) => (
                  <button
                    key={idx}
                    className="ai-quick-button"
                    onClick={() => handleQuickQuery(query)}
                  >
                    {query}
                  </button>
                ))}
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`ai-message ${message.sender} ${
                  message.isError ? 'error' : ''
                } ${message.isRecommendation ? 'recommendation' : ''}`}
              >
                <div className="ai-message-avatar">
                  {message.sender === 'ai' ? '🤖' : '👤'}
                </div>
                <div className="ai-message-content">
                  {message.isRecommendation && message.recommendationData ? (
                    <RecommendationCards data={message.recommendationData} />
                  ) : (
                    <p>{message.text}</p>
                  )}
                  <span className="ai-message-time">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="ai-message ai">
                <div className="ai-message-avatar">🤖</div>
                <div className="ai-message-content">
                  <div className="ai-loading">
                    <BiLoader className="ai-spinner" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form className="ai-assistant-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Ask me about products... (e.g., gaming laptop under ₹70,000)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="ai-input-field"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="ai-send-button"
              title="Send"
            >
              <FiSend size={18} />
            </button>
          </form>

          {/* Footer */}
          <div className="ai-assistant-footer">
            <small>Powered by Google Gemini AI 🚀</small>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
