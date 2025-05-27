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

        const user = req.user;
        const admin_id = user.role === 'admin' ? user.id : null;
        const manager_id = user.role === 'manager' ? user.id : null;

        if (!name || !description || !status || !priority || !start_date) {
            return res.status(400).json(responseFormatter(false, "All required fields must be provided"));
        }

        const campaignQuery = `
            INSERT INTO campaigns 
            (name, description, status, lead_count, priority, start_date, end_date, created_at, updated_at, admin_id, manager_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)
        `;

        db.query(
            campaignQuery,
            [name, description, status, leads.length, priority, start_date, end_date || null, admin_id, manager_id],
            (err, campaignResult) => {
                if (err) {
                    console.error("Error inserting campaign:", err);
                    return res.status(500).json(responseFormatter(false, "Server error", err.message));
                }

                const campaignId = campaignResult.insertId;

                // Insert assigned users (including the manager if they're creating the campaign)
                const usersToAssign = Array.isArray(assigned_users) ? [...assigned_users] : [];
                if (user.role === 'manager') {
                    usersToAssign.push(user.id);
                }
                
                if (usersToAssign.length > 0) {
                    const values = usersToAssign.map(userId => [campaignId, userId]);
                    db.query(
                        "INSERT INTO campaign_users (campaign_id, user_id) VALUES ?",
                        [values],
                        (err) => {
                            if (err) {
                                console.error("Error assigning users:", err);
                            }
                        }
                    );
                }

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
                    [campaignId, "Campaign created", user.id]
                );

                res.status(201).json(responseFormatter(true, "Campaign created successfully", { campaign_id: campaignId }));
            }
        );
    },

    // 📤 Get All Campaigns (with assigned users and progress/statistics)
    getCampaigns: (req, res) => {
        db.query("SELECT * FROM campaigns", (err, campaigns) => {
            if (err) {
                console.error("Error fetching campaigns:", err);
                return res.status(500).json(responseFormatter(false, "Database error", err.message));
            }
            if (!campaigns.length) {
                return res.json(responseFormatter(true, "Campaigns fetched successfully", []));
            }

            const campaignIds = campaigns.map(c => c.id);

            // Fetch assigned users for all campaigns
            db.query(
                `SELECT cu.campaign_id, u.id, u.name, u.email, u.role
                 FROM campaign_users cu
                 JOIN users u ON cu.user_id = u.id
                 WHERE cu.campaign_id IN (?)`,
                [campaignIds],
                (err, userRows) => {
                    if (err) {
                        console.error("Error fetching assigned users:", err);
                        return res.status(500).json(responseFormatter(false, "Database error", err.message));
                    }

                    // Fetch lead stats for all campaigns
                    db.query(
                        `SELECT campaign_id, 
                                SUM(status='Cold') AS cold,
                                SUM(status='Warm') AS warm,
                                SUM(status='Hot') AS hot,
                                SUM(status='Converted') AS converted,
                                COUNT(*) AS total
                         FROM leads
                         WHERE campaign_id IN (?)
                         GROUP BY campaign_id`,
                        [campaignIds],
                        (err, leadStatsRows) => {
                            if (err) {
                                console.error("Error fetching leads:", err);
                                return res.status(500).json(responseFormatter(false, "Database error", err.message));
                            }

                            // Map users and stats to campaigns
                            const usersByCampaign = {};
                            userRows.forEach(u => {
                                if (!usersByCampaign[u.campaign_id]) usersByCampaign[u.campaign_id] = [];
                                usersByCampaign[u.campaign_id].push({
                                    id: u.id,
                                    name: u.name,
                                    email: u.email,
                                    role: u.role
                                });
                            });

                            const statsByCampaign = {};
                            leadStatsRows.forEach(row => {
                                statsByCampaign[row.campaign_id] = row;
                            });

                            // Attach all info to each campaign
                            const campaignsWithDetails = campaigns.map(c => {
                                const stats = statsByCampaign[c.id] || {};
                                const total = stats.total || 0;
                                const cold = stats.cold || 0;
                                const warm = stats.warm || 0;
                                const hot = stats.hot || 0;
                                const converted = stats.converted || 0;
                                return {
                                    ...c,
                                    assigned_users: usersByCampaign[c.id] || [],
                                    total_leads: total,
                                    conversion_rate: total ? ((converted / total) * 100).toFixed(2) : "0.00",
                                    coldLeadsPercentage: total ? ((cold / total) * 100).toFixed(2) : "0.00",
                                    warmLeadsPercentage: total ? ((warm / total) * 100).toFixed(2) : "0.00",
                                    hotLeadsPercentage: total ? ((hot / total) * 100).toFixed(2) : "0.00"
                                };
                            });

                            res.json(responseFormatter(true, "Campaigns fetched successfully", campaignsWithDetails));
                        }
                    );
                }
            );
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

            db.query("DELETE FROM campaigns WHERE id = ?", [id], (err, result) => {
                if (err) return res.status(500).json(responseFormatter(false, "Failed to delete campaign"));

                if (result.affectedRows === 0) {
                    return res.status(404).json(responseFormatter(false, "Campaign not found"));
                }

                res.json(responseFormatter(true, "Campaign deleted successfully"));
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

                // Get total leads and lead stats
                const leadQuery = `
                    SELECT 
                        COUNT(*) AS total_leads,
                        SUM(status='Cold') AS cold,
                        SUM(status='Warm') AS warm,
                        SUM(status='Hot') AS hot,
                        SUM(status='Converted') AS converted
                    FROM leads WHERE campaign_id = ?
                `;
                console.log("Executing lead query:", leadQuery, "with ID:", id);
                
                db.query(leadQuery, [id], (err, leadRows) => {
                    if (err) {
                        console.error("Error fetching leads:", err);
                        return res.status(500).json(responseFormatter(false, "Database error", err.message));
                    }

                    const stats = leadRows[0] || {};
                    const total = stats.total_leads || 0;
                    const cold = stats.cold || 0;
                    const warm = stats.warm || 0;
                    const hot = stats.hot || 0;
                    const converted = stats.converted || 0;

                    campaign.assigned_users = userRows;
                    campaign.total_leads = total;
                    campaign.conversion_rate = total ? ((converted / total) * 100).toFixed(2) : "0.00";
                    campaign.coldLeadsPercentage = total ? ((cold / total) * 100).toFixed(2) : "0.00";
                    campaign.warmLeadsPercentage = total ? ((warm / total) * 100).toFixed(2) : "0.00";
                    campaign.hotLeadsPercentage = total ? ((hot / total) * 100).toFixed(2) : "0.00";

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

    // 🗑 Remove users from campaign
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
        console.log("Fetching campaigns for user ID:", id);

        const query = `
            SELECT 
                c.id, c.name, c.description, c.status, c.priority,
                c.start_date, c.end_date, c.lead_count,
                COUNT(DISTINCT l.id) as total_leads,
                ROUND((COUNT(CASE WHEN l.status = 'Converted' THEN 1 END) / NULLIF(COUNT(l.id), 0)) * 100, 2) as conversion_rate,
                GROUP_CONCAT(DISTINCT u.id) as assigned_user_ids,
                GROUP_CONCAT(DISTINCT u.name) as assigned_user_names
            FROM 
                campaigns c
            INNER JOIN 
                campaign_users cu ON c.id = cu.campaign_id
            LEFT JOIN
                leads l ON c.id = l.campaign_id
            LEFT JOIN
                campaign_users cu2 ON c.id = cu2.campaign_id
            LEFT JOIN
                users u ON cu2.user_id = u.id
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

            // Process the results to format assigned users
            const processedResults = results.map(campaign => ({
                ...campaign,
                assigned_users: campaign.assigned_user_ids ? 
                    campaign.assigned_user_ids.split(',').map((id, index) => ({
                        id: parseInt(id),
                        name: campaign.assigned_user_names.split(',')[index]
                    })) : []
            }));

            console.log("Processed campaign results:", processedResults);
            res.json(responseFormatter(true, "Campaigns fetched successfully", processedResults));
        });
    },    // Get campaigns by manager ID
    getCampaignsByManagerId: (req, res) => {
        const managerId = req.params.id;
        
        // Query to get both created and assigned campaigns
        const query = `
            SELECT c.*, 
                   COUNT(DISTINCT l.id) as lead_count,
                   GROUP_CONCAT(DISTINCT u.id) as assigned_user_ids,
                   GROUP_CONCAT(DISTINCT u.name) as assigned_user_names
            FROM campaigns c
            LEFT JOIN leads l ON c.id = l.campaign_id
            LEFT JOIN campaign_users cu ON c.id = cu.campaign_id
            LEFT JOIN users u ON cu.user_id = u.id
            WHERE c.manager_id = ? OR c.id IN (
                SELECT campaign_id 
                FROM campaign_users 
                WHERE user_id = ?
            )
            GROUP BY c.id
        `;

        db.query(query, [managerId, managerId], (err, results) => {
            if (err) {
                console.error("Error fetching manager's campaigns:", err);
                return res.status(500).json(responseFormatter(false, "Database error", err.message));
            }

            // Process the results to format assigned users
            const processedResults = results.map(campaign => ({
                ...campaign,
                assigned_users: campaign.assigned_user_ids ? 
                    campaign.assigned_user_ids.split(',').map((id, index) => ({
                        id: parseInt(id),
                        name: campaign.assigned_user_names.split(',')[index]
                    })) : []
            }));

            res.json(responseFormatter(true, "Campaigns fetched successfully", processedResults));
        });
    },

    // Get active campaigns count
    getActiveCampaignsCount: (req, res) => {
        db.query(
            "SELECT COUNT(*) AS activeCount FROM campaigns WHERE status = 'active'",
            (err, result) => {
                if (err) {
                    return res.status(500).json({ success: false, message: "Database error", error: err.message });
                }
                res.json({ success: true, data: result[0].activeCount });
            }
        );
    },
};

module.exports = campaignController;