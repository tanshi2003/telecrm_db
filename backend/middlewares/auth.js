const jwt = require("jsonwebtoken");
const responseFormatter = require("../utils/responseFormatter");

module.exports = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        return res.status(401).json(responseFormatter(false, "Access denied. No token provided."));
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json(responseFormatter(false, "Access denied. Invalid token format."));
    }

    const token = parts[1];
    if (!token) {
        return res.status(401).json(responseFormatter(false, "Access denied. Token is missing."));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (ex) {
        console.error("JWT Verification Error:", ex.message); // Log the error for debugging
        res.status(400).json(responseFormatter(false, "Token is not valid"));
    }
};