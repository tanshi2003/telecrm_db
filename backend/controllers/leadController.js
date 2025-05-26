const db = require("../config/db");
const responseFormatter = require("../utils/responseFormatter");

const VALID_LEAD_CATEGORIES = [
    "Fresh Lead", "Bulk Lead", "Cold Lead", "Warm Lead", "Hot Lead",
    "Converted Lead", "Lost Lead", "Walk-in Lead", "Re-Targeted Lead", "Campaign Lead"
];

const VALID_STATUSES = [
    "New", "Contacted", "Follow-Up Scheduled", "Interested", "Not Interested",
    "Call Back Later", "Under Review", "Converted", "Lost", "Not Reachable", "On Hold"
];

// 📌 Create a new lead
exports.createLead = (req, res) => {
    const {
        title, description, status, lead_category,
        name, phone_no, address = "", assigned_to = null,
        admin_id, campaign_id = null, notes = "", manager_id = null
    } = req.body;

    if (!title || !status || !name || !phone_no || !admin_id) {
        return res.status(400).json(responseFormatter(false, "Missing required fields"));
    }

    if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json(responseFormatter(false, `Invalid status: ${status}`));
    }

    if (lead_category && !VALID_LEAD_CATEGORIES.includes(lead_category)) {
        return res.status(400).json(responseFormatter(false, `Invalid lead category: ${lead_category}`));
    }

    // Check if manager exists if manager_id is provided
    if (manager_id) {
        db.query("SELECT id, role FROM Users WHERE id = ?", [manager_id], (err, result) => {
            if (err) {
                console.error("Manager check error:", err);
                return res.status(500).json(responseFormatter(false, "Database error", err.message));
            }

            if (result.length === 0) {
                return res.status(400).json(responseFormatter(false, "Manager does not exist"));
            }

            if (result[0].role !== 'manager') {
                return res.status(400).json(responseFormatter(false, "User is not a manager"));
            }

            // If assigned_to is provided, check if user exists and belongs to this manager
            if (assigned_to) {
                db.query(
                    "SELECT id FROM Users WHERE id = ? AND manager_id = ?",
                    [assigned_to, manager_id],
                    (err, userResult) => {
                        if (err) {
                            console.error("User check error:", err);
                            return res.status(500).json(responseFormatter(false, "Database error", err.message));
                        }

                        if (userResult.length === 0) {
                            return res.status(400).json(responseFormatter(false, "Assigned user does not exist or does not belong to this manager"));
                        }

                        insertLead();
                    }
                );
            } else {
                insertLead();
            }
        });
    } else {
        // If no manager_id, just check assigned_to if provided
        if (assigned_to) {
            db.query("SELECT id FROM Users WHERE id = ?", [assigned_to], (err, result) => {
                if (err) {
                    console.error("User check error:", err);
                    return res.status(500).json(responseFormatter(false, "Database error", err.message));
                }

                if (result.length === 0) {
                    return res.status(400).json(responseFormatter(false, "Assigned user does not exist"));
                }

                insertLead();
            });
        } else {
            insertLead();
        }
    }

    function insertLead() {
        const created_at = new Date();
        const updated_at = new Date();

        db.query(
            `INSERT INTO Leads 
            (title, description, status, lead_category, name, phone_no, address, assigned_to, admin_id, campaign_id, notes, manager_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, status, lead_category, name, phone_no, address, assigned_to, admin_id, campaign_id, notes, manager_id, created_at, updated_at],
            (err, insertResult) => {
                if (err) {
                    console.error("Insert lead error:", err);
                    return res.status(500).json(responseFormatter(false, "Database error", err.message));
                }

                db.query("SELECT * FROM Leads WHERE id = ?", [insertResult.insertId], (err, lead) => {
                    if (err) {
                        return res.status(500).json(responseFormatter(false, "Fetch new lead failed", err.message));
                    }

                    res.status(201).json(responseFormatter(true, "Lead created successfully", lead[0]));
                });
            }
        );
    }
};

// 📌 Get all leads
exports.getLeads = (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Base query
    let query = `SELECT Leads.*, Users.name AS assigned_to_name 
                 FROM Leads 
                 LEFT JOIN Users ON Leads.assigned_to = Users.id`;
    
    // If user is a caller, show both unassigned leads and their assigned leads
    if (userRole.toLowerCase() === 'caller') {
        query += ` WHERE (Leads.assigned_to = ? OR Leads.assigned_to IS NULL)`;
    }

    db.query(
        query,
        userRole.toLowerCase() === 'caller' ? [userId] : [],
        (err, leads) => {
            if (err) {
                console.error("Fetch leads error:", err);
                return res.status(500).json(responseFormatter(false, "Server error", err.message));
            }
            res.json(responseFormatter(true, "Leads fetched successfully", leads));
        }
    );
};

// 📌 Get a lead by ID
exports.getLeadById = (req, res) => {
    const { id } = req.params;

    db.query(
        `SELECT Leads.*, Users.name AS assigned_to_name 
         FROM Leads 
         LEFT JOIN Users ON Leads.assigned_to = Users.id 
         WHERE Leads.id = ?`,
        [id],
        (err, lead) => {
            if (err) {
                return res.status(500).json(responseFormatter(false, "Server error", err.message));
            }

            if (lead.length === 0) {
                return res.status(404).json(responseFormatter(false, "Lead not found"));
            }

            res.json(responseFormatter(true, "Lead retrieved", lead[0]));
        }
    );
};

// 📌 Update a lead's status and notes
exports.updateLead = (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status && !notes) {
        return res.status(400).json(responseFormatter(false, "Status or notes required"));
    }

    const fields = [];
    const values = [];
    if (status) {
        fields.push("status = ?");
        values.push(status);
    }
    if (notes !== undefined) {
        fields.push("notes = ?");
        values.push(notes);
    }
    values.push(id);

    const query = `UPDATE leads SET ${fields.join(", ")} WHERE id = ?`;
    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Error updating lead:", err);
            return res.status(500).json(responseFormatter(false, "Database error", err.message));
        }
        if (result.affectedRows === 0) {
            return res.status(404).json(responseFormatter(false, "Lead not found"));
        }
        res.json(responseFormatter(true, "Lead updated successfully"));
    });
};

// 📌 Delete a lead
exports.deleteLead = (req, res) => {
    const { id } = req.params;

    db.query("SELECT id FROM Leads WHERE id = ?", [id], (err, result) => {
        if (err) {
            return res.status(500).json(responseFormatter(false, "Server error", err.message));
        }

        if (result.length === 0) {
            return res.status(404).json(responseFormatter(false, "Lead not found"));
        }

        db.query("DELETE FROM Leads WHERE id = ?", [id], (err, delResult) => {
            if (err) {
                return res.status(500).json(responseFormatter(false, "Server error", err.message));
            }

            res.json(responseFormatter(true, "Lead deleted successfully"));
        });
    });
};

// 📌 Get lead counts for users
exports.getUserLeadCounts = (req, res) => {
    const userId = req.params.userId;

    const query = `
        SELECT 
            COUNT(*) as total_leads,
            SUM(CASE WHEN status IN ('New', 'Contacted', 'Follow-Up Scheduled', 'Interested', 'Under Review', 'On Hold') THEN 1 ELSE 0 END) as active_leads,
            SUM(CASE WHEN status = 'Converted' THEN 1 ELSE 0 END) as converted_leads
        FROM Leads 
        WHERE assigned_to = ?
    `;

    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error("Error fetching lead counts:", err);
            return res.status(500).json({
                success: false,
                message: "Error fetching lead counts",
                error: err.message
            });
        }

        res.json({
            success: true,
            data: result[0] || { total_leads: 0, active_leads: 0, converted_leads: 0 }
        });
    });
};

// Add lead for all users (manager, caller, field_employee, user)
exports.addLeadForAllUsers = (req, res) => {
    const { name, phone_no, lead_category = "Cold Lead", status = "New", address = "", notes = "" } = req.body;
    const assigned_to = req.user.id;
    const created_by = req.user.id;
    const created_at = new Date();
    const updated_at = new Date();

    if (!name || !phone_no) {
        return res.status(400).json(responseFormatter(false, "Name and phone number are required"));
    }

    db.query(
        `INSERT INTO Leads (name, phone_no, lead_category, status, address, notes, assigned_to, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, phone_no, lead_category, status, address, notes, assigned_to, created_by, created_at, updated_at],
        (err, result) => {
            if (err) {
                console.error("Add lead error:", err);
                return res.status(500).json(responseFormatter(false, "Database error", err.message));
            }
            db.query("SELECT * FROM Leads WHERE id = ?", [result.insertId], (err, lead) => {
                if (err) {
                    return res.status(500).json(responseFormatter(false, "Fetch new lead failed", err.message));
                }
                res.status(201).json(responseFormatter(true, "Lead added successfully", lead[0]));
            });
        }
    );
};
