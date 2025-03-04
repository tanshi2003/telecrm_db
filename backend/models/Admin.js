const db = require("../config/db");

const findAdminByEmail = (email, callback) => {
    db.query("SELECT * FROM admin WHERE email = ?", [email], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results[0]); // Return the first matching record
    });
};

module.exports = { findAdminByEmail };
