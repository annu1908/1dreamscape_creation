const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    price: {
        type: Number,
        required: true,
    },
    category: String,
    image: String, // Primary image (backward compatible)
    images: [{     // Additional images
        type: String,
    }],
    stock: {
        type: Number,
        default: null, // null = made to order / unlimited. Only set a number if tracking stock.
        min: 0,
    },
    stockTracked: {
        type: Boolean,
        default: false, // false = always available (custom/handmade). true = check stock field.
    },
    originalPrice: { // For showing discount
        type: Number,
        default: null,
    },
}, {
    timestamps: true,
});

// Index for faster category filtering
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);