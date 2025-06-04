const express = require("express");
const router = express.Router();
const callController = require("../controllers/callController");
const db = require('../config/db');
const { authenticateToken } = require("../middleware/auth");
const checkRole = require('../middleware/checkRole');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const ExotelConfig = require('../models/ExotelConfig');
const Activity = require('../models/Activity');

// Protected routes - require authentication
router.use(authenticateToken);

// Get call statistics
router.get('/stats/:timeRange', checkRole(['admin']), async (req, res) => {
    try {
        const { timeRange } = req.params;
        let startDate = new Date();
        
        // Set the start date based on timeRange
        switch (timeRange) {
            case 'today':
                startDate.setHours(0,0,0,0);
                break;
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(startDate.getDate() - 7); // Default to last 7 days
        }        const [results] = await db.promise().query(
            `SELECT 
                status,
                disposition,
                COUNT(*) as count
            FROM calls 
            WHERE created_at >= ?
            GROUP BY status, disposition`,
            [startDate]
        );        res.json({
            success: true,
            data: results || []
        });
    } catch (error) {
        console.error('Error fetching call statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch call statistics',
            error: error.message
        });
    }
});

// Get call statistics for a specific user
router.get('/stats/:timeRange/:userId', checkRole(['admin', 'manager', 'caller', 'field_employee']), async (req, res) => {
    try {
        const { timeRange, userId } = req.params;
        let startDate = new Date();

        // Set the start date based on timeRange
        switch (timeRange) {
            case 'today':
                startDate.setHours(0,0,0,0);
                break;
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(startDate.getDate() - 7);
        }

        const [results] = await db.promise().query(
            `SELECT 
                status,
                disposition,
                COUNT(*) as count
            FROM calls 
            WHERE created_at >= ? AND caller_id = ?
            GROUP BY status, disposition`,
            [startDate, userId]
        );

        res.json({
            success: true,
            data: results || []
        });
    } catch (error) {
        console.error('Error fetching call statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch call statistics',
            error: error.message
        });
    }
});

// Create a new call
router.post("/", callController.createCall);

// Get a specific call record
router.get("/:id", callController.getCallById);

// Route to initiate a call
router.post('/initiate', async (req, res) => {
    console.log('\n=== Starting New Call ===');
    const { to, from, leadId } = req.body;
    const callerId = req.user.id;
    
    try {
        // Insert initial call record
        const [result] = await db.promise().query(
            `INSERT INTO calls (caller_id, lead_id, phone_number, status, created_at)
             VALUES (?, ?, ?, 'initiated', NOW())`,
            [callerId, leadId, to]
        );
        
        // Log the call activity
        await Activity.logActivity(
            callerId,
            req.user.role,
            'call_made',
            `Initiated call to ${to}`,
            'call',
            result.insertId,
            null
        );

        // Additional call handling logic here...
        
        res.json({
            success: true,
            message: 'Call initiated successfully',
            callId: result.insertId
        });
    } catch (error) {
        console.error('Error initiating call:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initiate call',
            error: error.message
        });
    }
});

// Route to update call status
router.put('/:callId/status', async (req, res) => {
    try {
        const { callId } = req.params;
        const { status, disposition } = req.body;        await db.promise().query(
            `UPDATE calls 
             SET status = ?, 
                 disposition = ?,
                 updated_at = NOW()
             WHERE id = ?`,
            [status, disposition, callId]
        );

        // Log the status update activity
        await Activity.logActivity(
            req.user.id,
            req.user.role,
            'call_update',
            `Updated call ${callId} status to ${status} with disposition ${disposition}`,
            'call',
            callId,
            null
        );

        res.json({
            success: true,
            message: 'Call status updated successfully'
        });
    } catch (error) {
        console.error('Error updating call status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update call status',
            error: error.message
        });
    }
});

module.exports = router;