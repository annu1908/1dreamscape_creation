const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const verifyToken = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Wrapper to handle multer errors gracefully (e.g. when no file is sent)
const optionalUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      // If it's a multer error but we have an imageUrl, just continue
      console.warn('Multer warning:', err.message);
    }
    next();
  });
};

router.get('/', async (req, res) => {
    try {
        const { page, limit, sort, category, search } = req.query;

        // Build filter
        const filter = {};
        if (category && category !== 'all') {
            filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
            ];
        }

        // Build sort
        let sortOption = { createdAt: -1 }; // default: newest first
        if (sort === 'price_asc') sortOption = { price: 1 };
        else if (sort === 'price_desc') sortOption = { price: -1 };
        else if (sort === 'oldest') sortOption = { createdAt: 1 };
        else if (sort === 'newest') sortOption = { createdAt: -1 };

        // If pagination params provided, paginate; otherwise return all (backward-compatible)
        if (page && limit) {
            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
            const skip = (pageNum - 1) * limitNum;

            const [products, totalProducts] = await Promise.all([
                Product.find(filter).sort(sortOption).skip(skip).limit(limitNum),
                Product.countDocuments(filter),
            ]);

            return res.json({
                products,
                totalProducts,
                totalPages: Math.ceil(totalProducts / limitNum),
                currentPage: pageNum,
            });
        }

        // No pagination — return all products (backward compatible for existing frontend)
        const products = await Product.find(filter).sort(sortOption);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new product (Admin Only)
router.post('/', verifyToken, adminOnly, optionalUpload, async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    let imageUrl = req.body.imageUrl || '';

    // If an image file was uploaded, use its local path
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const newProduct = new Product({
      title,
      description,
      price: Number(price),
      category,
      image: imageUrl
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

// Update a product (Admin Only)
router.put('/:id', verifyToken, adminOnly, optionalUpload, async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    let updateData = { title, description, price: Number(price), category };

    // Update the image path if an image URL is provided in the body
    if (req.body.imageUrl) {
      updateData.image = req.body.imageUrl;
    }

    // If a new image file was uploaded, override with local file path
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// Delete a product (Admin Only)
router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully', product: deletedProduct });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

module.exports = router;