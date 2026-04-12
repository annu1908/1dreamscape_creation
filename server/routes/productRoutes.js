const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const verifyToken = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/',async(req,res)=>{
    try{
        const products= await Product.find();
        res.json(products);
    }catch(err)
    {
        res.status(500).json({message:'Server Error'});
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
router.post('/', verifyToken, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    let imageUrl = '';

    // If an image was uploaded, store its local URL path
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
router.put('/:id', verifyToken, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    let updateData = { title, description, price: Number(price), category };

    // If a new image was uploaded, update the image path
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