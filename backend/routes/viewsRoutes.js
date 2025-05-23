// filepath: c:\Users\Prof. Anil Chhangani\Desktop\telecrm_db\backend\routes\viewsRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/Views
router.get('/', (req, res) => {
    db.query('SELECT * FROM Views', (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        res.json({ success: true, data: results });
    });
});

// GET /api/Views/callers
router.get('/callers', (req, res) => {
    db.query('SELECT DISTINCT caller_id, caller_name FROM Views', (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        res.json({ success: true, data: results });
    });
});

module.exports = router;