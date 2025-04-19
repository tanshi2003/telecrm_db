const db = require("../config/db");

const User = {
    create: (user, callback) => {
        const { name, email, phone_no, password, role, status, token, working_hours = 0, total_leads = 0 } = user;
        db.query(
            "INSERT INTO Users (name, email, phone_no, password, role, status, token, working_hours, total_leads) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [name, email, phone_no, password, role, status, token, working_hours, total_leads],
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
    },

    // Update user information
    update: (id, user, callback) => {
        const { name, email, phone_no, role, status, working_hours, total_leads } = user;
        db.query(
            "UPDATE Users SET name = ?, email = ?, phone_no = ?, role = ?, status = ?, working_hours = ?, total_leads = ?, updated_at = NOW() WHERE id = ?",
            [name, email, phone_no, role, status, working_hours, total_leads, id],
            callback
        );
    },

    // Update working hours and total leads
    updateMetrics: (id, working_hours, total_leads, callback) => {
        db.query(
            "UPDATE Users SET working_hours = ?, total_leads = ?, updated_at = NOW() WHERE id = ?",
            [working_hours, total_leads, id],
            callback
        );
    }
};

module.exports = User;
