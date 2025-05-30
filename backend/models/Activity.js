const db = require('../config/db');

class Activity {
    static async log(userId, actionType, description, referenceType = null, referenceId = null) {
        try {
            const [result] = await db.promise().query(
                `INSERT INTO activity_logs 
                 (user_id, action_type, action_description, reference_type, reference_id)
                 VALUES (?, ?, ?, ?, ?)`,
                [userId, actionType, description, referenceType, referenceId]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error logging activity:', error);
            throw error;
        }
    }

    static async getUserActivities(userId, limit = 10) {
        try {
            const [activities] = await db.promise().query(
                `SELECT 
                    al.*,
                    u.name as user_name,
                    u.role as user_role
                 FROM activity_logs al
                 JOIN users u ON al.user_id = u.id
                 WHERE al.user_id = ?
                 ORDER BY al.created_at DESC
                 LIMIT ?`,
                [userId, limit]
            );
            return activities;
        } catch (error) {
            console.error('Error fetching activities:', error);
            throw error;
        }
    }

    static async getRecentActivities(role = null, limit = 20) {
        try {
            let query = `
                SELECT 
                    al.*,
                    u.name as user_name,
                    u.role as user_role
                FROM activity_logs al
                JOIN users u ON al.user_id = u.id
            `;

            const params = [];
            if (role) {
                query += ' WHERE u.role = ?';
                params.push(role);
            }

            query += ' ORDER BY al.created_at DESC LIMIT ?';
            params.push(limit);

            const [activities] = await db.promise().query(query, params);
            return activities;
        } catch (error) {
            console.error('Error fetching recent activities:', error);
            throw error;
        }
    }
}

module.exports = Activity;