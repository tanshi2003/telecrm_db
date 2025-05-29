const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const responseFormatter = require("../utils/responseFormatter");
const User = require("../models/user");

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
      location,
      // Leave token blank now
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

// Get all users or filtered by manager ID
exports.getUsers = async (req, res) => {
  try {
    const { managerId } = req.query;
    let query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone_no,
        u.role,
        u.status,
        u.manager_id,
        u.location,
        u.created_at,
        u.updated_at,
        COALESCE(m.name, '') as manager_name
      FROM Users u 
      LEFT JOIN Users m ON u.manager_id = m.id
      WHERE 1=1
    `;
    const queryParams = [];

    // If managerId is provided, only show users assigned to that manager
    if (managerId) {
      query += ` AND u.manager_id = ?`;
      queryParams.push(managerId);
    }

    // If user is a manager, only show their team members
    if (req.user && req.user.role === 'manager') {
      query += ` AND u.manager_id = ?`;
      queryParams.push(req.user.id);
    }

    // Exclude sensitive information
    query += ` AND u.role != 'admin'`;

    query += ` ORDER BY u.name ASC`;

    db.query(query, queryParams, (err, users) => {
      if (err) {
        console.error('Error in getUsers:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch users',
          error: err.message
        });
      }

      // Remove sensitive fields
      const safeUsers = users.map(user => {
        const { password, token, reset_token, reset_token_expiry, ...safeUser } = user;
        return safeUser;
      });

      res.json({
        success: true,
        data: safeUsers
      });
    });
  } catch (error) {
    console.error('Unexpected error in getUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user by ID
exports.getUserById = (req, res) => {
    const { id } = req.params;
    
    db.query("SELECT * FROM Users WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json(responseFormatter(false, "Database error", err));
        if (results.length === 0) return res.status(404).json(responseFormatter(false, "User not found"));
        
        const user = results[0];
        delete user.password; // Remove sensitive data
        res.json(responseFormatter(true, "User fetched successfully", user));
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
    const { id } = req.params;

    const query = `
        SELECT 
            l.id, l.title, l.name, l.description, l.status, l.lead_category,
            l.phone_no, l.address, l.notes, l.created_at, l.updated_at
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

        res.json(responseFormatter(true, "Leads fetched successfully", results));
    });
};

// Get campaigns assigned to a user
exports.getCampaignsByUserId = (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT 
            c.id, c.name, c.description, c.status, c.priority,
            c.start_date, c.end_date, c.created_at, c.updated_at
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

        res.json(responseFormatter(true, "Campaigns fetched successfully", results));
    });
};

// Update user
exports.updateUser = (req, res) => {
    const { id } = req.params;
    const {
        name, email, phone_no, role, status, manager_id, location,
        assigned_leads = [], assigned_campaigns = []
    } = req.body;

    const updatedUser = {
        name, email, phone_no, role, status, manager_id, location
    };

    // Update user details
    db.query("UPDATE Users SET ? WHERE id = ?", [updatedUser, id], (err, result) => {
        if (err) {
            console.error("Error updating user:", err);
            return res.status(500).json(responseFormatter(false, "Error updating user", err));
        }

        // Update lead assignments
        db.query("UPDATE leads SET assigned_to = NULL WHERE assigned_to = ?", [id], err => {
            if (err) {
                console.error("Error clearing lead assignments:", err);
                return res.status(500).json(responseFormatter(false, "Error updating leads", err));
            }

            if (assigned_leads.length > 0) {
                db.query(
                    "UPDATE leads SET assigned_to = ? WHERE id IN (?)",
                    [id, assigned_leads],
                    err => {
                        if (err) {
                            console.error("Error assigning leads:", err);
                            return res.status(500).json(responseFormatter(false, "Error assigning leads", err));
                        }

                        // Update campaign assignments
                        db.query("DELETE FROM campaign_users WHERE user_id = ?", [id], err => {
                            if (err) {
                                console.error("Error clearing campaign assignments:", err);
                                return res.status(500).json(responseFormatter(false, "Error updating campaigns", err));
                            }

                            if (assigned_campaigns.length > 0) {
                                const campaignValues = assigned_campaigns.map(campaignId => [campaignId, id]);
                                db.query(
                                    "INSERT INTO campaign_users (campaign_id, user_id) VALUES ?",
                                    [campaignValues],
                                    err => {
                                        if (err) {
                                            console.error("Error assigning campaigns:", err);
                                            return res.status(500).json(responseFormatter(false, "Error assigning campaigns", err));
                                        }
                                        res.json(responseFormatter(true, "User updated successfully"));
                                    }
                                );
                            } else {
                                res.json(responseFormatter(true, "User updated successfully"));
                            }
                        });
                    }
                );
            } else {
                // Update campaign assignments even if no leads are assigned
                db.query("DELETE FROM campaign_users WHERE user_id = ?", [id], err => {
                    if (err) {
                        console.error("Error clearing campaign assignments:", err);
                        return res.status(500).json(responseFormatter(false, "Error updating campaigns", err));
                    }

                    if (assigned_campaigns.length > 0) {
                        const campaignValues = assigned_campaigns.map(campaignId => [campaignId, id]);
                        db.query(
                            "INSERT INTO campaign_users (campaign_id, user_id) VALUES ?",
                            [campaignValues],
                            err => {
                                if (err) {
                                    console.error("Error assigning campaigns:", err);
                                    return res.status(500).json(responseFormatter(false, "Error assigning campaigns", err));
                                }
                                res.json(responseFormatter(true, "User updated successfully"));
                            }
                        );
                    } else {
                        res.json(responseFormatter(true, "User updated successfully"));
                    }
                });
            }
        });
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

// Assign or reassign manager to a user
exports.assignManager = (req, res) => {
    const { id } = req.params; // user id
    const { manager_id } = req.body;

    if (!manager_id) {
        return res.status(400).json({ message: "Manager ID is required" });
    }

    // Check if manager exists and is a manager
    db.query("SELECT * FROM Users WHERE id = ? AND role = 'manager'", [manager_id], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        if (results.length === 0) return res.status(404).json({ message: "Manager not found" });

        // Assign manager to user
        db.query("UPDATE Users SET manager_id = ? WHERE id = ?", [manager_id, id], (err, result) => {
            if (err) return res.status(500).json({ message: "Error assigning manager", error: err });
            if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });

            res.status(200).json({ message: "Manager assigned successfully" });
        });
    });
};

// Update user status in bulk
exports.updateBulkStatus = (req, res) => {
  const { userIds, status } = req.body;
  console.log("🚀 Payload received:", { userIds, status });

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !status) {
    return res.status(400).json({ success: false, message: "Missing userIds or status" });
  }

  const validStatuses = ["active", "inactive", "suspended"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  const placeholders = userIds.map(() => '?').join(',');
  const checkQuery = `SELECT id FROM Users WHERE id IN (${placeholders})`;

  db.query(checkQuery, userIds, (checkErr, checkResults) => {
    if (checkErr) {
      console.error("❌ Error checking user existence:", checkErr);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    console.log("✅ Found users in DB:", checkResults.map(u => u.id));

    if (checkResults.length !== userIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more users not found",
        data: {
          providedIds: userIds,
          foundIds: checkResults.map(u => u.id)
        }
      });
    }

    const updateQuery = `UPDATE Users SET status = ?, updated_at = NOW() WHERE id IN (${placeholders})`;
    db.query(updateQuery, [status, ...userIds], (updateErr, updateResults) => {
      if (updateErr) {
        console.error("❌ Error updating statuses:", updateErr);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      console.log("✅ Update query results:", updateResults);

      return res.status(200).json({
        success: true,
        message: "Statuses updated successfully",
        data: {
          affectedRows: updateResults.affectedRows,
          changedRows: updateResults.changedRows,
          warningCount: updateResults.warningCount,
          userIds
        }
      });
    });
  });
};




// Update single user status
exports.updateUserStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({
            success: false,
            message: "Status is required"
        });
    }

    const validStatuses = ["active", "inactive", "suspended"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid status value"
        });
    }

    const query = "UPDATE Users SET status = ? WHERE id = ?";
    db.query(query, [status, id], (err, result) => {
        if (err) {
            console.error("Error updating user status:", err);
            return res.status(500).json({
                success: false,
                message: "Database error",
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "User status updated successfully"
        });
    });
};

// Get all managers
exports.getManagers = (req, res) => {
    const query = "SELECT id, name, email, phone_no FROM Users WHERE role = 'manager'";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching managers:", err);
            return res.status(500).json({
                success: false,
                message: "Database error",
                error: err.message
            });
        }
        res.json({
            success: true,
            data: results,
            message: "Managers fetched successfully"
        });
    });
};

// Get user statistics
exports.getUserStats = (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT 
            u.*,
            COUNT(DISTINCT l.id) as total_leads,
            COUNT(DISTINCT cu.campaign_id) as campaigns_handled,
            COALESCE(SUM(TIME_TO_SEC(TIMEDIFF(cl.end_time, cl.start_time))/3600), 0) as total_working_hours
        FROM Users u
        LEFT JOIN leads l ON u.id = l.assigned_to
        LEFT JOIN campaign_users cu ON u.id = cu.user_id
        LEFT JOIN call_logs cl ON u.id = cl.user_id
        WHERE u.id = ?
        GROUP BY u.id
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error("Error fetching user stats:", err);
            return res.status(500).json({
                success: false,
                message: "Database error",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const userStats = results[0];
        delete userStats.password; // Remove sensitive data

        res.json({
            success: true,
            data: userStats,
            message: "User statistics fetched successfully"
        });
    });
};

// Forgot password request
exports.forgotPassword = async (req, res) => {
    const { email, role } = req.body;

    if (!email || !role) {
        return res.status(400).json(responseFormatter(false, "Email and role are required"));
    }

    try {
        // Check if user exists with the given email and role
        const [users] = await db.query(
            "SELECT * FROM Users WHERE email = ? AND role = ?",
            [email, role]
        );

        if (users.length === 0) {
            return res.status(404).json(responseFormatter(false, "No user found with the provided email and role"));
        }

        const user = users[0];

        // Generate a password reset token
        const resetToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Store the reset token and its expiry in the database
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
        await db.query(
            "UPDATE Users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
            [resetToken, resetTokenExpiry, user.id]
        );

        // In a real application, you would send an email to the user with the reset link
        // For now, we'll just return a success message
        res.status(200).json(responseFormatter(true, "Password reset request sent to admin. Please contact your administrator for further instructions."));

    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json(responseFormatter(false, "Server error", error.message));
    }
};

// Get users without managers (unassigned users)
exports.getUnassignedUsers = (req, res) => {
    const query = `
        SELECT 
            u.id, u.name, u.email, u.phone_no, u.role, u.status, u.location, u.created_at,
            COALESCE((SELECT COUNT(*) FROM leads WHERE assigned_to = u.id), 0) as total_leads,
            COALESCE((SELECT COUNT(*) FROM campaign_users WHERE user_id = u.id), 0) as campaigns_handled
        FROM 
            users u 
        WHERE 
            u.manager_id IS NULL 
            AND u.role != 'manager'
            AND u.role != 'admin'
        ORDER BY 
            u.created_at DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching unassigned users:", err);
            return res.status(500).json(responseFormatter(false, "Database error", err.message));
        }

        if (!results || results.length === 0) {
            return res.json(responseFormatter(true, "No unassigned users found", []));
        }

        // Remove sensitive information
        const users = results.map(user => {
            const { password, token, reset_token, reset_token_expiry, ...safeUser } = user;
            return safeUser;
        });

        res.json(responseFormatter(true, "Unassigned users fetched successfully", users));
    });
};

module.exports = exports;
