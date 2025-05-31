const db = require('../config/db');

class Activity {    static async logActivity(userId, role, activityType, description, referenceType = null, referenceId = null, location = null) {
        try {
            // For historical or system-generated activities, use a system user ID if no user ID is provided
            const effectiveUserId = userId || 1; // Assuming system user has ID 1
            const effectiveRole = role || 'system';
            
            const [result] = await db.promise().query(
                `INSERT INTO activity_logs 
                (user_id, role, activity_type, activity_description, reference_type, reference_id, location) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [effectiveUserId, effectiveRole, activityType, description, referenceType, referenceId, location]
            );
            return result;
        } catch (error) {
            console.error('Error logging activity:', error);
            throw error;
        }
    }

    static async getUserActivities(userId, limit = 50) {
        try {
            const [activities] = await db.promise().query(
                `SELECT 
                    a.*,
                    u.name as user_name,
                    u.role as user_role
                FROM activity_logs a
                JOIN users u ON a.user_id = u.id
                WHERE a.user_id = ?
                ORDER BY a.created_at DESC 
                LIMIT ?`,
                [userId, limit]
            );
            return activities;
        } catch (error) {
            console.error('Error fetching user activities:', error);
            throw error;
        }
    }

    static async getAllActivities(limit = 100) {
        try {
            const [activities] = await db.promise().query(
                `SELECT 
                    a.*,
                    u.name as user_name,
                    u.role as user_role
                FROM activity_logs a
                JOIN users u ON a.user_id = u.id
                ORDER BY a.created_at DESC 
                LIMIT ?`,
                [limit]
            );
            return activities;
        } catch (error) {
            console.error('Error fetching all activities:', error);
            throw error;
        }
    }
}

module.exports = Activity;