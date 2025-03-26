const db = require("../config/db");
const responseFormatter = require("../utils/responseFormatter");

// 📌 Create a new lead
exports.createLead = async (req, res) => {
    try {
        const { title, description, status, lead_category, name, phone_no, address, assigned_to, admin_id, campaign_id } = req.body;

        if (!title || !status || !name || !phone_no || !assigned_to || !admin_id) {
            return res.status(400).json(responseFormatter(false, "Title, status, name, phone number, assigned_to, and admin_id are required"));
        }

        // ✅ Check if assigned_to exists in Users table
        const [users] = await db.query("SELECT id FROM Users WHERE id = ?", [assigned_to]);
        if (users.length === 0) {
            return res.status(400).json(responseFormatter(false, "Invalid assigned_to value"));
        }

        // ✅ Insert the new lead
        const [insertResult] = await db.query(
            "INSERT INTO Leads (title, description, status, lead_category, name, phone_no, address, assigned_to, admin_id, campaign_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [title, description, status, lead_category, name, phone_no, address, assigned_to, admin_id, campaign_id]
        );

        // ✅ Fetch the newly created lead
        const [newLead] = await db.query("SELECT * FROM Leads WHERE id = ?", [insertResult.insertId]);

        res.status(201).json(responseFormatter(true, "Lead created successfully", newLead[0]));
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json(responseFormatter(false, "Database error", err.message));
    }
};

// 📌 Get all leads
exports.getLeads = async (req, res) => {
    try {
        const [leads] = await db.query("SELECT * FROM Leads");
        res.json(responseFormatter(true, "Leads fetched successfully", leads));
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json(responseFormatter(false, "Database error", err.message));
    }
};

// 📌 Get a single lead by ID
exports.getLeadById = async (req, res) => {
    try {
        const { id } = req.params;
        const [lead] = await db.query("SELECT * FROM Leads WHERE id = ?", [id]);

        if (lead.length === 0) {
            return res.status(404).json(responseFormatter(false, "Lead not found"));
        }

        res.json(responseFormatter(true, "Lead fetched successfully", lead[0]));
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json(responseFormatter(false, "Database error", err.message));
    }
};

// 📌 Update lead
exports.updateLead = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, lead_category, name, phone_no, address, assigned_to, admin_id, campaign_id } = req.body;

        if (!title || !status || !name || !phone_no || !assigned_to || !admin_id) {
            return res.status(400).json(responseFormatter(false, "Title, status, name, phone number, assigned_to, and admin_id are required"));
        }

        // ✅ Check if assigned_to exists
        const [users] = await db.query("SELECT id FROM Users WHERE id = ?", [assigned_to]);
        if (users.length === 0) {
            return res.status(400).json(responseFormatter(false, "Invalid assigned_to value"));
        }

        // ✅ Check if lead exists
        const [leadExists] = await db.query("SELECT id FROM Leads WHERE id = ?", [id]);
        if (leadExists.length === 0) {
            return res.status(404).json(responseFormatter(false, "Lead not found"));
        }

        // ✅ Update the lead
        await db.query(
            "UPDATE Leads SET title = ?, description = ?, status = ?, lead_category = ?, name = ?, phone_no = ?, address = ?, assigned_to = ?, admin_id = ?, campaign_id = ? WHERE id = ?",
            [title, description, status, lead_category, name, phone_no, address, assigned_to, admin_id, campaign_id, id]
        );

        res.json(responseFormatter(true, "Lead updated successfully"));
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json(responseFormatter(false, "Database error", err.message));
    }
};

// 📌 Delete lead
exports.deleteLead = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Check if lead exists
        const [leadExists] = await db.query("SELECT id FROM Leads WHERE id = ?", [id]);
        if (leadExists.length === 0) {
            return res.status(404).json(responseFormatter(false, "Lead not found"));
        }

        // ✅ Delete lead
        await db.query("DELETE FROM Leads WHERE id = ?", [id]);

        res.json(responseFormatter(true, "Lead deleted successfully"));
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json(responseFormatter(false, "Database error", err.message));
    }
};
