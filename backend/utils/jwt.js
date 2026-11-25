const config = require('../config/config.json');

const JWT_SECRET = process.env.JWT_SECRET || config.production.jwtSecret;

const generateToken = (id, role, expiresIn = '24h') =>
    require('jsonwebtoken').sign({ id, role }, JWT_SECRET, { expiresIn });

module.exports = { JWT_SECRET, generateToken };
