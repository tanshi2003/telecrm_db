const db = require('../config/db');

class Activity {
    static async logActivity(userId, role, activityType, description, referenceType = null, referenceId = null, location = null) {
        try {
            const [result] = await db.promise().query(
                `INSERT INTO activity_logs 
                 (user_id, role, activity_type, activity_description, reference_type, reference_id, location)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, role, activityType, description, referenceType, referenceId, location]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error logging activity:', error);
            throw error;
        }
    }

    static async getUserActivities(userId, limit = 5) {
        try {
            const [activities] = await db.promise().query(
                `SELECT * FROM activity_logs 
                 WHERE user_id = ?
                 ORDER BY created_at DESC 
                 LIMIT ?`,
                [userId, limit]
            );
            return activities;
        } catch (error) {
            console.error('Error fetching user activities:', error);
            throw error;
        }
    }

    static async getAllActivities(limit = 20) {
        try {
            const [activities] = await db.promise().query(
                `SELECT 
                    al.*,
                    u.name as user_name,
                    u.role as user_role
                FROM activity_logs al
                JOIN users u ON al.user_id = u.id
                ORDER BY al.created_at DESC 
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