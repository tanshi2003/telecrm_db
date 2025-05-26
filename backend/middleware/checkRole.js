const responseFormatter = require("../utils/responseFormatter");

/**
 * Role-based access control middleware
 * @param {string[]} allowedRoles - Array of roles that are allowed to access the route
 * @returns {function} Express middleware function
 */
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json(responseFormatter(false, "Access denied. No user found."));
        }

        const userRole = req.user.role?.toLowerCase();
        const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

        if (!userRole || !normalizedAllowedRoles.includes(userRole)) {
            return res.status(403).json(responseFormatter(false, "Access denied. Insufficient privileges."));
        }

        next();
    };
};

module.exports = roleMiddleware;