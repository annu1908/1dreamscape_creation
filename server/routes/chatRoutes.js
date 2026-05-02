const express = require('express');
const OpenAI = require('openai');
const rateLimit = require('express-rate-limit');
const Product = require('../models/Product');

const router = express.Router();

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const CHAT_MODEL = process.env.NVIDIA_CHAT_MODEL || 'meta/llama-3.3-70b-instruct';

// Rate limiter: 30 requests per minute per IP
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: 'Too many messages. Please wait a moment before sending more.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(chatLimiter);

const STORE_POLICIES = `Store knowledge:
- Dreamscape Creations is a handcrafted art and gifts e-commerce store based in India.
- Product categories: Resin, Embroidery, Crochet, Sketch.
- Products are handmade, often custom/made-to-order, and small visual differences are normal.
- Customers can add customization details on the product page before adding to cart.
- Payment is handled through Razorpay, including UPI, cards, and net banking.
- Shipping is across India. Use the website/product page for exact current checkout charges.
- If asked for exact delivery status, account details, payment issues, cancellation, or refund for a specific order, ask the customer to check Order History or contact support. Do not request sensitive payment details.
- If asked for custom work, ask for item type, size, colors/theme, name/date/text, budget range, and deadline, then suggest contacting WhatsApp for final confirmation.
- If stockTracked is false or stock is empty, treat the item as made-to-order/available for custom request, not guaranteed ready stock.
- Do not invent products, prices, discounts, delivery dates, or policies that are not in the supplied product context.
- If the supplied product context does not include a requested product, say you could not find an exact match and suggest browsing the shop or contacting support.

Contact info:
- Instagram: @dreamscape_creation
- WhatsApp: +91 9817800613
- Email: annu02sandhu@gmail.com`;

const SYSTEM_PROMPT = `You are "Dreamscape AI", the friendly customer support and shopping assistant for Dreamscape Creations.

${STORE_POLICIES}

How to answer:
- Be warm, concise, and helpful. Usually answer in 2-5 short sentences.
- Use simple language a shopper would understand.
- Use at most one emoji, and only when it feels natural.
- When recommending products, mention product names and prices only from the supplied product context.
- For comparison questions, compare category, use case, customization fit, and price if available.
- For unrelated questions, politely bring the conversation back to Dreamscape products or support.
- Never claim you personally placed, cancelled, refunded, or tracked an order.`;

const CATEGORY_KEYWORDS = {
  Resin: ['resin', 'keychain', 'coaster', 'tray', 'glossy', 'ocean', 'preserved', 'epoxy'],
  Embroidery: ['embroidery', 'embroidered', 'thread', 'stitch', 'stitched', 'hoop', 'fabric'],
  Crochet: ['crochet', 'crocheted', 'yarn', 'wool', 'amigurumi', 'plush', 'flower'],
  Sketch: ['sketch', 'pencil', 'portrait', 'drawing', 'charcoal', 'illustration'],
};

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 3);
}

function getCategoryFromMessage(message) {
  const normalized = String(message || '').toLowerCase();
  return Object.entries(CATEGORY_KEYWORDS).find(([, keywords]) =>
    keywords.some((keyword) => normalized.includes(keyword))
  )?.[0];
}

function summarizeProduct(product) {
  const availability = product.stockTracked
    ? `stock ${product.stock ?? 0}`
    : 'made-to-order';

  return `- ${product.title} | Category: ${product.category || 'Handcrafted'} | Price: INR ${product.price} | ${availability} | Product ID: ${product._id}`;
}

async function buildProductContext(message) {
  const tokens = tokenize(message);
  const category = getCategoryFromMessage(message);
  const filters = [];

  if (category) {
    filters.push({ category: { $regex: new RegExp(`^${category}$`, 'i') } });
  }

  if (tokens.length > 0) {
    const searchRegex = new RegExp(tokens.slice(0, 8).join('|'), 'i');
    filters.push({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ],
    });
  }

  const query = filters.length > 0 ? { $or: filters } : {};
  const products = await Product.find(query)
    .select('title category price stock stockTracked description')
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  if (products.length > 0) {
    return `Relevant products from the live catalog:\n${products.map(summarizeProduct).join('\n')}`;
  }

  const latestProducts = await Product.find({})
    .select('title category price stock stockTracked')
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  return latestProducts.length
    ? `No exact product matches found. Latest products:\n${latestProducts.map(summarizeProduct).join('\n')}`
    : 'No products are currently available in the product database.';
}

function buildHistoryMessages(history) {
  const messages = [];

  if (!Array.isArray(history)) {
    return messages;
  }

  for (const msg of history.slice(-10)) {
    if (msg.role === 'user' && msg.text) {
      messages.push({ role: 'user', content: String(msg.text).slice(0, 1000) });
    } else if (msg.role === 'bot' && msg.text) {
      messages.push({ role: 'assistant', content: String(msg.text).slice(0, 1000) });
    }
  }

  return messages;
}

router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    if (message.trim().length > 1000) {
      return res.status(400).json({ message: 'Message is too long. Please keep it under 1000 characters.' });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      console.error('NVIDIA_API_KEY is not set in environment variables');
      return res.status(500).json({ message: 'AI service is not configured. Please try again later.' });
    }

    const client = new OpenAI({
      apiKey,
      baseURL: NVIDIA_BASE_URL,
    });

    const trimmedMessage = message.trim();
    const productContext = await buildProductContext(trimmedMessage);
    const chatMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: productContext },
      ...buildHistoryMessages(history),
      { role: 'user', content: trimmedMessage },
    ];

    const completion = await client.chat.completions.create({
      model: CHAT_MODEL,
      messages: chatMessages,
      temperature: 0.5,
      max_tokens: 350,
    });

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

    res.json({ reply });
  } catch (error) {
    console.error('Chat API error:', error.message);

    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('rate')) {
      return res.status(429).json({ message: 'Our AI assistant is a bit busy right now. Please try again in a moment.' });
    }

    if (error.status === 401 || error.status === 403) {
      console.error('NVIDIA NIM API authentication failed');
      return res.status(500).json({ message: 'AI service authentication error. Please contact support.' });
    }

    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;