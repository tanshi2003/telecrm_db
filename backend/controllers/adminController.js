const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/jwt");

const responseFormatter = require("../utils/responseFormatter");
const { generateToken } = require("../utils/helpers"); // Move JWT logic here

// Register a new admin
exports.registerAdmin = (req, res) => {
    const { name, email, phone_no, password, role } = req.body;

    // Validate input
    if (!name || !email || !phone_no || !password || !role) {
        return res.status(400).json(responseFormatter(false, "All fields are required"));
    }
    if (role !== 'admin') {
        return res.status(400).json(responseFormatter(false, "Admin registration must use the admin role"));
    }

    // Simple Email Validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json(responseFormatter(false, "Invalid email format"));
    }

    // Check if admin already exists
    db.query(`SELECT email FROM admins`, (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).json(responseFormatter(false, "Database error"));
        }

        if (results.some((adminRow) => adminRow.email.toLowerCase() === email.toLowerCase())) {
            return res.status(409).json(responseFormatter(false, "Admin already exists with this email"));
        }

        // Permit public bootstrap only when no admin exists yet. Once an admin exists,
        // require a valid admin JWT for any additional admin registration.
        if (results.length > 0) {
            const authHeader = req.headers.authorization || '';
            const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
            let decoded = null;
            try {
                if (token) decoded = jwt.verify(token, JWT_SECRET);
            } catch (_) {
                decoded = null;
            }
            if (!decoded || decoded.role !== 'admin') {
                return res.status(403).json(responseFormatter(false, "Only an authenticated admin can register another admin"));
            }
        }

        // Hash the password before saving
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.error('Error hashing the password:', err);
                return res.status(500).json(responseFormatter(false, "Error hashing password"));
            }

            // Insert new admin into DB
            db.query(`INSERT INTO admins (name, email, phone_no, password, role) VALUES (?, ?, ?, ?, ?)`, 
                [name, email, phone_no, hash, role], (err, results) => {
                    if (err) {
                        console.error('Error inserting into the database:', err);
                        return res.status(500).json(responseFormatter(false, "Database error"));
                    }

                    // Fetch the newly created admin data
                    db.query(`SELECT id, name, email, phone_no, role, status FROM admins WHERE id = ?`, [results.insertId], 
                        (err, newAdmin) => {
                            if (err) {
                                console.error('Error querying the database:', err);
                                return res.status(500).json(responseFormatter(false, "Database error"));
                            }

                            const admin = newAdmin[0];

                            // Generate token using helper function
                            const token = generateToken(admin.id, admin.role);

                            // Update the admin with token and last login time
                            const lastLogin = new Date();
                            db.query("UPDATE admins SET token = ?, last_login = ? WHERE id = ?", 
                                [token, lastLogin, admin.id], (err) => {
                                    if (err) {
                                        console.error('Error updating the database with token:', err);
                                        return res.status(500).json(responseFormatter(false, "Database error"));
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
    db.query(`SELECT id, name, email, phone_no, password, role, status FROM admins WHERE email = ?`, [email], 
        (err, results) => {
            if (err) {
                console.error('Error querying the database:', err);
                return res.status(500).json(responseFormatter(false, "Database error"));
            }

            if (results.length === 0) {
                return res.status(400).json(responseFormatter(false, "Invalid email or password"));
            }

            const admin = results[0];

            // Compare the password
            bcrypt.compare(password, admin.password, (err, isMatch) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    return res.status(500).json(responseFormatter(false, "Error comparing passwords"));
                }

                if (!isMatch) {
                    return res.status(400).json(responseFormatter(false, "Invalid email or password"));
                }

                // Generate a new JWT token
                const token = generateToken(admin.id, admin.role);

                // Update token and last login time using a transaction
                db.getConnection((err, connection) => {
                    if (err) {
                        console.error('Error getting connection:', err);
                        return res.status(500).json(responseFormatter(false, "Database connection error"));
                    }

                    connection.beginTransaction(err => {
                        if (err) {
                            connection.release();
                            console.error('Error starting transaction:', err);
                            return res.status(500).json(responseFormatter(false, "Transaction error"));
                        }

                        const lastLogin = new Date();
                        connection.query(
                            "UPDATE admins SET token = ?, last_login = ? WHERE id = ?",
                            [token, lastLogin, admin.id],
                            (err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        console.error('Error updating admin:', err);
                                        res.status(500).json(responseFormatter(false, "Error updating admin data"));
                                    });
                                }

                                connection.commit(err => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            console.error('Error committing transaction:', err);
                                            res.status(500).json(responseFormatter(false, "Error committing changes"));
                                        });
                                    }

                                    connection.release();
                                    
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
                            }
                        );
                    });
                });
            });
        }
    );
};

// Get all admins
exports.getAdmins = (req, res) => {
    db.query("SELECT id, name, email, phone_no, role, status FROM admins", (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).json(responseFormatter(false, "Database error"));
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

        res.json(responseFormatter(true, "admins fetched successfully", admins));
    });
};

// Update admin
exports.updateAdmin = (req, res) => {
    const { id } = req.params;
    const { name, email, phone_no, role, status } = req.body;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json(responseFormatter(false, "Invalid admin ID"));
    }
    if (!name || !email || !phone_no || !role || !status) {
        return res.status(400).json(responseFormatter(false, "All fields are required"));
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email) || role !== 'admin' || !['active', 'inactive', 'suspended'].includes(status)) {
        return res.status(400).json(responseFormatter(false, "Invalid email, role, or status"));
    }

    // Update admin details
    db.query("UPDATE admins SET name = ?, email = ?, phone_no = ?, role = ?, status = ? WHERE id = ?", 
        [name, email, phone_no, role, status, id], (err, results) => {
            if (err) {
                console.error('Error updating the database:', err);
                return res.status(500).json(responseFormatter(false, "Database error"));
            }

            // Fetch the updated admin details
            db.query("SELECT id, name, email, phone_no, role, status FROM admins WHERE id = ?", 
                [id], (err, updatedAdmin) => {
                    if (err) {
                        console.error('Error querying the database:', err);
                        return res.status(500).json(responseFormatter(false, "Database error"));
                    }

                    if (!updatedAdmin.length) {
                        return res.status(404).json(responseFormatter(false, "Admin not found"));
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
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json(responseFormatter(false, "Invalid admin ID"));
    }

    db.query("SELECT COUNT(*) AS total FROM admins WHERE status = 'active'", (countErr, countRows) => {
        if (countErr) {
            console.error('Error checking active admin count:', countErr);
            return res.status(500).json(responseFormatter(false, "Database error"));
        }
        db.query("SELECT status FROM admins WHERE id = ?", [id], (checkErr, adminRows) => {
            if (checkErr) {
                console.error('Error checking admin:', checkErr);
                return res.status(500).json(responseFormatter(false, "Database error"));
            }
            if (!adminRows.length) return res.status(404).json(responseFormatter(false, "Admin not found"));
            if (adminRows[0].status === 'active' && Number(countRows[0].total) <= 1) {
                return res.status(409).json(responseFormatter(false, "Cannot delete the last active admin"));
            }

            db.query("DELETE FROM admins WHERE id = ?", [id], (err) => {
                if (err) {
                    console.error('Error deleting from the database:', err);
                    return res.status(500).json(responseFormatter(false, "Database error"));
                }
                res.json(responseFormatter(true, "Admin deleted successfully", null));
            });
        });
    });
};
