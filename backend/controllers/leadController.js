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
        name, phone_no, address = "", assigned_to,
        admin_id, campaign_id = null, notes = ""
    } = req.body;

    if (!title || !status || !name || !phone_no || !assigned_to || !admin_id) {
        return res.status(400).json(responseFormatter(false, "Missing required fields"));
    }

    if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json(responseFormatter(false, `Invalid status: ${status}`));
    }

    if (lead_category && !VALID_LEAD_CATEGORIES.includes(lead_category)) {
        return res.status(400).json(responseFormatter(false, `Invalid lead category: ${lead_category}`));
    }

    db.query("SELECT id FROM Users WHERE id = ?", [assigned_to], (err, result) => {
        if (err) {
            console.error("User check error:", err);
            return res.status(500).json(responseFormatter(false, "Database error", err.message));
        }

        if (result.length === 0) {
            return res.status(400).json(responseFormatter(false, "Assigned user does not exist"));
        }

        const created_at = new Date();
        const updated_at = new Date();

        db.query(
            `INSERT INTO Leads 
            (title, description, status, lead_category, name, phone_no, address, assigned_to, admin_id, campaign_id, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, status, lead_category, name, phone_no, address, assigned_to, admin_id, campaign_id, notes, created_at, updated_at],
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
    });
};

// 📌 Get all leads
exports.getLeads = (req, res) => {
    db.query("SELECT * FROM Leads", (err, leads) => {
        if (err) {
            console.error("Fetch leads error:", err);
            return res.status(500).json(responseFormatter(false, "Server error", err.message));
        }
        res.json(responseFormatter(true, "Leads fetched successfully", leads));
    });
};

// 📌 Get a lead by ID
exports.getLeadById = (req, res) => {
    const { id } = req.params;

    db.query("SELECT * FROM Leads WHERE id = ?", [id], (err, lead) => {
        if (err) {
            return res.status(500).json(responseFormatter(false, "Server error", err.message));
        }

        if (lead.length === 0) {
            return res.status(404).json(responseFormatter(false, "Lead not found"));
        }

        res.json(responseFormatter(true, "Lead retrieved", lead[0]));
    });
};

// 📌 Update a lead
exports.updateLead = (req, res) => {
    const { id } = req.params;
    const {
        title, description, status, lead_category,
        name, phone_no, address, assigned_to,
        admin_id, campaign_id = null, notes = ""
    } = req.body;

    if (!title || !status || !name || !phone_no || !assigned_to || !admin_id) {
        return res.status(400).json(responseFormatter(false, "Missing required fields"));
    }

    if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json(responseFormatter(false, `Invalid status: ${status}`));
    }

    if (lead_category && !VALID_LEAD_CATEGORIES.includes(lead_category)) {
        return res.status(400).json(responseFormatter(false, `Invalid lead category: ${lead_category}`));
    }

    const updated_at = new Date();

    db.query(
        `UPDATE Leads SET 
            title = ?, description = ?, status = ?, lead_category = ?, 
            name = ?, phone_no = ?, address = ?, assigned_to = ?, 
            admin_id = ?, campaign_id = ?, notes = ?, updated_at = ?
         WHERE id = ?`,
        [title, description, status, lead_category, name, phone_no, address, assigned_to, admin_id, campaign_id, notes, updated_at, id],
        (err, result) => {
            if (err) {
                console.error("Update lead error:", err);
                return res.status(500).json(responseFormatter(false, "Server error", err.message));
            }

            res.json(responseFormatter(true, "Lead updated successfully"));
        }
    );
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
