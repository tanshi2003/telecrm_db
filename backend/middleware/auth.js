const jwt = require('jsonwebtoken');
const db = require('../config/db');

const auth = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists and token matches
    if (decoded.role === 'admin') {
      db.query(
        'SELECT id, name, email, role, status FROM admins WHERE id = ? AND token = ?',
        [decoded.id, token],
        (err, admins) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
              success: false,
              message: 'Database error'
            });
          }

          if (!admins.length) {
            return res.status(401).json({
              success: false,
              message: 'Invalid token'
            });
          }

          req.user = { ...admins[0], role: 'admin' };
          next();
        }
      );
    } else {
      db.query(
        'SELECT id, name, email, role, status, manager_id FROM users WHERE id = ? AND token = ?',
        [decoded.id, token],
        (err, users) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
              success: false,
              message: 'Database error'
            });
          }

          if (!users.length) {
            return res.status(401).json({
              success: false,
              message: 'Invalid token'
            });
          }

          req.user = users[0];
          next();
        }
      );
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

module.exports = auth; 