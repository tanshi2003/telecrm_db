const responseFormatter = require("../utils/responseFormatter");

module.exports = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json(responseFormatter(false, "Access denied. You do not have the required role."));
        }
        next();
    };
};