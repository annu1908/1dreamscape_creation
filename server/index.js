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
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Gzip compression
app.use(compression());

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "https://1dreamscape-creation.vercel.app",
      "http://localhost:3000"
    ];
    // Allow requests with no origin (like mobile apps) or from allowed origins/vercel subdomains
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
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
  max: 20,
  message: { message: 'Too many attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Dreamscape api is running');
});

const User = require('./models/User');

// Ensure the configured ADMIN_EMAIL has admin role on startup
const ensureAdmin = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
  if (!adminEmail) return;

  try {
    // Remove admin role from any other users who are not the designated admin
    await User.updateMany(
      { email: { $ne: adminEmail }, role: 'admin' },
      { $set: { role: 'user' } }
    );

    // Set the designated admin email to admin role
    const result = await User.findOneAndUpdate(
      { email: adminEmail },
      { $set: { role: 'admin' } },
      { new: true }
    );

    if (result) {
      console.log(`✅ Admin role assigned to ${adminEmail}`);
    } else {
      console.log(`ℹ️ Admin email ${adminEmail} not yet registered — will be assigned admin on signup`);
    }
  } catch (err) {
    console.error('Error ensuring admin role:', err);
  }
};

connectDB().then(() => {
  ensureAdmin();
});

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
