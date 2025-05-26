const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

                const token = jwt.sign(
                    { id: admin.id, role: 'admin' },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );

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
                                name: admin.name,
                                email: admin.email,
                                role: 'admin'
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

                    const token = jwt.sign(
                        { id: user.id, role: user.role },
                        process.env.JWT_SECRET,
                        { expiresIn: '24h' }
                    );

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
                                    name: user.name,
                                    email: user.email,
                                    role: user.role
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