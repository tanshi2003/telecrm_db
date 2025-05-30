const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, activityController.getActivities);
router.post('/log', authenticateToken, activityController.logActivity);

module.exports = router;