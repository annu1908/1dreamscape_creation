const express = require('express');
const router = express.Router();
const fs = require('fs');
const axios = require('axios');
const OpenAI = require('openai');
const verifyToken = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Shared prompt for both URL and file-based analysis
const ANALYSIS_PROMPT = `Analyze this handmade product image and return ONLY a valid JSON object with no extra text:
{
  title: short product name,
  category: one of (Jewellery / Home Decor / Art / Clothing / Gift),
  price: single number in INR (no symbols, no range),
  description: 2-3 sentence product description
}`;

/**
 * Calls the NVIDIA NIM vision model with a base64-encoded image
 * and returns the parsed product details JSON.
 */
async function analyzeWithNvidia(base64Image, mimeType) {
  const client = new OpenAI({
    baseURL: 'https://integrate.api.nvidia.com/v1',
    apiKey: process.env.NVIDIA_API_KEY,
  });

  const completion = await client.chat.completions.create({
    model: 'meta/llama-3.2-90b-vision-instruct',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: ANALYSIS_PROMPT },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    max_tokens: 512,
    temperature: 0.3,
  });

  const aiText = completion.choices[0].message.content;

  // Extract JSON object from the AI response
  const jsonMatch = aiText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not extract JSON from AI response');
  }

  return JSON.parse(jsonMatch[0]);
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
      let base64Image;
      let mimeType;

      if (req.body.imageUrl && req.body.imageUrl.trim()) {
        // ——— CASE 1: Image URL provided ———
        const imageUrl = req.body.imageUrl.trim();

        // Fetch the image from the URL
        const response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 15000,
        });

        base64Image = Buffer.from(response.data).toString('base64');
        mimeType = response.headers['content-type'] || 'image/jpeg';
      } else if (req.file) {
        // ——— CASE 2: File uploaded via multer ———
        filePath = req.file.path;
        const imageBuffer = fs.readFileSync(filePath);
        base64Image = imageBuffer.toString('base64');
        mimeType = req.file.mimetype || 'image/jpeg';
      } else {
        return res.status(400).json({ message: 'No image file or URL provided' });
      }

      const parsed = await analyzeWithNvidia(base64Image, mimeType);
      res.json(parsed);
    } catch (error) {
      console.error('AI analysis error:', error.message || error);
      res.status(500).json({ message: 'AI analysis failed' });
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
