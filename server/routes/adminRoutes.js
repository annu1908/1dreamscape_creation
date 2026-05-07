const express = require('express');
const router = express.Router();
const fs = require('fs');
const OpenAI = require('openai');
const verifyToken = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');
const cloudinary = require('../config/cloudinary');

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const VISION_MODEL = process.env.NVIDIA_VISION_MODEL || 'meta/llama-3.2-11b-vision-instruct';
const INLINE_IMAGE_MAX_BYTES = 180 * 1024;
const SUPPORTED_INLINE_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png']);
const VALID_CATEGORIES = ['Embroidery', 'Crochet', 'Resin', 'Sketch'];

// Shared prompt for both URL and file-based analysis
const ANALYSIS_PROMPT = `Analyze this handmade product image and return ONLY a valid JSON object with double-quoted keys and string values.
Choose the category from visual evidence:
- Embroidery: stitched thread art on fabric, hoops, textile patterns
- Crochet: yarn/wool handmade items, knitted-looking loops, plushies, flowers, clothing
- Resin: glossy resin art, keychains, trays, preserved flowers, ocean/clear resin pieces
- Sketch: pencil, charcoal, ink, or hand-drawn portrait/illustration

The category value must be exactly one of: Embroidery, Crochet, Resin, Sketch.

For price, estimate a realistic price in Indian Rupees (INR) based on the product type, size, and complexity:
- Small crochet items (keychains, flowers): 150–400
- Medium crochet (plushies, bags): 400–1200
- Embroidery hoops/art: 700–1500
- Resin keychains/small items: 200–600
- Resin trays/large art: 600–2500
- Sketches/portraits: 500–3000
Never return 0 for the price. Always estimate a reasonable value.

Do not default to the first category. Do not use markdown. Do not add comments.
Use exactly this shape, replacing the placeholder values:
{
  "title": "...",
  "category": "...",
  "price": 499,
  "description": "..."
}`;

class AnalysisError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Calls the NVIDIA NIM vision model with a public image URL or base64 data URL
 * and returns the parsed product details JSON.
 */
async function analyzeWithNvidia(imageUrl) {
  if (!process.env.NVIDIA_API_KEY) {
    throw new AnalysisError('AI service is not configured. Missing NVIDIA_API_KEY.', 500);
  }

  const client = new OpenAI({
    baseURL: NVIDIA_BASE_URL,
    apiKey: process.env.NVIDIA_API_KEY,
  });

  const completion = await client.chat.completions.create({
    model: VISION_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: ANALYSIS_PROMPT },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],
    max_tokens: 512,
    temperature: 0.3,
  });

  const aiText = completion.choices[0].message.content;
  return parseAiProductDetails(aiText);
}

function parseAiProductDetails(aiText) {
  const jsonMatch = String(aiText || '').match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new AnalysisError('AI did not return product details. Please try again.', 502);
  }

  const jsonText = jsonMatch[0];
  const repairedJson = jsonText
    .replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1"$2":')
    .replace(/:\s*'([^']*)'/g, ': "$1"')
    .replace(/,\s*}/g, '}');

  try {
    return normalizeProductDetails(JSON.parse(repairedJson));
  } catch (_) {
    const looseDetails = parseLooseProductDetails(jsonText);
    if (looseDetails) {
      return normalizeProductDetails(looseDetails);
    }
    console.warn('Invalid AI JSON response:', aiText);
    throw new AnalysisError('AI returned details in an invalid format. Please try again.', 502);
  }
}

function parseLooseProductDetails(jsonText) {
  const details = {};
  const body = jsonText.replace(/^\s*\{/, '').replace(/\}\s*$/, '');
  const fieldPattern = /["']?(title|category|price|description)["']?\s*:\s*([\s\S]*?)(?=\n\s*["']?(title|category|price|description)["']?\s*:|$)/gi;
  let match;

  while ((match = fieldPattern.exec(body)) !== null) {
    details[match[1].toLowerCase()] = match[2]
      .trim()
      .replace(/,$/, '')
      .replace(/^["']|["']$/g, '')
      .trim();
  }

  return Object.keys(details).length ? details : null;
}

function normalizeProductDetails(details) {
  const rawCategory = String(details.category || '').toLowerCase();
  const category =
    VALID_CATEGORIES.find((item) => rawCategory.includes(item.toLowerCase())) ||
    inferCategoryFromText(`${details.title || ''} ${details.description || ''}`) ||
    'Sketch';
  const price = Number(String(details.price || '').replace(/[^\d.]/g, ''));

  return {
    title: String(details.title || 'Handmade Product').trim(),
    category,
    price: Number.isFinite(price) ? Math.round(price) : 0,
    description: String(details.description || 'A handmade product from Dreamscape Creations.').trim(),
  };
}

function inferCategoryFromText(text) {
  const normalizedText = String(text || '').toLowerCase();
  const categorySignals = [
    ['Embroidery', ['embroidery', 'embroidered', 'thread', 'stitch', 'stitched', 'hoop', 'fabric']],
    ['Crochet', ['crochet', 'crocheted', 'yarn', 'wool', 'amigurumi', 'knit', 'plush']],
    ['Resin', ['resin', 'epoxy', 'keychain', 'tray', 'coaster', 'glossy', 'preserved flower']],
    ['Sketch', ['sketch', 'pencil', 'portrait', 'drawing', 'charcoal', 'illustration']],
  ];

  const match = categorySignals.find(([, signals]) =>
    signals.some((signal) => normalizedText.includes(signal))
  );

  return match ? match[0] : null;
}

function normalizeMimeType(mimeType = '') {
  const cleanType = mimeType.split(';')[0].trim().toLowerCase();
  return cleanType === 'image/jpg' ? 'image/jpeg' : cleanType;
}

function toDataImageUrl(imageBuffer, mimeType) {
  const normalizedMimeType = normalizeMimeType(mimeType);

  if (!SUPPORTED_INLINE_MIME_TYPES.has(normalizedMimeType)) {
    throw new AnalysisError('AI image analysis supports JPG, JPEG, or PNG images only.');
  }

  if (imageBuffer.length > INLINE_IMAGE_MAX_BYTES) {
    throw new AnalysisError(
      'This uploaded image is too large for inline AI analysis. Please use a smaller JPG/PNG or paste a public image URL.'
    );
  }

  return `data:${normalizedMimeType};base64,${imageBuffer.toString('base64')}`;
}

function validatePublicImageUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Unsupported protocol');
    }
    return url.toString();
  } catch (_) {
    throw new AnalysisError('Please provide a valid public image URL.');
  }
}

// Wrapper: multer is optional — if no file is sent it just continues
const optionalUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.warn('Multer warning:', err.message);
    }
    next();
  });
};

// POST /api/admin/upload-image
// Accepts a single image file, uploads it to Cloudinary, returns the public URL.
router.post(
  '/upload-image',
  verifyToken,
  adminOnly,
  upload.single('image'),
  async (req, res) => {
    let filePath = null;
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided.' });
      }
      filePath = req.file.path;

      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'dreamscape-products',
        resource_type: 'image',
      });

      res.json({ url: result.secure_url });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      res.status(500).json({ message: 'Image upload failed. Please try again.' });
    } finally {
      if (filePath) {
        try { fs.unlinkSync(filePath); } catch (_) { }
      }
    }
  }
);

// POST /api/admin/analyze-product
// Accepts EITHER:
//   CASE 1 — JSON body with { imageUrl: "https://..." }
//   CASE 2 — multipart/form-data with an image file (field: "image")
router.post(
  '/analyze-product',
  verifyToken,
  adminOnly,
  optionalUpload,
  async (req, res) => {
    let filePath = null;

    try {
      let imageUrl;

      if (req.body.imageUrl && req.body.imageUrl.trim()) {
        // ——— CASE 1: Image URL provided ———
        imageUrl = validatePublicImageUrl(req.body.imageUrl.trim());

      } else if (req.file) {
        // ——— CASE 2: File uploaded via multer ———
        filePath = req.file.path;
        const imageBuffer = fs.readFileSync(filePath);
        imageUrl = toDataImageUrl(imageBuffer, req.file.mimetype);
      } else {
        return res.status(400).json({ message: 'No image file or URL provided' });
      }

      const parsed = await analyzeWithNvidia(imageUrl);
      res.json(parsed);
    } catch (error) {
      const statusCode = error.statusCode || error.status || 500;
      const providerMessage = error.response?.data?.error?.message || error.error?.message || error.message;
      console.error('AI analysis error:', providerMessage || error);
      res.status(statusCode >= 400 && statusCode < 500 ? statusCode : 500).json({
        message: providerMessage || 'AI analysis failed',
      });
    } finally {
      // Clean up the temporary uploaded file
      if (filePath) {
        try {
          fs.unlinkSync(filePath);
        } catch (_) {
          // ignore cleanup errors
        }
      }
    }
  }
);

module.exports = router;