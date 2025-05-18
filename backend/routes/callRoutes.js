const express = require("express");
const router = express.Router();
const callController = require("../controllers/callController");
const { authenticateToken } = require("../middlewares/auth");
const db = require('../config/db');
const auth = require('../middleware/auth');

// Protected routes - require authentication
router.use(authenticateToken);

// Create a new call
router.post("/", callController.createCall);

// Get all calls for a specific caller
router.get("/", callController.getCallsByCallerId);

// Get a specific call record
router.get("/:id", callController.getCallById);

// Update a call record
router.put("/:id", callController.updateCall);

// Get calls by caller ID (legacy endpoint)
router.get("/caller/:callerId", callController.getCallsByCaller);

// Statistics endpoints
router.get("/stats/performance/:callerId", callController.getPerformanceMetrics);
router.get("/stats/daily/:callerId", callController.getDailyStats);
router.get("/stats/best-hours/:callerId", callController.getBestCallingHours);
router.get("/stats/callback-efficiency/:callerId", callController.getCallbackEfficiency);
router.get("/stats/monthly/:callerId", callController.getMonthlyCallerStats);
router.get("/stats/caller/:callerId", callController.getCallerStats);

// Get all calls
router.get('/', auth, (req, res) => {
    const query = req.user.role === 'admin' || req.user.role === 'manager'
        ? 'SELECT * FROM calls'
        : 'SELECT * FROM calls WHERE caller_id = ?';
    
    const params = req.user.role === 'admin' || req.user.role === 'manager' ? [] : [req.user.id];
    
    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }
        
        res.json({
            success: true,
            data: results
        });
    });
});

// Get call by ID
router.get('/:id', auth, (req, res) => {
    const query = 'SELECT * FROM calls WHERE id = ?';
    
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Call not found'
            });
        }
        
        // Check if user has access to this call
        if (req.user.role !== 'admin' && req.user.role !== 'manager' && results[0].caller_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        res.json({
            success: true,
            data: results[0]
        });
    });
});

// Create new call
router.post('/', auth, (req, res) => {
    const {
        lead_id,
        start_time,
        end_time,
        duration,
        status,
        call_type,
        disposition,
        notes,
        callback_datetime,
        recording_url
    } = req.body;

    const query = `
        INSERT INTO calls 
        (caller_id, lead_id, start_time, end_time, duration, status, call_type, disposition, notes, callback_datetime, recording_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        query,
        [req.user.id, lead_id, start_time, end_time, duration, status, call_type, disposition, notes, callback_datetime, recording_url],
        (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }

            res.status(201).json({
                success: true,
                message: 'Call created successfully',
                data: { id: result.insertId }
            });
        }
    );
});

// Update call
router.put('/:id', auth, (req, res) => {
    const {
        end_time,
        duration,
        status,
        disposition,
        notes,
        callback_datetime
    } = req.body;

    // First check if the call exists and belongs to the user
    db.query('SELECT * FROM calls WHERE id = ?', [req.params.id], (err, calls) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (calls.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Call not found'
            });
        }

        if (req.user.role !== 'admin' && req.user.role !== 'manager' && calls[0].caller_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const query = `
            UPDATE calls 
            SET end_time = ?, duration = ?, status = ?, disposition = ?, notes = ?, callback_datetime = ?, updated_at = NOW()
            WHERE id = ?
        `;

        db.query(
            query,
            [end_time, duration, status, disposition, notes, callback_datetime, req.params.id],
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
                    message: 'Call updated successfully'
                });
            }
        );
    });
});

// Delete call
router.delete('/:id', auth, (req, res) => {
    // Only admin and manager can delete calls
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({
            success: false,
            message: 'Access denied'
        });
    }

    db.query('DELETE FROM calls WHERE id = ?', [req.params.id], (err) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        res.json({
            success: true,
            message: 'Call deleted successfully'
        });
    });
});

module.exports = router; 