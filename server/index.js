const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Gzip compression
app.use(compression());

app.use(cors({
  origin: [
    "https://1dreamscape-creation.vercel.app",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiter for auth routes (max 10 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/reviews', reviewRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Dreamscape api is running');
});

connectDB();

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
