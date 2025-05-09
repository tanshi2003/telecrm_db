// const jwt = require("jsonwebtoken");

// // Helper function to generate JWT token
// const generateToken = (id, role) => {
//     const payload = { id, role };
//     const secret = process.env.JWT_SECRET || "secret"; // Replace with actual secret key from env
//     const options = { expiresIn: "1h" }; // Token expires in 1 hour

//     return jwt.sign(payload, secret, options);
// };

// module.exports = { generateToken };
// utils/helpers.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// Hash password
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// Compare passwords
const comparePasswords = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

// Generate JWT
const generateToken = (userId, role) => {
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: "24h" });
};

// Find user by email
const findUserByEmail = (email, callback) => {
    db.query("SELECT * FROM Users WHERE email = ?", [email], (err, results) => {
        if (err) return callback(err, null);
        if (results.length === 0) return callback(null, null);
        callback(null, results[0]);
    });
};

// Format DB insert/update response
const formatUserResponse = (user, token = null) => {
    const {
        id, name, email, phone_no, role, status,
        working_hours, campaigns_handled, performance_rating,
        manager_id, location, total_leads
    } = user;

    return {
        id, name, email, phone_no, role, status,
        working_hours, campaigns_handled, performance_rating,
        manager_id, location, total_leads,
        token
    };
};

module.exports = {
    hashPassword,
    comparePasswords,
    generateToken,
    findUserByEmail,
    formatUserResponse
};
