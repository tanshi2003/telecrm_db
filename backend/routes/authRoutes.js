const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');
const { authenticateToken } = require("../middleware/auth");

// Login route
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check if email exists in admins table first
    db.query('SELECT * FROM admins WHERE email = ?', [email], (err, admins) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (admins.length > 0) {
            // Admin login
            const admin = admins[0];
            if (admin.status !== 'active') {
                return res.status(403).json({
                    success: false,
                    message: 'Admin account is not active'
                });
            }
            bcrypt.compare(password, admin.password, (err, isMatch) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Error comparing passwords'
                    });
                }

                if (!isMatch) {
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid credentials'
                    });
                }

                const token = generateToken(admin.id, admin.role || 'admin', '7d');

                // Update token and last login in database
                db.query(
                    'UPDATE admins SET token = ?, last_login = NOW() WHERE id = ?',
                    [token, admin.id],
                    (err) => {
                        if (err) {
                            console.error('Database error:', err);
                            return res.status(500).json({
                                success: false,
                                message: 'Database error'
                            });
                        }

                       res.json({
                           success: true,
                           token,
                           user: {
                               id: admin.id,
                               role: 'admin',
                               username: admin.name
                         }
                     });
                    }
                );
            });
        } else {
            // Check users table
            db.query('SELECT * FROM users WHERE email = ?', [email], (err, users) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error'
                    });
                }

                if (users.length === 0) {
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid credentials'
                    });
                }

                const user = users[0];
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: 'Error comparing passwords'
                        });
                    }

                    if (!isMatch) {
                        return res.status(401).json({
                            success: false,
                            message: 'Invalid credentials'
                        });
                    }

                    const token = generateToken(user.id, user.role);

                    // Update token and last login
                    db.query(
                        'UPDATE users SET token = ?, last_login = NOW() WHERE id = ?',
                        [token, user.id],
                        (err) => {
                            if (err) {
                                console.error('Database error:', err);
                                return res.status(500).json({
                                    success: false,
                                    message: 'Database error'
                                });
                            }

                         res.json({
                         success: true,
                         token,
                         user: {
                             id: user.id,
                             role: user.role,
                             username: user.name // or user.username if you have that field
                      }
          });
                        }
                    );
                });
            });
        }
    });
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

// Logout route
router.post('/logout', authenticateToken, (req, res) => {
    const query = req.user.role === 'admin' 
        ? 'UPDATE admins SET token = NULL WHERE id = ?'
        : 'UPDATE users SET token = NULL WHERE id = ?';

    db.query(query, [req.user.id], (err) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    });
});

module.exports = router;