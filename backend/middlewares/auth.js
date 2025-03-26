const jwt = require("jsonwebtoken");
const responseFormatter = require("../utils/responseFormatter");

module.exports = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        return res.status(401).json(responseFormatter(false, "Access denied. No token provided."));
    }

    const token = authHeader.split(" ")[1]; // Extract the token from the "Bearer <token>" format
    if (!token) {
        return res.status(401).json(responseFormatter(false, "Access denied. Token is missing."));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).json(responseFormatter(false, "Token is not valid"));
    }
};