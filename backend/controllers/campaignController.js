const db = require("../config/db");
const responseFormatter = require("../utils/responseFormatter");
const Activity = require("../models/Activity");  // Add Activity model import

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

        // Insert campaign using callback-based query
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
                    console.error("Error creating campaign:", err);
                    return res.status(500).json(responseFormatter(false, "Failed to create campaign", err.message));
                }

                const campaignId = campaignResult.insertId;

                // Insert assigned users (including the manager if they're creating the campaign)
                const usersToAssign = Array.isArray(assigned_users) ? [...assigned_users] : [];
                if (user.role === 'manager') {
                    usersToAssign.push(user.id);
                }
                
                // Insert users if any are assigned
                if (usersToAssign.length > 0) {
                    const values = usersToAssign.map(userId => [campaignId, userId]);
                    db.query(
                        "INSERT INTO campaign_users (campaign_id, user_id) VALUES ?",
                        [values],
                        (err) => {
                            if (err) {
                                console.error("Error assigning users:", err);
                                return res.status(500).json(responseFormatter(false, "Failed to assign users", err.message));
                            }

                            // Log user assignments
                            usersToAssign.forEach(userId => {
                                Activity.logActivity(
                                    user.id,
                                    user.role,
                                    'campaign_user_assign',
                                    `User ${userId} assigned to campaign ${name}`,
                                    'campaign',
                                    campaignId,
                                    null
                                );
                            });

                            // Insert leads if any
                            if (leads.length > 0) {
                                let completedLeads = 0;
                                leads.forEach(lead => {
                                    db.query(
                                        `INSERT INTO leads 
                                        (title, description, status, lead_category, name, phone_no, address, assigned_to, admin_id, campaign_id, notes, created_at, updated_at)
                                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                                        [
                                            lead.title, lead.description, lead.status, lead.lead_category, lead.name,
                                            lead.phone_no, lead.address, lead.assigned_to, admin_id, campaignId, lead.notes || null
                                        ],
                                        (err) => {
                                            if (err) {
                                                console.error("Error inserting lead:", err);
                                            }
                                            completedLeads++;
                                            
                                            // If all leads are processed
                                            if (completedLeads === leads.length) {
                                                // Log lead assignment to campaign
                                                Activity.logActivity(
                                                    user.id,
                                                    user.role,
                                                    'campaign_leads_add',
                                                    `Added ${leads.length} leads to campaign ${name}`,
                                                    'campaign',
                                                    campaignId,
                                                    null
                                                );

                                                // Log campaign creation activity
                                                Activity.logActivity(
                                                    user.id,
                                                    user.role,
                                                    'campaign_create',
                                                    `Created new campaign: ${name} (${status})`,
                                                    'campaign',
                                                    campaignId,
                                                    null
                                                );

                                                // Send final success response
                                                res.status(201).json(responseFormatter(true, "Campaign created successfully", { campaign_id: campaignId }));
                                            }
                                        }
                                    );
                                });
                            } else {
                                // If no leads to insert, log creation and send response
                                Activity.logActivity(
                                    user.id,
                                    user.role,
                                    'campaign_create',
                                    `Created new campaign: ${name} (${status})`,
                                    'campaign',
                                    campaignId,
                                    null
                                );
                                res.status(201).json(responseFormatter(true, "Campaign created successfully", { campaign_id: campaignId }));
                            }
                        }
                    );
                } else {
                    // If no users to assign, proceed with leads
                    if (leads.length > 0) {
                        let completedLeads = 0;
                        leads.forEach(lead => {
                            db.query(
                                `INSERT INTO leads 
                                (title, description, status, lead_category, name, phone_no, address, assigned_to, admin_id, campaign_id, notes, created_at, updated_at)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                                [
                                    lead.title, lead.description, lead.status, lead.lead_category, lead.name,
                                    lead.phone_no, lead.address, lead.assigned_to, admin_id, campaignId, lead.notes || null
                                ],
                                (err) => {
                                    if (err) {
                                        console.error("Error inserting lead:", err);
                                    }
                                    completedLeads++;
                                    
                                    if (completedLeads === leads.length) {
                                        Activity.logActivity(
                                            user.id,
                                            user.role,
                                            'campaign_leads_add',
                                            `Added ${leads.length} leads to campaign ${name}`,
                                            'campaign',
                                            campaignId,
                                            null
                                        );

                                        Activity.logActivity(
                                            user.id,
                                            user.role,
                                            'campaign_create',
                                            `Created new campaign: ${name} (${status})`,
                                            'campaign',
                                            campaignId,
                                            null
                                        );

                                        res.status(201).json(responseFormatter(true, "Campaign created successfully", { campaign_id: campaignId }));
                                    }
                                }
                            );
                        });
                    } else {
                        // No users and no leads
                        Activity.logActivity(
                            user.id,
                            user.role,
                            'campaign_create',
                            `Created new campaign: ${name} (${status})`,
                            'campaign',
                            campaignId,
                            null
                        );
                        res.status(201).json(responseFormatter(true, "Campaign created successfully", { campaign_id: campaignId }));
                    }
                }
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
    updateCampaign: async (req, res) => {
        const { id } = req.params; // <-- use id here
        const updates = req.body;
        const user = req.user;

        try {
            // Check if campaign exists
            const [campaign] = await db.promise().query('SELECT * FROM campaigns WHERE id = ?', [id]);
            if (!campaign[0]) {
                return res.status(404).json(responseFormatter(false, "Campaign not found"));
            }

            // Build update query dynamically from provided fields
            const allowedFields = ['name', 'description', 'status', 'priority', 'start_date', 'end_date'];
            const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));
            
            if (updateFields.length === 0) {
                return res.status(400).json(responseFormatter(false, "No valid fields to update"));
            }

            const query = `
                UPDATE campaigns 
                SET ${updateFields.map(field => `${field} = ?`).join(', ')}, 
                updated_at = NOW()
                WHERE id = ?
            `;

            const values = [...updateFields.map(field => updates[field]), id];
            await db.promise().query(query, values);

            // Log changes in activity
            const changes = updateFields.map(field => 
                `${field}: ${campaign[0][field]} → ${updates[field]}`
            ).join(', ');

            await Activity.logActivity(
                user.id,
                user.role,
                'campaign_update',
                `Updated campaign: ${changes}`,
                'campaign',
                id,
                null
            );

            res.json(responseFormatter(true, "Campaign updated successfully"));
        } catch (error) {
            console.error("Error updating campaign:", error);
            res.status(500).json(responseFormatter(false, "Failed to update campaign", error.message));
        }
    },    // ❌ Delete Campaign 
    deleteCampaign: async (req, res) => {
        const { id } = req.params;

        try {
            await db.promise().query("DELETE FROM campaign_users WHERE campaign_id = ?", [id]);
            
            const [result] = await db.promise().query("DELETE FROM campaigns WHERE id = ?", [id]);
            
            if (result.affectedRows === 0) {
                return res.status(404).json(responseFormatter(false, "Campaign not found"));
            }

            // Log campaign deletion activity
            await Activity.logActivity(
                req.user.id,
                req.user.role,
                'campaign_delete',
                `Deleted campaign #${id}`,
                'campaign',
                id,
                null
            );

            res.json(responseFormatter(true, "Campaign deleted successfully"));
        } catch (error) {
            console.error("Error deleting campaign:", error);
            res.status(500).json(responseFormatter(false, "Failed to delete campaign", error.message));
        }
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
    },    // 👥 Assign users to campaign
    assignUsersToCampaign: async (req, res) => {
        const { id } = req.params;
        const { user_ids } = req.body;

        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return res.status(400).json(responseFormatter(false, "User IDs array is required"));
        }

        try {
            // First verify the campaign exists
            const [campaigns] = await db.promise().query("SELECT id FROM campaigns WHERE id = ?", [id]);
            if (campaigns.length === 0) {
                return res.status(404).json(responseFormatter(false, "Campaign not found"));
            }

            // Remove all current assignments for this campaign
            await db.promise().query("DELETE FROM campaign_users WHERE campaign_id = ?", [id]);

            // Insert new user assignments
            const values = user_ids.map(userId => [id, userId]);
            if (values.length > 0) {
                await db.promise().query(
                    "INSERT INTO campaign_users (campaign_id, user_id) VALUES ?",
                    [values]
                );
            }

            // Log user assignment activity
            await Activity.logActivity(
                req.user.id,
                req.user.role,
                'campaign_user',
                `Assigned ${user_ids.length} users to campaign #${id}`,
                'campaign',
                id,
                null
            );

            res.json(responseFormatter(true, "Users assigned to campaign successfully"));
        } catch (error) {
            console.error("Error assigning users to campaign:", error);
            res.status(500).json(responseFormatter(false, "Failed to assign users", error.message));
        }
    },    // 🗑 Remove users from campaign
    removeUsersFromCampaign: async (req, res) => {
        const { id } = req.params;
        const { user_ids } = req.body;

        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return res.status(400).json(responseFormatter(false, "User IDs array is required"));
        }

        try {
            // First verify the campaign exists
            const [campaigns] = await db.promise().query("SELECT id FROM campaigns WHERE id = ?", [id]);

            if (campaigns.length === 0) {
                return res.status(404).json(responseFormatter(false, "Campaign not found"));
            }

            // Remove user assignments
            await db.promise().query(
                "DELETE FROM campaign_users WHERE campaign_id = ? AND user_id IN (?)",
                [id, user_ids]
            );

            // Log user removal activity
            await Activity.logActivity(
                req.user.id,
                req.user.role,
                'campaign_user',
                `Removed ${user_ids.length} users from campaign #${id}`,
                'campaign',
                id,
                null
            );

            res.json(responseFormatter(true, "Users removed from campaign successfully"));
        } catch (error) {
            console.error("Error removing users from campaign:", error);
            res.status(500).json(responseFormatter(false, "Failed to remove users", error.message));
        }
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

    // Get campaign performance metrics
    getCampaignPerformance: async (req, res) => {
        try {
            const managerId = req.params.managerId;
            const query = `
                SELECT 
                    c.id,
                    c.name,
                    c.status,
                    c.start_date,
                    c.end_date,
                    c.created_at,
                    COUNT(DISTINCT cu.user_id) as assigned_users_count,
                    COUNT(DISTINCT l.id) as total_leads,
                    COUNT(DISTINCT CASE WHEN l.status = 'Converted' THEN l.id END) as converted_leads,
                    COALESCE(
                        ROUND(
                            (COUNT(DISTINCT CASE WHEN l.status = 'Converted' THEN l.id END) * 100.0) / 
                            NULLIF(COUNT(DISTINCT l.id), 0)
                        , 2)
                    , 0) as conversion_rate,
                    (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', u.id,
                                'name', u.name,
                                'role', u.role
                            )
                        )
                        FROM campaign_users cu2 
                        JOIN users u ON cu2.user_id = u.id 
                        WHERE cu2.campaign_id = c.id
                    ) as assigned_users
                FROM campaigns c
                LEFT JOIN campaign_users cu ON c.id = cu.campaign_id
                LEFT JOIN leads l ON c.id = l.campaign_id
                WHERE c.manager_id = ?
                GROUP BY c.id
                ORDER BY c.created_at DESC`;

            const [campaigns] = await db.promise().query(query, [managerId]);

            // Process the results
            const processedCampaigns = campaigns.map(campaign => ({
                ...campaign,
                assigned_users: JSON.parse(campaign.assigned_users || '[]'),
                assigned_users_count: parseInt(campaign.assigned_users_count || 0),
                total_leads: parseInt(campaign.total_leads || 0),
                converted_leads: parseInt(campaign.converted_leads || 0),
                conversion_rate: parseFloat(campaign.conversion_rate || 0)
            }));

            res.json({
                success: true,
                data: processedCampaigns
            });
        } catch (error) {
            console.error('Error fetching campaign performance:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch campaign performance'
            });
        }
    },

    // Unassign user from campaign
    unassignUserFromCampaign: async (req, res) => {
        const { campaign_id, user_id } = req.body;

        try {
            // First check if user is assigned
            const [results] = await db.promise().query(
                'SELECT * FROM campaign_users WHERE campaign_id = ? AND user_id = ?',
                [campaign_id, user_id]
            );

            if (!results.length) {
                return res.status(404).json({
                    success: false,
                    message: 'User is not assigned to this campaign'
                });
            }

            // If user is assigned, remove them
            await db.promise().query(
                'DELETE FROM campaign_users WHERE campaign_id = ? AND user_id = ?',
                [campaign_id, user_id]
            );

            // Log unassignment activity
            await Activity.logActivity(
                req.user.id,
                req.user.role,
                'campaign_user',
                `Unassigned user #${user_id} from campaign #${campaign_id}`,
                'campaign',
                campaign_id,
                null
            );

            res.json({
                success: true,
                message: 'User unassigned successfully'
            });
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to unassign user',
                error: error.message
            });
        }
    }
};

module.exports = campaignController;