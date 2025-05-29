const jwt = require('jsonwebtoken');
const db = require('../config/db');

const auth = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    // Verify token without using promises
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('Auth error:', err.message);
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }

      // Add user data to request
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

module.exports = { authenticateToken: auth };