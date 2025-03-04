const db = require("../config/db");

const findUserByEmail = (email, callback) => {
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) return callback(err, null);
        if (results.length === 0) return callback(null, null);  // No user found
        callback(null, results[0]); // Return the first matching user
    });
};

const createUser = (email, password, role, callback) => {
    db.query("INSERT INTO users (email, password, role) VALUES (?, ?, ?)", 
    [email, password, role], 
    (err, results) => {
        if (err) return callback(err, null);
        callback(null, results);
    });
};

module.exports = { findUserByEmail, createUser };
