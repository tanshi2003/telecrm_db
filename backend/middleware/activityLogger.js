const Activity = require('../models/Activity');

const activityLogger = {
    async logActivity(userId, role, activityType, description, referenceType = null, referenceId = null, location = null) {
        try {
            await Activity.logActivity(userId, role, activityType, description, referenceType, referenceId, location);
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    },

    // Middleware function to automatically log activities
    createLog(activityType) {
        return async (req, res, next) => {
            const originalJson = res.json;
            res.json = function(data) {
                // Only log if the operation was successful
                if (data.success) {
                    activityLogger.logActivity(
                        req.user.id,
                        req.user.role,
                        activityType,
                        req.body.description || `${activityType} action performed`,
                        req.body.referenceType,
                        req.body.referenceId,
                        req.body.location
                    ).catch(console.error);
                }
                return originalJson.call(this, data);
            };
            next();
        };
    }
};

module.exports = activityLogger;