const db = require("../config/db");
const responseFormatter = require("../utils/responseFormatter");

const campaignController = {
    // 📥 Create Campaign
    createCampaign: (req, res) => {
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
    },

    // 📤 Get All Campaigns
    getCampaigns: (req, res) => {
        db.query("SELECT * FROM campaigns", (err, campaigns) => {
            if (err) {
                console.error("Error fetching campaigns:", err);
                return res.status(500).json(responseFormatter(false, "Database error", err.message));
            }
            res.json(responseFormatter(true, "Campaigns fetched successfully", campaigns));
        });
    },

    // 🧾 Update Campaign
    updateCampaign: (req, res) => {
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
    },

    // ❌ Delete Campaign
    deleteCampaign: (req, res) => {
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
    },

    // 📊 Campaign Progress
    getCampaignProgress: (req, res) => {
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
    },

    // 📄 Get Campaign By ID (with assigned users and total leads)
    getCampaignById: (req, res) => {
        const { id } = req.params;
        console.log("Fetching campaign with ID:", id);

        // Get campaign details
        db.query("SELECT * FROM campaigns WHERE id = ?", [id], (err, campaignRows) => {
            if (err) {
                console.error("Error fetching campaign:", err);
                return res.status(500).json(responseFormatter(false, "Database error", err.message));
            }
            console.log("Campaign query results:", campaignRows);
            
            if (campaignRows.length === 0) {
                console.log("No campaign found with ID:", id);
                return res.status(404).json(responseFormatter(false, "Campaign not found"));
            }
            const campaign = campaignRows[0];
            console.log("Found campaign:", campaign);

            // Get assigned users
            const userQuery = `SELECT u.id, u.name, u.email, u.role 
                             FROM campaign_users cu 
                             JOIN users u ON cu.user_id = u.id 
                             WHERE cu.campaign_id = ?`;
            console.log("Executing user query:", userQuery, "with ID:", id);
            
            db.query(userQuery, [id], (err, userRows) => {
                if (err) {
                    console.error("Error fetching assigned users:", err);
                    return res.status(500).json(responseFormatter(false, "Database error", err.message));
                }

                console.log("Found assigned users:", userRows);

                // Get total leads
                const leadQuery = "SELECT COUNT(*) AS total_leads FROM leads WHERE campaign_id = ?";
                console.log("Executing lead query:", leadQuery, "with ID:", id);
                
                db.query(leadQuery, [id], (err, leadRows) => {
                    if (err) {
                        console.error("Error fetching leads:", err);
                        return res.status(500).json(responseFormatter(false, "Database error", err.message));
                    }

                    console.log("Found lead count:", leadRows[0]);
                    campaign.assigned_users = userRows;
                    campaign.total_leads = leadRows[0].total_leads;

                    console.log("Final campaign object being sent:", campaign);
                    res.json(responseFormatter(true, "Campaign fetched successfully", campaign));
                });
            });
        });
    },

    // 👥 Assign users to campaign
    assignUsersToCampaign: (req, res) => {
        const { id } = req.params;
        const { user_ids } = req.body;

        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return res.status(400).json(responseFormatter(false, "User IDs array is required"));
        }

        // First verify the campaign exists
        db.query("SELECT id FROM campaigns WHERE id = ?", [id], (err, results) => {
            if (err) {
                console.error("Error checking campaign:", err);
                return res.status(500).json(responseFormatter(false, "Database error", err.message));
            }

            if (results.length === 0) {
                return res.status(404).json(responseFormatter(false, "Campaign not found"));
            }

            // Insert new user assignments
            const values = user_ids.map(userId => [id, userId]);
            db.query(
                "INSERT INTO campaign_users (campaign_id, user_id) VALUES ?",
                [values],
                (err) => {
                    if (err) {
                        console.error("Error assigning users to campaign:", err);
                        return res.status(500).json(responseFormatter(false, "Failed to assign users", err.message));
                    }

                    // Log the assignment action
                    db.query(
                        "INSERT INTO campaign_logs (campaign_id, action, performed_by, created_at) VALUES (?, ?, ?, NOW())",
                        [id, "Users assigned to campaign", req.user.id]
                    );

                    res.json(responseFormatter(true, "Users assigned to campaign successfully"));
                }
            );
        });
    },

    // 🗑️ Remove users from campaign
    removeUsersFromCampaign: (req, res) => {
        const { id } = req.params;
        const { user_ids } = req.body;

        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return res.status(400).json(responseFormatter(false, "User IDs array is required"));
        }

        // First verify the campaign exists
        db.query("SELECT id FROM campaigns WHERE id = ?", [id], (err, results) => {
            if (err) {
                console.error("Error checking campaign:", err);
                return res.status(500).json(responseFormatter(false, "Database error", err.message));
            }

            if (results.length === 0) {
                return res.status(404).json(responseFormatter(false, "Campaign not found"));
            }

            // Remove user assignments
            db.query(
                "DELETE FROM campaign_users WHERE campaign_id = ? AND user_id IN (?)",
                [id, user_ids],
                (err) => {
                    if (err) {
                        console.error("Error removing users from campaign:", err);
                        return res.status(500).json(responseFormatter(false, "Failed to remove users", err.message));
                    }

                    // Log the removal action
                    db.query(
                        "INSERT INTO campaign_logs (campaign_id, action, performed_by, created_at) VALUES (?, ?, ?, NOW())",
                        [id, "Users removed from campaign", req.user.id]
                    );

                    res.json(responseFormatter(true, "Users removed from campaign successfully"));
                }
            );
        });
    },

    // Get campaigns for a caller
    getCallerCampaigns: (req, res) => {
        const { id } = req.params;

        const query = `
            SELECT 
                c.id, c.name, c.description, c.status, c.priority,
                c.start_date, c.end_date
            FROM 
                campaigns c
            INNER JOIN 
                campaign_users cu ON c.id = cu.campaign_id
            WHERE 
                cu.user_id = ?
            AND 
                c.status = 'Active'
            LIMIT 1
        `;

        db.query(query, [id], (err, results) => {
            if (err) {
                console.error("Error fetching campaign for caller:", err);
                return res.status(500).json(responseFormatter(false, "Database error", err.message));
            }

            const campaign = results[0] || {};
            res.json(responseFormatter(true, "Campaign fetched successfully", campaign));
        });
    },

    // Get campaigns for a user
    getCampaignsByUserId: (req, res) => {
        const { id } = req.params;

        const query = `
            SELECT 
                c.id, c.name, c.description, c.status, c.priority,
                c.start_date, c.end_date, c.lead_count,
                COUNT(DISTINCT l.id) as total_leads,
                ROUND((COUNT(CASE WHEN l.status = 'Converted' THEN 1 END) / COUNT(l.id)) * 100, 2) as conversion_rate
            FROM 
                campaigns c
            INNER JOIN 
                campaign_users cu ON c.id = cu.campaign_id
            LEFT JOIN
                leads l ON c.id = l.campaign_id
            WHERE 
                cu.user_id = ?
            GROUP BY
                c.id, c.name, c.description, c.status, c.priority, c.start_date, c.end_date, c.lead_count
        `;

        db.query(query, [id], (err, results) => {
            if (err) {
                console.error("Error fetching campaigns for user:", err);
                return res.status(500).json(responseFormatter(false, "Database error", err.message));
            }

            res.json(responseFormatter(true, "Campaigns fetched successfully", results));
        });
    }
};

module.exports = campaignController;
