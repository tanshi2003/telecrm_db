const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, activityController.getActivities);
router.post('/log', authenticateToken, activityController.logActivity);
router.get('/all', authenticateToken, async (req, res) => {
    try {
        // Only allow admin to access all activities
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admin only.' 
            });
        }

        const activities = await Activity.getAllActivities();
        res.json({ success: true, data: activities });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
module.exports = router;