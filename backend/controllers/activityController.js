const db = require('../config/database');
const { formatDistanceToNow } = require('date-fns');

const activityController = {
    getActivities(req, res) {
        const userId = req.user.id;
        const userRole = req.user.role;
        
        let query = '';
        let params = [];

        if (userRole === 'admin') {
            query = 'SELECT * FROM activity_stats_view ORDER BY created_at DESC LIMIT 50';
        } else {
            query = 'SELECT * FROM activity_stats_view WHERE user_id = ? ORDER BY created_at DESC LIMIT 20';
            params = [userId];
        }

        db.query(query, params, (err, results) => {
            if (err) {
                console.error('Error fetching activities:', err);
                return res.status(500).json({
                    success: false,
                    message: "Error fetching activities"
                });
            }

            const formattedActivities = results.map(activity => ({
                ...activity,
                timeAgo: formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })
            }));

            res.json({ success: true, data: formattedActivities });
        });
    }
};

module.exports = activityController;