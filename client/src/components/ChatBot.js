import React, { useState, useRef, useEffect, useCallback } from 'react';
import API from '../api';
import './ChatBot.css';

const SUGGESTIONS = [
  "Suggest a gift",
  "Do you make custom orders?",
  "Show resin products",
  "Shipping and payment",
];

const formatTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const userMessage = text.trim();
    if (!userMessage || isLoading) return;

    setHasInteracted(true);
    setError('');
    setInput('');

    const userMsg = { role: 'user', text: userMessage, time: formatTime() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Build history from existing messages (exclude the latest user message we just added)
      const history = messages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'bot',
        text: msg.text,
      }));

      const { data } = await API.post('/api/chat', {
        message: userMessage,
        history,
      });

      const botMsg = { role: 'bot', text: data.reply, time: formatTime() };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleChipClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
    setError('');
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className="chatbot-panel" id="chatbot-panel">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-header-avatar">✨</div>
              <div className="chatbot-header-text">
                <h3>Dreamscape AI</h3>
                <p className="chatbot-header-status">
                  <span className="chatbot-status-dot"></span>
                  Online — Ready to help
                </p>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={toggleChat} aria-label="Close chat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {/* Welcome message */}
            {!hasInteracted && messages.length === 0 && (
              <>
                <div className="chatbot-welcome">
                  <span className="chatbot-welcome-emoji">🎨</span>
                  <h4>Welcome to Dreamscape Creations!</h4>
                  <p>I'm your AI assistant. Ask me anything about our handcrafted products, shipping, or orders.</p>
                </div>
                <div className="chatbot-suggestions">
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} className="chatbot-chip" onClick={() => handleChipClick(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Message list */}
            {messages.map((msg, index) => (
              <div key={index} className={`chatbot-msg chatbot-msg--${msg.role === 'user' ? 'user' : 'bot'}`}>
                <div className="chatbot-msg-bubble">{msg.text}</div>
                <span className="chatbot-msg-time">{msg.time}</span>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="chatbot-typing">
                <div className="chatbot-typing-dot"></div>
                <div className="chatbot-typing-dot"></div>
                <div className="chatbot-typing-dot"></div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="chatbot-error">
                ⚠️ {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className="chatbot-input-area" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="chatbot-input"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={1000}
              disabled={isLoading}
              id="chatbot-input"
            />
            <button
              type="submit"
              className="chatbot-send-btn"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              id="chatbot-send-btn"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        className={`chatbot-fab ${isOpen ? 'chatbot-fab--open' : ''}`}
        onClick={toggleChat}
        aria-label={isOpen ? 'Close chat' : 'Open chat assistant'}
        id="chatbot-fab"
      >
        {!isOpen && <span className="chatbot-fab-dot"></span>}
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            <path d="M8 10h.01M12 10h.01M16 10h.01" />
          </svg>
        )}
      </button>
    </>
  );
};

export default ChatBot;
