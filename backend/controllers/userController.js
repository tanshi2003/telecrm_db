const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const responseFormatter = require("../utils/responseFormatter");

// Register a new user
exports.registerUser = (req, res) => {
    const { name, email, phone_no, password, role } = req.body;

    if (!name || !email || !phone_no || !password || !role) {
        return res.status(400).json(responseFormatter(false, "All fields are required"));
    }

    // Check if the user already exists
    db.query(`SELECT * FROM Users WHERE email = ?`, [email], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).json(responseFormatter(false, "Database error", err));
        }

        if (results.length > 0) {
            return res.status(400).json(responseFormatter(false, "User already exists"));
        }

        // Hash the password
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.error('Error hashing the password:', err);
                return res.status(500).json(responseFormatter(false, "Error hashing password", err));
            }

            // Insert the new user into the database
            db.query(`INSERT INTO Users (name, email, phone_no, password, role) VALUES (?, ?, ?, ?, ?)`, [name, email, phone_no, hash, role], (err, results) => {
                if (err) {
                    console.error('Error inserting into the database:', err);
                    return res.status(500).json(responseFormatter(false, "Database error", err));
                }

                // Fetch the newly created user
                db.query(`SELECT * FROM Users WHERE id = ?`, [results.insertId], (err, newUser) => {
                    if (err) {
                        console.error('Error querying the database:', err);
                        return res.status(500).json(responseFormatter(false, "Database error", err));
                    }

                    const user = newUser[0];

                    // Generate a JWT token
                    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" });

                    // Update the user with the token
                    db.query("UPDATE Users SET token = ? WHERE id = ?", [token, user.id], (err) => {
                        if (err) {
                            console.error('Error updating the database with token:', err);
                            return res.status(500).json(responseFormatter(false, "Database error", err));
                        }

                        // Return the response with the user data and token
                        res.status(201).json(responseFormatter(true, "User registered successfully", { ...user, token }));
                    });
                });
            });
        });
    });
};

// Login a user
exports.loginUser = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json(responseFormatter(false, "All fields are required"));
    }

    // Check if the user exists
    db.query(`SELECT * FROM Users WHERE email = ?`, [email], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).json(responseFormatter(false, "Database error", err));
        }

        if (results.length === 0) {
            return res.status(400).json(responseFormatter(false, "Invalid email or password"));
        }

        const user = results[0];

        // Compare the password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).json(responseFormatter(false, "Error comparing passwords", err));
            }

            if (!isMatch) {
                return res.status(400).json(responseFormatter(false, "Invalid email or password"));
            }

            // Generate a JWT token
            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" });

            res.json(responseFormatter(true, "Login successful", { ...user, token }));
        });
    });
};

// Get all users
exports.getUsers = (req, res) => {
    db.query("SELECT id, name, email, phone_no, role FROM Users", (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).json(responseFormatter(false, "Database error", err));
        }

        res.json(responseFormatter(true, "Users fetched successfully", results));
    });
};

// Update user
exports.updateUser = (req, res) => {
    const { id } = req.params;
    const { name, email, phone_no, role } = req.body;

    if (!name || !email || !phone_no || !role) {
        return res.status(400).json(responseFormatter(false, "All fields are required"));
    }

    db.query("UPDATE Users SET name = ?, email = ?, phone_no = ?, role = ? WHERE id = ?", [name, email, phone_no, role, id], (err, results) => {
        if (err) {
            console.error('Error updating the database:', err);
            return res.status(500).json(responseFormatter(false, "Database error", err));
        }

        res.json(responseFormatter(true, "User updated successfully"));
    });
};

// Delete user
exports.deleteUser = (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM Users WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json(responseFormatter(false, "Database error", err));
        if (results.length === 0) return res.status(404).json(responseFormatter(false, "User not found"));

    db.query("DELETE FROM Users WHERE id = ?", [id], (err, results) => {
        if (err) {
            console.error('Error deleting from the database:', err);
            return res.status(500).json(responseFormatter(false, "Database error", err));
        }

        res.json(responseFormatter(true, "User deleted successfully"));
    });
});
};