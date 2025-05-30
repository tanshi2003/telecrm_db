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
    } = req.body;    if (!title || !status || !name || !phone_no) {
        return res.status(400).json(responseFormatter(false, "Missing required fields: title, status, name, and phone number are required"));
    }
    
    // For manager role, admin_id is not required
    if (!admin_id && !manager_id) {
        return res.status(400).json(responseFormatter(false, "Either admin_id or manager_id is required"));
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
exports.getLeads = async (req, res) => {
  try {
    const { selectedUser, role } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    let query = `
      WITH UserLeads AS (
        SELECT 
          l.*,
          u.name as assigned_to_name,
          CASE 
            WHEN l.created_by = ? THEN 'self-created'
            WHEN l.assigned_to = ? THEN 'assigned'
            ELSE 'other'
          END as lead_source
        FROM leads l
        LEFT JOIN users u ON l.assigned_to = u.id
        WHERE 
          CASE
            WHEN ? = 'all' THEN TRUE
            ELSE (
              l.assigned_to = ? OR
              l.created_by = ? OR
              (? = 'admin') OR
              (? = 'manager' AND (l.manager_id = ? OR l.assigned_to IN (SELECT id FROM Users WHERE manager_id = ?)))
            )
          END
      )
      SELECT 
        status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage,
        MAX(assigned_to_name) as assigned_to_name,
        assigned_to,
        created_by,
        GROUP_CONCAT(DISTINCT lead_source) as sources
      FROM UserLeads
      GROUP BY status, assigned_to, created_by
      ORDER BY count DESC`;

    const queryParams = [
      userId, userId, // For lead source CASE
      selectedUser,  // For WHERE CASE
      selectedUser !== 'all' ? selectedUser : userId, // assigned_to check
      userId, // created_by check
      userRole, // admin check
      userRole, // manager check
      userId,   // manager_id
      userId    // manager's team
    ];

    const [leads] = await db.promise().query(query, queryParams);
    
    // Process the results into a structured format
    const response = {
      success: true,
      message: "Leads fetched successfully",
      data: {
        statusDistribution: leads.reduce((acc, row) => {
          const userId = row.assigned_to || 'unassigned';
          if (!acc[userId]) {
            acc[userId] = {
              assigned_to: row.assigned_to,
              assigned_to_name: row.assigned_to_name,
              statuses: []
            };
          }
          acc[userId].statuses.push({
            status: row.status,
            count: row.count,
            percentage: row.percentage,
            sources: row.sources?.split(',') || []
          });
          return acc;
        }, {})
      }
    };

    // If looking at all users, include overall distribution
    if (!selectedUser || selectedUser === 'all') {
      response.data.overallDistribution = Object.values(leads.reduce((acc, row) => {
        if (!acc[row.status]) {
          acc[row.status] = {
            status: row.status,
            count: 0,
            percentage: 0
          };
        }
        acc[row.status].count += row.count;
        // Recalculate overall percentage
        const total = leads.reduce((sum, r) => sum + r.count, 0);
        acc[row.status].percentage = Number(((row.count / total) * 100).toFixed(2));
        return acc;
      }, {}));
    }

    res.json(response);
    
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
      error: error.message
    });
  }
};

// 📌 Get a lead by ID
exports.getLeadById = (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Build query based on user role
    let query = `SELECT Leads.*, Users.name AS assigned_to_name 
                 FROM Leads 
                 LEFT JOIN Users ON Leads.assigned_to = Users.id 
                 WHERE Leads.id = ?`;
    let params = [id];

    // For managers, only show leads assigned to their team members
    if (userRole === 'manager') {
        query += ` AND (Leads.assigned_to IN (SELECT id FROM Users WHERE manager_id = ?) OR Leads.assigned_to IS NULL)`;
        params.push(userId);
    }
    // For callers, only show their assigned leads or unassigned leads
    else if (userRole === 'caller') {
        query += ` AND (Leads.assigned_to = ? OR Leads.assigned_to IS NULL)`;
        params.push(userId);
    }

    db.query(query, params, (err, lead) => {
        if (err) {
            return res.status(500).json(responseFormatter(false, "Server error", err.message));
        }

        if (lead.length === 0) {
            return res.status(403).json(responseFormatter(false, "Access denied. Insufficient privileges."));
        }

        res.json(responseFormatter(true, "Lead retrieved", lead[0]));
    });
};

// 📌 Update a lead
exports.updateLead = (req, res) => {
    const leadId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
  
    // First check if lead exists and get assignment info
    db.query(
        `SELECT l.*, 
                COALESCE(l.assigned_to, l.created_by) as responsible_user
         FROM leads l 
         WHERE l.id = ?`,
        [leadId],
        (error, leadResult) => {
            if (error) {
                console.error('Error fetching lead:', error);
                return res.status(500).json(responseFormatter(false, "Database error", error.message));
            }

            if (leadResult.length === 0) {
                return res.status(404).json(responseFormatter(false, "Lead not found"));
            }

            const lead = leadResult[0];

            // Authorization check based on role
            let hasAccess = false;

            switch (userRole) {
                case 'admin':
                case 'manager':
                    hasAccess = true;
                    break;
                case 'field_employee':
                case 'caller':
                    // Can update if they are assigned or created the lead
                    hasAccess = (lead.assigned_to === userId || lead.created_by === userId);
                    break;
                default:
                    hasAccess = false;
            }

            if (!hasAccess) {
                return res.status(403).json(responseFormatter(false, "Access denied. You can only update leads assigned to you or created by you."));
            }

            // Proceed with update if authorized
            const { name, phone_no, status, notes } = req.body;

            // Validate required fields
            if (!name || !phone_no || !status) {
                return res.status(400).json(responseFormatter(false, "Name, phone number, and status are required"));
            }

            // Update the lead
            db.query(
                `UPDATE leads 
                 SET name = ?, 
                     phone_no = ?, 
                     status = ?, 
                     notes = ?,
                     updated_by = ?,
                     updated_at = NOW()
                 WHERE id = ?`,
                [name, phone_no, status, notes, userId, leadId],
                (updateError) => {
                    if (updateError) {
                        return res.status(500).json(responseFormatter(false, "Database error", updateError.message));
                    }

                    // Log the activity
                    const activityDescription = `Updated lead ${name} (ID: ${leadId}) - Status: ${status}`;
                    db.query(
                        `INSERT INTO activity_logs 
                         (user_id, action_type, action_description, reference_type, reference_id)
                         VALUES (?, 'lead_update', ?, 'lead', ?)`,
                        [userId, activityDescription, leadId],
                        (logError) => {
                            if (logError) {
                                console.error('Error logging activity:', logError);
                            }

                            res.json(responseFormatter(true, "Lead updated successfully", { id: leadId }));
                        }
                    );
                }
            );
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

// Create lead by manager
exports.createLeadByManager = (req, res) => {
    const { name, phone_no, lead_category = "Cold Lead", status = "New", address = "", notes = "", assigned_to = null, campaign_id = null } = req.body;
    const created_by = req.user.id;
    const created_at = new Date();
    const updated_at = new Date();

    if (!name || !phone_no) {
        return res.status(400).json(responseFormatter(false, "Name and phone number are required"));
    }

    db.query(
        `INSERT INTO Leads (name, phone_no, lead_category, status, address, notes, assigned_to, campaign_id, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, phone_no, lead_category, status, address, notes, assigned_to, campaign_id, created_by, created_at, updated_at],
        (err, result) => {
            if (err) {
                console.error("Add lead by manager error:", err);
                return res.status(500).json(responseFormatter(false, "Database error", err.message));
            }
            db.query("SELECT * FROM Leads WHERE id = ?", [result.insertId], (err, lead) => {
                if (err) {
                    return res.status(500).json(responseFormatter(false, "Fetch new lead failed", err.message));
                }
                res.status(201).json(responseFormatter(true, "Lead added successfully by manager", lead[0]));
            });
        }
    );
};

// Update lead by manager
exports.updateLeadByManager = (req, res) => {
    const { id } = req.params;
    const { name, phone_no, lead_category, status, address, notes, assigned_to, campaign_id } = req.body;
    const updated_at = new Date();

    db.query("SELECT * FROM Leads WHERE id = ?", [id], (err, leads) => {
        if (err) {
            return res.status(500).json(responseFormatter(false, "Database error", err.message));
        }
        if (leads.length === 0) {
            return res.status(404).json(responseFormatter(false, "Lead not found"));
        }
        db.query(
            `UPDATE Leads SET name = ?, phone_no = ?, lead_category = ?, status = ?, address = ?, notes = ?, assigned_to = ?, campaign_id = ?, updated_at = ? WHERE id = ?`,
            [name, phone_no, lead_category, status, address, notes, assigned_to, campaign_id, updated_at, id],
            (err, result) => {
                if (err) {
                    return res.status(500).json(responseFormatter(false, "Database error", err.message));
                }
                db.query("SELECT * FROM Leads WHERE id = ?", [id], (err, lead) => {
                    if (err) {
                        return res.status(500).json(responseFormatter(false, "Fetch updated lead failed", err.message));
                    }
                    res.json(responseFormatter(true, "Lead updated successfully by manager", lead[0]));
                });
            }
        );
    });
};

// Assign a campaign to a lead (manager only)
exports.assignCampaignToLead = (req, res) => {
    const { leadId, campaignId } = req.body;
    if (!leadId || !campaignId) {
        return res.status(400).json(responseFormatter(false, "leadId and campaignId are required"));
    }
    db.query(
        "UPDATE Leads SET campaign_id = ? WHERE id = ?",
        [campaignId, leadId],
        (err, result) => {
            if (err) {
                return res.status(500).json(responseFormatter(false, "Database error", err.message));
            }
            if (result.affectedRows === 0) {
                return res.status(404).json(responseFormatter(false, "Lead not found"));
            }
            res.json(responseFormatter(true, "Campaign assigned to lead successfully"));
        }
    );
};

// Assign a user to a lead (manager only)
exports.assignUserToLead = (req, res) => {
    const { leadId, userId } = req.body;
    if (!leadId || !userId) {
        return res.status(400).json(responseFormatter(false, "leadId and userId are required"));
    }
    db.query(
        "UPDATE Leads SET assigned_to = ? WHERE id = ?",
        [userId, leadId],
        (err, result) => {
            if (err) {
                return res.status(500).json(responseFormatter(false, "Database error", err.message));
            }
            if (result.affectedRows === 0) {
                return res.status(404).json(responseFormatter(false, "Lead not found"));
            }
            res.json(responseFormatter(true, "User assigned to lead successfully"));
        }
    );
};

// Get unassigned leads (for managers)
exports.getUnassignedLeads = (req, res) => {
    const managerId = req.user.id;
    const query = `
        SELECT l.*, u.name as assigned_to_name 
        FROM Leads l 
        LEFT JOIN Users u ON l.assigned_to = u.id 
        WHERE l.assigned_to IS NULL 
        OR l.assigned_to IN (SELECT id FROM Users WHERE manager_id = ?)
        ORDER BY l.created_at DESC`;

    db.query(query, [managerId], (err, leads) => {
        if (err) {
            return res.status(500).json(responseFormatter(false, "Database error", err.message));
        }
        res.json(responseFormatter(true, "Unassigned leads retrieved successfully", leads));
    });
};

const getLeadDetails = async (req, res) => {
    const leadId = req.params.id;
    
    db.query(
        'SELECT * FROM leads_detailed_view WHERE id = ?',
        [leadId],
        (error, results) => {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: "Database error",
                    error: error.message
                });
            }
            
            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Lead not found"
                });
            }

            res.json({
                success: true,
                data: results[0]
            });
        }
    );
};

// Get leads by assignee
const getAssignedLeads = (req, res) => {
    const userId = req.params.userId;
    
    db.query(
        'SELECT * FROM leads_detailed_view WHERE assigned_to = ? ORDER BY created_at DESC',
        [userId],
        (error, results) => {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: "Database error",
                    error: error.message
                });
            }

            res.json({
                success: true,
                data: results
            });
        }
    );
};

// 📌 Get leads by user id
exports.getLeadsByUserId = (req, res) => {
    const userId = req.params.id;
    const userRole = req.user.role;
    
    // Debug log
    console.log('Fetching leads for user:', userId, 'with role:', userRole);

    // Double check if user exists
    db.query('SELECT manager_id FROM users WHERE id = ?', [userId], (userErr, userResults) => {
        if (userErr) {
            console.error('Error checking user:', userErr);
            return res.status(500).json({
                success: false,
                message: "Error checking user",
                error: userErr.message
            });
        }

        if (!userResults || userResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const managerId = userResults[0].manager_id;
        console.log('User manager_id:', managerId); // Debug log

        const query = `
            WITH UserLeads AS (
                SELECT DISTINCT l.*, 
                       u.name as assigned_to_name,
                       cr.name as creator_name,
                       ca.name as campaign_name,
                       CASE 
                         WHEN l.created_by = ? THEN 'self-created'
                         WHEN l.assigned_to = ? THEN 'assigned'
                         WHEN l.manager_id = ? THEN 'team'
                         ELSE 'other'
                       END as lead_source
                FROM leads l
                LEFT JOIN users u ON l.assigned_to = u.id
                LEFT JOIN users cr ON l.created_by = cr.id
                LEFT JOIN campaigns ca ON l.campaign_id = ca.id
                WHERE 
                    l.assigned_to = ?  -- Leads assigned to the user
                    OR l.created_by = ? -- Leads created by the user
                    OR (l.manager_id = ? AND l.assigned_to IS NULL) -- Unassigned leads in user's team
                    OR l.created_by = ? -- Explicitly include leads created by user
            )
            SELECT 
                ul.*,
                COALESCE(COUNT(DISTINCT c.id), 0) as call_count,
                COALESCE(COUNT(DISTINCT n.id), 0) as note_count
            FROM UserLeads ul
            LEFT JOIN calls c ON ul.id = c.lead_id
            LEFT JOIN notes n ON ul.id = n.lead_id
            GROUP BY ul.id
            ORDER BY ul.created_at DESC
        `;

        const queryParams = [
            userId,     // for CASE self-created
            userId,     // for CASE assigned
            managerId,  // for CASE team
            userId,     // for assigned_to check
            userId,     // for created_by check
            managerId,  // for manager_id check
            userId      // for created_by in unassigned leads
        ];

        // Debug log for query params
        console.log('Executing query with params:', queryParams);

        db.query(query, queryParams, (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({
                    success: false,
                    message: "Error fetching leads",
                    error: error.message
                });
            }
            
            // Debug log
            console.log(`Found ${results.length} leads for user ${userId}`);
            
            res.json({
                success: true,
                data: results || []
            });
        });
    });
};