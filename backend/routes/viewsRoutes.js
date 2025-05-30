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

// GET /api/monthly_caller_stats/:caller_id
router.get('/monthly_caller_stats/:caller_id', (req, res) => {
    const caller_id = req.params.caller_id;
    db.query(
        'SELECT * FROM monthly_caller_stats WHERE caller_id = ?',
        [caller_id],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (results.length > 0) {
                res.json(results[0]);
            } else {
                res.status(404).json({ error: 'Not found' });
            }
        }
    );
});

module.exports = router;