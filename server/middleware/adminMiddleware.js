/**
 * Middleware to restrict access to admin users only.
 * Must be used AFTER verifyToken middleware (so req.user is available).
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = adminOnly;
