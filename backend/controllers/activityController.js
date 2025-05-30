const Activity = require('../models/Activity');
const { formatDistanceToNow } = require('date-fns');

const activityController = {
    async getActivities(req, res) {
        try {
            const { role } = req.user;
            const activities = await Activity.getRecentActivities(role);
            
            const formattedActivities = activities.map(activity => ({
                ...activity,
                timeAgo: formatDistanceToNow(new Date(activity.created_at), { addSuffix: true }),
                icon: getActivityIcon(activity.action_type)
            }));

            res.json({ success: true, data: formattedActivities });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async logActivity(req, res) {
        try {
            const { actionType, description, referenceType, referenceId } = req.body;
            const userId = req.user.id;

            await Activity.log(
                userId,
                actionType,
                description,
                referenceType,
                referenceId
            );

            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

// Helper function to get icon based on action type
const getActivityIcon = (actionType) => {
    const icons = {
        'lead_update': 'user-edit',
        'call_made': 'phone',
        'lead_visit': 'map-marker',
        'lead_convert': 'check-circle',
        'campaign_create': 'bullhorn',
        'user_create': 'user-plus',
        'settings_update': 'cog'
    };
    return icons[actionType] || 'info-circle';
};

module.exports = activityController;