const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/jwt');
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
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('Auth error:', err.message);
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }

      // Admin JWTs must also reflect the current database account status.
      // This prevents deactivated/suspended admins from using previously issued tokens.
      if (decoded.role === 'admin') {
        return db.query("SELECT status FROM admins WHERE id = ? LIMIT 1", [decoded.id], (adminErr, adminRows) => {
          if (adminErr) {
            console.error('Admin status lookup failed:', adminErr);
            return res.status(500).json({
              success: false,
              message: 'Authentication verification failed'
            });
          }
          if (!adminRows.length || adminRows[0].status !== 'active') {
            return res.status(401).json({
              success: false,
              message: 'Admin account is no longer active'
            });
          }
          req.user = decoded;
          next();
        });
      }

      // Add user data to request for non-admin roles
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