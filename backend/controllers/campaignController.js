const db = require("../config/db");
const responseFormatter = require("../utils/responseFormatter");

// 📥 Create Campaign
exports.createCampaign = (req, res) => {
    const {
        name, description, status, priority,
        assigned_users = [], start_date, end_date,
        leads = []
    } = req.body;

    const admin_id = req.user.id;

    if (!name || !description || !status || !priority || !start_date) {
        return res.status(400).json(responseFormatter(false, "All required fields must be provided"));
    }

    const campaignQuery = `
        INSERT INTO campaigns 
        (name, description, status, lead_count, priority, start_date, end_date, created_at, updated_at, admin_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)
    `;

    db.query(
        campaignQuery,
        [name, description, status, leads.length, priority, start_date, end_date || null, admin_id],
        (err, campaignResult) => {
            if (err) {
                console.error("Error inserting campaign:", err);
                return res.status(500).json(responseFormatter(false, "Server error", err.message));
            }

            const campaignId = campaignResult.insertId;

            // Insert assigned users
            assigned_users.forEach((userId) => {
                db.query("INSERT INTO campaign_users (campaign_id, user_id) VALUES (?, ?)", [campaignId, userId]);
            });

            // Insert leads
            leads.forEach((lead) => {
                db.query(
                    `INSERT INTO leads 
                    (title, description, status, lead_category, name, phone_no, address, assigned_to, admin_id, campaign_id, notes, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                    [
                        lead.title, lead.description, lead.status, lead.lead_category, lead.name,
                        lead.phone_no, lead.address, lead.assigned_to, admin_id, campaignId, lead.notes || null
                    ]
                );
            });

            // Log campaign creation
            db.query(
                "INSERT INTO campaign_logs (campaign_id, action, performed_by, created_at) VALUES (?, ?, ?, NOW())",
                [campaignId, "Campaign created", admin_id]
            );

            res.status(201).json(responseFormatter(true, "Campaign created successfully", { campaign_id: campaignId }));
        }
    );
};

// 📤 Get All Campaigns
exports.getCampaigns = (req, res) => {
    db.query("SELECT * FROM campaigns", (err, campaigns) => {
        if (err) {
            console.error("Error fetching campaigns:", err);
            return res.status(500).json(responseFormatter(false, "Database error", err.message));
        }
        res.json(responseFormatter(true, "Campaigns fetched successfully", campaigns));
    });
};

// 🧾 Update Campaign
exports.updateCampaign = (req, res) => {
    const { id } = req.params;
    const {
        name, description, status, priority,
        start_date, end_date, assigned_users = []
    } = req.body;

    db.query(
        `UPDATE campaigns 
         SET name = ?, description = ?, status = ?, priority = ?, start_date = ?, end_date = ?, updated_at = NOW() 
         WHERE id = ?`,
        [name, description, status, priority, start_date, end_date, id],
        (err, updateResult) => {
            if (err) {
                console.error("Error updating campaign:", err);
                return res.status(500).json(responseFormatter(false, "Database error", err.message));
            }

            if (updateResult.affectedRows === 0) {
                return res.status(404).json(responseFormatter(false, "Campaign not found"));
            }

            // Delete previous assigned users
            db.query("DELETE FROM campaign_users WHERE campaign_id = ?", [id], (err) => {
                if (err) {
                    console.error("Error deleting campaign users:", err);
                    return res.status(500).json(responseFormatter(false, "Failed to remove old users"));
                }

                // Insert new assigned users
                const values = assigned_users.map(uid => [id, uid]);
                if (values.length > 0) {
                    db.query("INSERT INTO campaign_users (campaign_id, user_id) VALUES ?", [values], (err) => {
                        if (err) {
                            console.error("Error inserting new campaign users:", err);
                            return res.status(500).json(responseFormatter(false, "Failed to add new users"));
                        }

                        db.query(
                            "INSERT INTO campaign_logs (campaign_id, action, performed_by, created_at) VALUES (?, ?, ?, NOW())",
                            [id, "Campaign updated", req.user.id],
                            () => {
                                res.json(responseFormatter(true, "Campaign updated successfully"));
                            }
                        );
                    });
                } else {
                    res.json(responseFormatter(true, "Campaign updated (no users assigned)"));
                }
            });
        }
    );
};

// ❌ Delete Campaign
exports.deleteCampaign = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM campaign_users WHERE campaign_id = ?", [id], (err) => {
        if (err) return res.status(500).json(responseFormatter(false, "Failed to delete campaign users"));

        db.query("DELETE FROM campaign_logs WHERE campaign_id = ?", [id], (err) => {
            if (err) return res.status(500).json(responseFormatter(false, "Failed to delete campaign logs"));

            db.query("DELETE FROM campaigns WHERE id = ?", [id], (err, result) => {
                if (err) return res.status(500).json(responseFormatter(false, "Failed to delete campaign"));

                if (result.affectedRows === 0) {
                    return res.status(404).json(responseFormatter(false, "Campaign not found"));
                }

                db.query(
                    "INSERT INTO campaign_logs (campaign_id, action, performed_by, created_at) VALUES (?, ?, ?, NOW())",
                    [id, "Campaign deleted", req.user.id],
                    () => {
                        res.json(responseFormatter(true, "Campaign deleted successfully"));
                    }
                );
            });
        });
    });
};

// 📊 Campaign Progress
exports.getCampaignProgress = (req, res) => {
    const { id } = req.params;

    db.query("SELECT status FROM leads WHERE campaign_id = ?", [id], (err, leads) => {
        if (err) {
            console.error("Error fetching progress:", err);
            return res.status(500).json(responseFormatter(false, "Database error", err.message));
        }

        if (leads.length === 0) {
            return res.json(responseFormatter(true, "No leads for this campaign", { progress: 0 }));
        }

        const totalLeads = leads.length;
        const converted = leads.filter(l => l.status === "Converted").length;
        const progress = ((converted / totalLeads) * 100).toFixed(2);

        res.json(responseFormatter(true, "Campaign progress", { totalLeads, converted, progress }));
    });
};
