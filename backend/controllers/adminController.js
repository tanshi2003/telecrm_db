const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const responseFormatter = require("../utils/responseFormatter");

// Register a new admin
exports.registerAdmin = (req, res) => {
    const { name, email, phone_no, password, role } = req.body;

    if (!name || !email || !phone_no || !password || !role) {
        return res.status(400).json(responseFormatter(false, "All fields are required"));
    }

    // Check if the admin already exists
    db.query(`SELECT * FROM Admins WHERE email = ?`, [email], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).json(responseFormatter(false, "Database error", err));
        }

        if (results.length > 0) {
            return res.status(400).json(responseFormatter(false, "Admin already exists"));
        }

        // Hash the password
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.error('Error hashing the password:', err);
                return res.status(500).json(responseFormatter(false, "Error hashing password", err));
            }

            // Insert the new admin into the database
            db.query(`INSERT INTO Admins (name, email, phone_no, password, role) VALUES (?, ?, ?, ?, ?)`, [name, email, phone_no, hash, role], (err, results) => {
                if (err) {
                    console.error('Error inserting into the database:', err);
                    return res.status(500).json(responseFormatter(false, "Database error", err));
                }

                // Fetch the newly created admin
                db.query(`SELECT * FROM Admins WHERE id = ?`, [results.insertId], (err, newAdmin) => {
                    if (err) {
                        console.error('Error querying the database:', err);
                        return res.status(500).json(responseFormatter(false, "Database error", err));
                    }

                    const admin = newAdmin[0];

                    // Generate a JWT token
                    const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "24h" });

                    // Update the admin with the token
                    const lastLogin = new Date();
                    db.query("UPDATE Admins SET token = ?, last_login = ? WHERE id = ?", [token, lastLogin, admin.id], (err) => {
                        if (err) {
                            console.error('Error updating the database with token:', err);
                            return res.status(500).json(responseFormatter(false, "Database error", err));
                        }

                        // Return the response with the admin data and token
                        res.status(201).json(responseFormatter(true, "Admin registered successfully", { ...admin, token }));
                    });
                });
            });
        });
    });
};

// Login an admin
exports.loginAdmin = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json(responseFormatter(false, "All fields are required"));
    }

    // Check if the admin exists
    db.query(`SELECT * FROM Admins WHERE email = ?`, [email], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).json(responseFormatter(false, "Database error", err));
        }

        if (results.length === 0) {
            return res.status(400).json(responseFormatter(false, "Invalid email or password"));
        }

        const admin = results[0];

        // Compare the password
        bcrypt.compare(password, admin.password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).json(responseFormatter(false, "Error comparing passwords", err));
            }

            if (!isMatch) {
                return res.status(400).json(responseFormatter(false, "Invalid email or password"));
            }

            // Generate a new JWT token
            const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "24h" });

            // Update the admin's token and last login timestamp in the database
            const lastLogin = new Date();
            db.query(
                "UPDATE Admins SET token = ?, last_login = ? WHERE id = ?",
                [token, lastLogin, admin.id],
                (err) => {
                    if (err) {
                        console.error('Error updating the database:', err);
                        return res.status(500).json(responseFormatter(false, "Database error", err));
                    }

                    // Return the response with the updated admin data and token
                    res.json(responseFormatter(true, "Login successful", { ...admin, token, last_login: lastLogin }));
                }
            );
        });
    });
};

// Get all admins
exports.getAdmins = (req, res) => {
    db.query("SELECT * FROM Admins", (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).json(responseFormatter(false, "Database error", err));
        }

        res.json(responseFormatter(true, "Admins fetched successfully", results));
    });
};

// Update admin
exports.updateAdmin = (req, res) => {
    const { id } = req.params;
    const { name, email, phone_no, role, status } = req.body;

    if (!name || !email || !phone_no || !role || !status) {
        return res.status(400).json(responseFormatter(false, "All fields are required"));
    }

    db.query("UPDATE Admins SET name = ?, email = ?, phone_no = ?, role = ?, status = ? WHERE id = ?", [name, email, phone_no, role, status, id], (err, results) => {
        if (err) {
            console.error('Error updating the database:', err);
            return res.status(500).json(responseFormatter(false, "Database error", err));
        }

        // Fetch the updated admin
        db.query("SELECT * FROM Admins WHERE id = ?", [id], (err, updatedAdmin) => {
            if (err) {
                console.error('Error querying the database:', err);
                return res.status(500).json(responseFormatter(false, "Database error", err));
            }

            res.json(responseFormatter(true, "Admin updated successfully", updatedAdmin[0]));
        });
    });
};

// Delete admin
exports.deleteAdmin = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM Admins WHERE id = ?", [id], (err, results) => {
        if (err) {
            console.error('Error deleting from the database:', err);
            return res.status(500).json(responseFormatter(false, "Database error", err));
        }

        res.json(responseFormatter(true, "Admin deleted successfully", null));
    });
};