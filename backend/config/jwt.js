const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'secret';

const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, SECRET, { expiresIn });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };