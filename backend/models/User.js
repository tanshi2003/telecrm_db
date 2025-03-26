const db = require("../config/db");

const User = {
    create: (user, callback) => {
        const { name, email, phone_no, password, role, status, token } = user;
        db.query(
            "INSERT INTO Users (name, email, phone_no, password, role, status, token) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [name, email, phone_no, password, role, status, token],
            callback
        );
    },

    findByToken: (token, callback) => {
        db.query("SELECT * FROM Users WHERE token = ?", [token], callback);
    },

    findById: (id, callback) => {
        db.query("SELECT * FROM Users WHERE id = ?", [id], callback);
    },

    findByTimestamp: (timestamp, callback) => {
        db.query("SELECT * FROM Users WHERE created_at > ?", [timestamp], callback);
    },

    findByRole: (role, callback) => {
        db.query("SELECT * FROM Users WHERE role = ?", [role], callback);
    }
};

module.exports = User;