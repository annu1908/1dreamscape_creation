const express = require('express');
const OpenAI = require('openai');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Rate limiter: 30 requests per minute per IP
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: 'Too many messages. Please wait a moment before sending more.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(chatLimiter);

// System prompt that defines the AI assistant's personality and knowledge
const SYSTEM_PROMPT = `You are "Dreamscape AI", the friendly and knowledgeable customer support assistant for **Dreamscape Creations** — a premium handcrafted art & gifts e-commerce store based in India.

About the store:
- We sell handcrafted resin art, embroidery pieces, crochet items, and hand-drawn sketches
- Every piece is lovingly made by hand with premium materials
- We offer custom/made-to-order pieces
- Categories: Resin Art, Embroidery, Crochet, Sketches
- Payment is handled via Razorpay (UPI, cards, net banking)
- We ship across India

Your personality:
- Warm, helpful, and enthusiastic about handcrafted art
- Use emojis sparingly but naturally (1-2 per message max)
- Keep responses concise (2-4 sentences usually)
- If asked about specific product availability or pricing, suggest the customer browse the shop or contact support
- If asked something completely unrelated to the store, politely redirect the conversation
- Never make up specific prices, stock levels, or delivery dates
- For order tracking or account issues, suggest the customer check their Order History page or contact via the Contact page

Contact info:
- Instagram: @dreamscape_creation
- WhatsApp: +91 9817800613
- Email: annu02sandhu@gmail.com`;

router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    if (message.trim().length > 1000) {
      return res.status(400).json({ message: 'Message is too long. Please keep it under 1000 characters.' });
    }

    // Initialize NVIDIA NIM client (OpenAI-compatible)
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      console.error('NVIDIA_API_KEY is not set in environment variables');
      return res.status(500).json({ message: 'AI service is not configured. Please try again later.' });
    }

    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });

    // Build conversation messages for context
    const chatMessages = [{ role: 'system', content: SYSTEM_PROMPT }];

    if (Array.isArray(history)) {
      for (const msg of history.slice(-10)) { // Keep last 10 messages for context
        if (msg.role === 'user' && msg.text) {
          chatMessages.push({ role: 'user', content: msg.text });
        } else if (msg.role === 'bot' && msg.text) {
          chatMessages.push({ role: 'assistant', content: msg.text });
        }
      }
    }

    // Add the current user message
    chatMessages.push({ role: 'user', content: message.trim() });

    // Call NVIDIA NIM (Llama 3.3 70B)
    const completion = await client.chat.completions.create({
      model: 'meta/llama-3.3-70b-instruct',
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 300,
    });

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

    res.json({ reply });
  } catch (error) {
    console.error('Chat API error:', error.message);

    // Handle rate limit errors
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('rate')) {
      return res.status(429).json({ message: 'Our AI assistant is a bit busy right now. Please try again in a moment.' });
    }

    // Handle auth errors
    if (error.status === 401 || error.status === 403) {
      console.error('NVIDIA NIM API authentication failed');
      return res.status(500).json({ message: 'AI service authentication error. Please contact support.' });
    }

    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
