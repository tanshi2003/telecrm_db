const Activity = require('../models/Activity');
const express = require('express');
const router = express.Router();
const activityLogger = require('../middleware/activityLogger');
const { authenticateToken } = require('../middleware/auth');

router.put('/update-status/:id', authenticateToken, async (req, res) => {
    try {
        const leadId = req.params.id;
        const { status } = req.body;

        // ... existing lead update code ...

        // Log the activity
        await activityLogger.logActivity(
            req.user.id,
            req.user.role,
            'lead_update',
            `Updated Lead #${leadId} status to ${status}`,
            `lead:${leadId}`
        );

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;