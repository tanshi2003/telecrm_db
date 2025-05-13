const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const responseFormatter = require("../utils/responseFormatter");

// Register a new user
exports.registerUser = (req, res) => {
    const {
        name,
        email,
        phone_no,
        password,
        role,
        status,
        manager_id = null,
        location = null
    } = req.body;

    // Log the incoming request body
    console.log("Request Body:", req.body);

    if (!name || !email || !phone_no || !password || !role || !status) {
        return res.status(400).json({ message: "All fields are required" });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error("Error hashing password:", err);
            return res.status(500).json({ message: "Error hashing password" });
        }

        const newUser = {
            name,
            email,
            phone_no,
            password: hashedPassword,
            role,
            status,
            manager_id,
            location
        };

        db.query("INSERT INTO Users SET ?", newUser, (err, result) => {
            if (err) {
                console.error("Error inserting user into database:", err);
                return res.status(500).json({ message: "Error registering user", error: err });
            }

            const token = jwt.sign({ id: result.insertId, role }, process.env.JWT_SECRET, { expiresIn: "24h" });

            db.query("UPDATE Users SET token = ? WHERE id = ?", [token, result.insertId], (err) => {
                if (err) {
                    console.error("Error saving token:", err);
                    return res.status(500).json({ message: "Error saving token", error: err });
                }

                res.status(201).json({
                    message: "User registered successfully",
                    user: {
                        id: result.insertId,
                        name,
                        email,
                        phone_no,
                        role,
                        status,
                        manager_id,
                        location,
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

            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" });

            const lastLogin = new Date();
            db.query(
                "UPDATE Users SET token = ?, last_login = ? WHERE id = ?",
                [token, lastLogin, user.id],
                (err) => {
                    if (err) return res.status(500).json(responseFormatter(false, "Error updating token", err));

                    res.status(200).json(responseFormatter(true, "Login successful", {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone_no: user.phone_no,
                        role: user.role,
                        status: user.status,
                        manager_id: user.manager_id,
                        location: user.location,
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
        SELECT id, name, email, role, total_leads, campaigns_handled, total_working_hours
        FROM user_stats_view
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json(responseFormatter(false, "Database error", err));
        res.json(responseFormatter(true, "Users fetched successfully", results));
    });
};

// Get user by ID
exports.getUserById = (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT 
            u.*, 
            COUNT(DISTINCT cu.campaign_id) AS campaigns_handled
        FROM 
            Users u
        LEFT JOIN 
            campaign_users cu ON u.id = cu.user_id
        WHERE 
            u.id = ?
        GROUP BY 
            u.id
    `;

    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        if (results.length === 0) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ user: results[0] });
    });
};

// Get campaigns handled by a user
exports.getCampaignsHandledByUser = (req, res) => {
    console.log("Fetching campaigns for user ID:", req.params.id);

    const { id } = req.params;

    const query = `
        SELECT 
            c.id, c.name, c.description, c.status, c.priority, c.start_date, c.end_date
        FROM 
            campaigns c
        INNER JOIN 
            campaign_users cu ON c.id = cu.campaign_id
        WHERE 
            cu.user_id = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error("Error fetching campaigns handled by user:", err);
            return res.status(500).json(responseFormatter(false, "Database error", err.message));
        }

        res.status(200).json(responseFormatter(true, "Campaigns handled fetched successfully", results));
    });
};

// Get leads assigned to a user
exports.getLeadsByUserId = (req, res) => {
    console.log("Fetching leads for user ID:", req.params.id);

    const { id } = req.params;

    const query = `
        SELECT 
            l.id, l.title, l.description, l.status, l.lead_category, l.name, l.phone_no, l.address, l.notes
        FROM 
            leads l
        WHERE 
            l.assigned_to = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error("Error fetching leads for user:", err);
            return res.status(500).json(responseFormatter(false, "Database error", err.message));
        }

        res.status(200).json(responseFormatter(true, "Leads fetched successfully", results));
    });
};

// Get campaigns assigned to a user
exports.getCampaignsByUserId = (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT 
            c.id, c.name, c.description, c.status, c.priority, c.start_date, c.end_date
        FROM 
            campaigns c
        INNER JOIN 
            campaign_users cu ON c.id = cu.campaign_id
        WHERE 
            cu.user_id = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error("Error fetching campaigns for user:", err);
            return res.status(500).json(responseFormatter(false, "Database error", err.message));
        }

        res.status(200).json(responseFormatter(true, "Campaigns fetched successfully", results));
    });
};

// Update a user
exports.updateUser = (req, res) => {
    const { id } = req.params;
    const {
        name, email, phone_no, role, status, manager_id, location
    } = req.body;

    const updatedUser = {
        name, email, phone_no, role, status, manager_id, location
    };

    db.query("UPDATE Users SET ? WHERE id = ?", [updatedUser, id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error updating user", error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ message: "User updated successfully" });
    });
};

// Update User role
exports.updateUserRole = (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
        return res.status(400).json({ message: "Role is required" });
    }

    db.query("UPDATE Users SET role = ? WHERE id = ?", [role, id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });

        db.query("SELECT * FROM Users WHERE id = ?", [id], (err, rows) => {
            if (err) return res.status(500).json({ message: "Error fetching updated user", error: err });
            res.status(200).json({
                message: "User role updated successfully",
                updatedUser: rows[0]
            });
        });
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
