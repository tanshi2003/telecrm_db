const responseFormatter = require("../utils/responseFormatter");

module.exports = (roles) => {
    return (req, res, next) => {
        const userRole = req.user?.role?.toLowerCase();
        const allowedRoles = roles.map(role => role.toLowerCase());

        console.log("User Role:", userRole);
        console.log("Allowed Roles:", allowedRoles);

        if (!userRole || !allowedRoles.includes(userRole)) {
            return res.status(403).json(responseFormatter(false, "Access denied. You do not have the required role."));
        }

        next();
    };
};