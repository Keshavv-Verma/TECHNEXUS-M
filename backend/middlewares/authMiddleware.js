const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Middleware to verify JWT token
 * Extracts token from Authorization header and validates it
 * Attaches decoded user data to req.user
 */
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware to check if user is admin
 * Must be used after verifyToken middleware
 * Returns 403 if user is not admin
 */
const checkAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = {
  verifyToken,
  checkAdmin,
};
