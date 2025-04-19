const db = require("../config/db");

const Admin = {
    create: (admin, callback) => {
        const { name, email, password, phone_no, status, token } = admin;
        db.query(
            "INSERT INTO Admins (name, email, password, phone_no, status, token) VALUES (?, ?, ?, ?, ?, ?)",
            [name, email, password, phone_no, status, token],
            callback
        );
    },

    findByToken: (token, callback) => {
        db.query("SELECT * FROM Admins WHERE token = ?", [token], callback);
    },

    findById: (id, callback) => {
        db.query("SELECT * FROM Admins WHERE id = ?", [id], callback);
    },

    findByTimestamp: (timestamp, callback) => {
        db.query("SELECT * FROM Admins WHERE created_at > ?", [timestamp], callback);
    }
};

module.exports = Admin;