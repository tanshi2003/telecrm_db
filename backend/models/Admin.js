const db = require("../config/db");

const Admin = {
    create: (admin, callback) => {
        const { name, email, password, phone_no, status, token } = admin;
        db.query(
            "INSERT INTO admins (name, email, password, phone_no, status, token) VALUES (?, ?, ?, ?, ?, ?)",
            [name, email, password, phone_no, status, token],
            callback
        );
    },

    findByToken: (token, callback) => {
        db.query("SELECT * FROM admins WHERE token = ?", [token], callback);
    },

    findById: (id, callback) => {
        db.query("SELECT * FROM admins WHERE id = ?", [id], callback);
    },

    findByTimestamp: (timestamp, callback) => {
        db.query("SELECT * FROM admins WHERE created_at > ?", [timestamp], callback);
    }
};

module.exports = Admin;