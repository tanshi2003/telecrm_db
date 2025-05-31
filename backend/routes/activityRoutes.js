const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticateToken } = require('../middleware/auth');
const Activity = require('../models/Activity');
const db = require('../config/db');

// Get activities for a specific user
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own activities.'
            });
        }

        let query = '';
        let params = [];

        if (req.user.role === 'admin') {
            // Admin sees all activities
            query = `
                SELECT DISTINCT
                    a.*,
                    u.name as user_name,
                    u.role as user_role
                FROM activity_logs a
                JOIN users u ON a.user_id = u.id
                LEFT JOIN campaigns c ON a.reference_type = 'campaign' AND a.reference_id = c.id
                LEFT JOIN campaign_users cu ON c.id = cu.campaign_id
                WHERE a.user_id = ?
                ORDER BY a.created_at DESC
                LIMIT 50
            `;
            params = [userId];
        } else if (req.user.role === 'manager') {
            // Managers see their own activities plus campaign activities they manage
            query = `
                SELECT DISTINCT
                    a.*,
                    u.name as user_name,
                    u.role as user_role
                FROM activity_logs a
                JOIN users u ON a.user_id = u.id
                LEFT JOIN campaigns c ON a.reference_type = 'campaign' AND a.reference_id = c.id
                LEFT JOIN campaign_users cu ON c.id = cu.campaign_id
                WHERE a.user_id = ?
                    OR (
                        (a.reference_type = 'campaign' OR a.activity_type LIKE 'campaign_%')
                        AND (c.manager_id = ? OR cu.user_id = ?)
                    )
                ORDER BY a.created_at DESC
                LIMIT 50
            `;
            params = [userId, userId, userId];
        } else {
            // Other users see their own activities plus campaign activities they're assigned to
            query = `
                SELECT DISTINCT
                    a.*,
                    u.name as user_name,
                    u.role as user_role
                FROM activity_logs a
                JOIN users u ON a.user_id = u.id
                LEFT JOIN campaigns c ON a.reference_type = 'campaign' AND a.reference_id = c.id
                LEFT JOIN campaign_users cu ON c.id = cu.campaign_id
                WHERE a.user_id = ?
                    OR (
                        (a.reference_type = 'campaign' OR a.activity_type LIKE 'campaign_%')
                        AND cu.user_id = ?
                    )
                ORDER BY a.created_at DESC
                LIMIT 50
            `;
            params = [userId, userId];
        }

        const [activities] = await db.promise().query(query, params);

        res.json({
            success: true,
            data: activities
        });
    } catch (error) {
        console.error('Error fetching user activities:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching activities',
            error: error.message
        });
    }
});

// Get all activities with role-based access
router.get('/all', authenticateToken, async (req, res) => {
    try {
        let query = '';
        let params = [];

        if (req.user.role === 'admin') {
            // Admin sees all activities
            query = `
                SELECT DISTINCT
                    a.*,
                    u.name as user_name,
                    u.role as user_role
                FROM activity_logs a
                JOIN users u ON a.user_id = u.id
                LEFT JOIN campaigns c ON a.reference_type = 'campaign' AND a.reference_id = c.id
                LEFT JOIN campaign_users cu ON c.id = cu.campaign_id
                ORDER BY a.created_at DESC
                LIMIT 100
            `;
        } else if (req.user.role === 'manager') {
            // Managers see their own activities plus campaign activities they manage
            query = `
                SELECT DISTINCT
                    a.*,
                    u.name as user_name,
                    u.role as user_role
                FROM activity_logs a
                JOIN users u ON a.user_id = u.id
                LEFT JOIN campaigns c ON a.reference_type = 'campaign' AND a.reference_id = c.id
                LEFT JOIN campaign_users cu ON c.id = cu.campaign_id
                WHERE a.user_id = ?
                    OR (
                        (a.reference_type = 'campaign' OR a.activity_type LIKE 'campaign_%')
                        AND (c.manager_id = ? OR cu.user_id = ?)
                    )
                ORDER BY a.created_at DESC
                LIMIT 100
            `;
            params = [req.user.id, req.user.id, req.user.id];
        } else {
            // Other users see their own activities plus campaign activities they're assigned to
            query = `
                SELECT DISTINCT
                    a.*,
                    u.name as user_name,
                    u.role as user_role
                FROM activity_logs a
                JOIN users u ON a.user_id = u.id
                LEFT JOIN campaigns c ON a.reference_type = 'campaign' AND a.reference_id = c.id
                LEFT JOIN campaign_users cu ON c.id = cu.campaign_id
                WHERE a.user_id = ?
                    OR (
                        (a.reference_type = 'campaign' OR a.activity_type LIKE 'campaign_%')
                        AND cu.user_id = ?
                    )
                ORDER BY a.created_at DESC
                LIMIT 100
            `;
            params = [req.user.id, req.user.id];
        }

        const [activities] = await db.promise().query(query, params);

        res.json({
            success: true,
            data: activities
        });
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching activities',
            error: error.message
        });
    }
});

router.get('/', authenticateToken, activityController.getActivities);
router.post('/log', authenticateToken, activityController.logActivity);

module.exports = router;