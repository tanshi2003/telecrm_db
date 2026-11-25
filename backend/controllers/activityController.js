const db = require('../config/db');

const activityController = {
    getActivities: async (req, res) => {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            
            let query = '';
            let params = [];

            if (userRole === 'admin') {
                // Admin sees all activities
                query = `
                    SELECT 
                        a.id,
                        a.user_id,
                        a.role,
                        a.activity_type,
                        a.activity_description,
                        a.reference_type,
                        a.reference_id,
                        a.location,
                        a.created_at,
                        u.name as user_name,
                        u.role as user_role
                    FROM activity_logs a
                    JOIN users u ON a.user_id = u.id
                    ORDER BY a.created_at DESC
                    LIMIT 100
                `;
            } else if (userRole === 'manager') {
                // Managers see:
                // 1. Their own activities
                // 2. All campaign activities where they are the manager
                query = `
                    SELECT DISTINCT
                        a.id,
                        a.user_id,
                        a.role,
                        a.activity_type,
                        a.activity_description,
                        a.reference_type,
                        a.reference_id,
                        a.location,
                        a.created_at,
                        u.name as user_name,
                        u.role as user_role
                    FROM activity_logs a
                    JOIN users u ON a.user_id = u.id
                    LEFT JOIN campaigns c ON a.reference_type = 'campaign' AND a.reference_id = c.id
                    WHERE a.user_id = ? 
                        OR (a.reference_type = 'campaign' AND c.manager_id = ?)
                        OR a.activity_type LIKE 'campaign_%'
                    ORDER BY a.created_at DESC
                    LIMIT 50
                `;
                params = [userId, userId];
            } else {
                // Other users see:
                // 1. Their own activities
                // 2. Campaign activities for campaigns they're assigned to
                query = `
                    SELECT DISTINCT
                        a.id,
                        a.user_id,
                        a.role,
                        a.activity_type,
                        a.activity_description,
                        a.reference_type,
                        a.reference_id,
                        a.location,
                        a.created_at,
                        u.name as user_name,
                        u.role as user_role
                    FROM activity_logs a
                    JOIN users u ON a.user_id = u.id
                    LEFT JOIN campaigns c ON a.reference_type = 'campaign' AND a.reference_id = c.id
                    LEFT JOIN campaign_users cu ON c.id = cu.campaign_id
                    WHERE a.user_id = ?
                        OR (a.reference_type = 'campaign' AND cu.user_id = ?)
                        OR a.activity_type LIKE 'campaign_%'
                    ORDER BY a.created_at DESC
                    LIMIT 50
                `;
                params = [userId, userId];
            }            const [activities] = await db.promise().query(query, params);            const formattedActivities = activities.map(activity => ({
                id: activity.id,
                userId: activity.user_id,
                role: activity.role,
                activityType: activity.activity_type,
                description: activity.activity_description,
                referenceType: activity.reference_type,
                referenceId: activity.reference_id,
                location: activity.location,
                createdAt: activity.created_at,
                userName: activity.user_name,
                userRole: activity.user_role
            }));

            res.json({ 
                success: true, 
                data: formattedActivities 
            });
        } catch (error) {
            console.error('Error fetching activities:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching activities',
                error: error.message
            });
        }
    },

    logActivity: async (req, res) => {
        try {            const { userId, role, activityType, description, referenceType, referenceId, location } = req.body;

            const [result] = await db.promise().query(
                `INSERT INTO activity_logs 
                (user_id, role, activity_type, activity_description, reference_type, reference_id, location) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, role, activityType, description, referenceType, referenceId, location]
            );

            res.json({
                success: true,
                message: 'Activity logged successfully',
                data: result
            });
        } catch (error) {
            console.error('Error logging activity:', error);
            res.status(500).json({
                success: false,
                message: 'Error logging activity',
                error: error.message
            });
        }
    }
};

module.exports = activityController;