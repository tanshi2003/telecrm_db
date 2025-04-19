const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const responseFormatter = require("../utils/responseFormatter");
const User = require("../models/User");

// Register a new user
exports.registerUser = (req, res) => {
    const {
        name,
        email,
        phone_no,
        password,
        role,
        status,
        working_hours = 0,
        campaigns_handled = 0,
        performance_rating = null,
        manager_id = null,
        location = null,
        total_leads = 0
    } = req.body;

    if (!name || !email || !phone_no || !password || !role || !status) {
        return res.status(400).json({ message: "All fields are required" });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ message: "Error hashing password" });

        const newUser = {
            name,
            email,
            phone_no,
            password: hashedPassword,
            role,
            status,
            working_hours,
            campaigns_handled,
            performance_rating,
            manager_id,
            location,
            total_leads
        };

        db.query("INSERT INTO Users SET ?", newUser, (err, result) => {
            if (err) return res.status(500).json({ message: "Error registering user", error: err });

            const token = jwt.sign({ id: result.insertId, role }, process.env.JWT_SECRET, { expiresIn: "24h" });

            db.query("UPDATE Users SET token = ? WHERE id = ?", [token, result.insertId], (err) => {
                if (err) return res.status(500).json({ message: "Error saving token", error: err });

                res.status(201).json({
                    message: "User registered successfully",
                    user: {
                        id: result.insertId,
                        name,
                        email,
                        phone_no,
                        role,
                        status,
                        working_hours,
                        campaigns_handled,
                        performance_rating,
                        manager_id,
                        location,
                        total_leads,
                        token
                    }
                });
            });
        });
    });
};

// Login user
exports.loginUser = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json(responseFormatter(false, "All fields are required"));
    }

    db.query("SELECT * FROM Users WHERE email = ?", [email], (err, results) => {
        if (err) return res.status(500).json(responseFormatter(false, "Database error", err));
        if (results.length === 0) return res.status(400).json(responseFormatter(false, "Invalid email or password"));

        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) return res.status(400).json(responseFormatter(false, "Invalid email or password"));

            // Generate a new JWT token
            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" });

            // Update the user's token and last login timestamp in the database
            const lastLogin = new Date();
            db.query(
                "UPDATE Users SET token = ?, last_login = ? WHERE id = ?",
                [token, lastLogin, user.id],
                (err) => {
                    if (err) return res.status(500).json(responseFormatter(false, "Error updating token", err));

                    // Return the response with the updated user data and token
                    res.status(200).json(responseFormatter(true, "Login successful", {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone_no: user.phone_no,
                        role: user.role,
                        status: user.status,
                        working_hours: user.working_hours,
                        campaigns_handled: user.campaigns_handled,
                        performance_rating: user.performance_rating,
                        manager_id: user.manager_id,
                        location: user.location,
                        total_leads: user.total_leads,
                        token,
                        last_login: lastLogin
                    }));
                }
            );
        });
    });
};

// Get all users
exports.getUsers = (req, res) => {
    const query = `
        SELECT id, name, email, phone_no, role, status, working_hours, campaigns_handled,
               performance_rating, manager_id, location, total_leads
        FROM Users`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json(responseFormatter(false, "Database error", err));
        res.json(responseFormatter(true, "Users fetched successfully", results));
    });
};

// Update a user
exports.updateUser = (req, res) => {
    const { id } = req.params;
    const {
        name, email, phone_no, role, status, working_hours,
        campaigns_handled, performance_rating, manager_id, location, total_leads
    } = req.body;

    const updatedUser = {
        name, email, phone_no, role, status, working_hours,
        campaigns_handled, performance_rating, manager_id, location, total_leads
    };

    User.update(id, updatedUser, (err, result) => {
        if (err) return res.status(500).json({ message: "Error updating user" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ message: "User updated successfully", user: result });
    });
};

// Update working hours, campaigns handled, and total leads
exports.updateMetrics = (req, res) => {
    const { id } = req.params;
    const { working_hours, campaigns_handled, total_leads } = req.body;

    User.updateMetrics(id, working_hours, campaigns_handled, total_leads, (err, result) => {
        if (err) return res.status(500).json({ message: "Error updating metrics" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ message: "Metrics updated successfully", user: result });
    });
};

// Delete user
exports.deleteUser = (req, res) => {
    const { id } = req.params;

    db.query("SELECT * FROM Users WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json(responseFormatter(false, "Database error", err));
        if (results.length === 0) return res.status(404).json(responseFormatter(false, "User not found"));

        db.query("DELETE FROM Users WHERE id = ?", [id], (err) => {
            if (err) return res.status(500).json(responseFormatter(false, "Database error", err));
            res.json(responseFormatter(true, "User deleted successfully"));
        });
    });
};
