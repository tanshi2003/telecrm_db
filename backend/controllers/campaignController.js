const db = require("../config/db");
const responseFormatter = require("../utils/responseFormatter");

// Get all campaigns
exports.getCampaigns = (req, res) => {
    db.query("SELECT * FROM Campaigns", (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json(responseFormatter(false, "Database error"));
        }
        res.json(responseFormatter(true, "Campaigns fetched successfully", results));
    });
};

// Create a new campaign
exports.createCampaign = (req, res) => {
    const { name, description, status, admin_id, assigned_to } = req.body;

    if (!name || !description || !admin_id || !assigned_to) {
        return res.status(400).json(responseFormatter(false, "All fields are required"));
    }

    db.query(
        "INSERT INTO Campaigns (name, description, status, lead_count, created_at, updated_at, admin_id, assigned_to) VALUES (?, ?, ?, 0, NOW(), NOW(), ?, ?)",
        [name, description, status, admin_id, assigned_to],
        (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json(responseFormatter(false, "Database error"));
            }
            res.status(201).json(responseFormatter(true, "Campaign created successfully"));
        }
    );
};

// Update a campaign
exports.updateCampaign = (req, res) => {
    const { id } = req.params;
    const { name, description, status, admin_id, assigned_to } = req.body;

    db.query(
        "UPDATE Campaigns SET name = ?, description = ?, status = ?, admin_id = ?, assigned_to = ?, updated_at = NOW() WHERE id = ?",
        [name, description, status, admin_id, assigned_to, id],
        (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json(responseFormatter(false, "Database error"));
            }
            res.json(responseFormatter(true, "Campaign updated successfully"));
        }
    );
};

// Delete a campaign
exports.deleteCampaign = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM Campaigns WHERE id = ?", [id], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json(responseFormatter(false, "Database error"));
        }
        res.json(responseFormatter(true, "Campaign deleted successfully"));
    });
};
