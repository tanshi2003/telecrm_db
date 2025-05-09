const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const responseFormatter = require("../utils/responseFormatter");
const { generateToken } = require("../utils/helpers"); // Move JWT logic here

// Register a new admin
exports.registerAdmin = (req, res) => {
    const { name, email, phone_no, password, role } = req.body;

    // Validate input
    if (!name || !email || !phone_no || !password || !role) {
        return res.status(400).json(responseFormatter(false, "All fields are required"));
    }

    // Simple Email Validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json(responseFormatter(false, "Invalid email format"));
    }

    // Check if admin already exists
    db.query(`SELECT * FROM Admins WHERE email = ?`, [email], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).json(responseFormatter(false, "Database error", err));
        }

        if (results.length > 0) {
            return res.status(400).json(responseFormatter(false, "Admin already exists"));
        }

        // Hash the password before saving
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.error('Error hashing the password:', err);
                return res.status(500).json(responseFormatter(false, "Error hashing password", err));
            }

            // Insert new admin into DB
            db.query(`INSERT INTO Admins (name, email, phone_no, password, role) VALUES (?, ?, ?, ?, ?)`, 
                [name, email, phone_no, hash, role], (err, results) => {
                    if (err) {
                        console.error('Error inserting into the database:', err);
                        return res.status(500).json(responseFormatter(false, "Database error", err));
                    }

                    // Fetch the newly created admin data
                    db.query(`SELECT id, name, email, phone_no, role, status FROM Admins WHERE id = ?`, [results.insertId], 
                        (err, newAdmin) => {
                            if (err) {
                                console.error('Error querying the database:', err);
                                return res.status(500).json(responseFormatter(false, "Database error", err));
                            }

                            const admin = newAdmin[0];

                            // Generate token using helper function
                            const token = generateToken(admin.id, admin.role);

                            // Update the admin with token and last login time
                            const lastLogin = new Date();
                            db.query("UPDATE Admins SET token = ?, last_login = ? WHERE id = ?", 
                                [token, lastLogin, admin.id], (err) => {
                                    if (err) {
                                        console.error('Error updating the database with token:', err);
                                        return res.status(500).json(responseFormatter(false, "Database error", err));
                                    }

                                    // Return response with sanitized admin data and token
                                    const adminData = {
                                        id: admin.id,
                                        name: admin.name,
                                        email: admin.email,
                                        phone_no: admin.phone_no,
                                        role: admin.role,
                                        status: admin.status,
                                        last_login: lastLogin,
                                        token
                                    };

                                    res.status(201).json(responseFormatter(true, "Admin registered successfully", adminData));
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
    db.query(`SELECT id, name, email, phone_no, password, role, status FROM Admins WHERE email = ?`, [email], 
        (err, results) => {
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
                const token = generateToken(admin.id, admin.role);

                // Update token and last login time
                const lastLogin = new Date();
                db.query("UPDATE Admins SET token = ?, last_login = ? WHERE id = ?", 
                    [token, lastLogin, admin.id], (err) => {
                        if (err) {
                            console.error('Error updating the database:', err);
                            return res.status(500).json(responseFormatter(false, "Database error", err));
                        }

                        // Return response with sanitized admin data and token
                        const adminData = {
                            id: admin.id,
                            name: admin.name,
                            email: admin.email,
                            phone_no: admin.phone_no,
                            role: admin.role,
                            status: admin.status,
                            last_login: lastLogin,
                            token
                        };

                        res.json(responseFormatter(true, "Login successful", adminData));
                    });
            });
        });
};

// Get all admins
exports.getAdmins = (req, res) => {
    db.query("SELECT id, name, email, phone_no, role, status FROM Admins", (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).json(responseFormatter(false, "Database error", err));
        }

        // Map through results and return sanitized data
        const admins = results.map(admin => ({
            id: admin.id,
            name: admin.name,
            email: admin.email,
            phone_no: admin.phone_no,
            role: admin.role,
            status: admin.status
        }));

        res.json(responseFormatter(true, "Admins fetched successfully", admins));
    });
};

// Update admin
exports.updateAdmin = (req, res) => {
    const { id } = req.params;
    const { name, email, phone_no, role, status } = req.body;

    if (!name || !email || !phone_no || !role || !status) {
        return res.status(400).json(responseFormatter(false, "All fields are required"));
    }

    // Update admin details
    db.query("UPDATE Admins SET name = ?, email = ?, phone_no = ?, role = ?, status = ? WHERE id = ?", 
        [name, email, phone_no, role, status, id], (err, results) => {
            if (err) {
                console.error('Error updating the database:', err);
                return res.status(500).json(responseFormatter(false, "Database error", err));
            }

            // Fetch the updated admin details
            db.query("SELECT id, name, email, phone_no, role, status FROM Admins WHERE id = ?", 
                [id], (err, updatedAdmin) => {
                    if (err) {
                        console.error('Error querying the database:', err);
                        return res.status(500).json(responseFormatter(false, "Database error", err));
                    }

                    const adminData = {
                        id: updatedAdmin[0].id,
                        name: updatedAdmin[0].name,
                        email: updatedAdmin[0].email,
                        phone_no: updatedAdmin[0].phone_no,
                        role: updatedAdmin[0].role,
                        status: updatedAdmin[0].status
                    };

                    res.json(responseFormatter(true, "Admin updated successfully", adminData));
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
