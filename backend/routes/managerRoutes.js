const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require("../middleware/auth");
const managerController = require('../controllers/managerController');
const campaignController = require('../controllers/campaignController');

// Middleware to check if user is a manager or admin
const checkManagerAccess = (req, res, next) => {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Manager role required.'
        });
    }
    next();
};

// Get all teams with their members
router.get('/teams', authenticateToken, checkManagerAccess, (req, res) => {
    let query = `
        SELECT 
            m.id as manager_id,
            m.name as manager_name,
            m.email as manager_email,
            u.id as member_id,
            u.name as member_name,
            u.email as member_email,
            u.role as member_role,
            u.status as member_status,
            COALESCE(DATE_FORMAT(u.created_at, '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s')) as created_at
        FROM users m
        LEFT JOIN users u ON m.id = u.manager_id
        WHERE m.role = 'manager'
    `;

    // If manager role, only show their team
    if (req.user.role === 'manager') {
        query += ' AND m.id = ?';
    }

    query += ' ORDER BY m.id, u.id';

    const queryParams = req.user.role === 'manager' ? [req.user.id] : [];

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching teams'
            });
        }

        // Structure the data into teams
        const teams = results.reduce((acc, row) => {
            if (!acc[row.manager_id]) {
                acc[row.manager_id] = {
                    manager_id: row.manager_id,
                    manager_name: row.manager_name,
                    manager_email: row.manager_email,
                    team_size: 0,
                    team_members: []
                };
            }

            if (row.member_id) {
                acc[row.manager_id].team_members.push({
                    id: row.member_id,
                    name: row.member_name,
                    email: row.member_email,
                    role: row.member_role,
                    status: row.member_status,
                    created_at: row.created_at
                });
                acc[row.manager_id].team_size = acc[row.manager_id].team_members.length;
            }

            return acc;
        }, {});

        res.json({
            success: true,
            data: Object.values(teams)
        });
    });
});

// Get specific team by ID
router.get('/teams/:id', authenticateToken, checkManagerAccess, (req, res) => {
    const teamId = req.params.id;
    
    // If manager role, can only access their own team
    if (req.user.role === 'manager' && req.user.id !== parseInt(teamId)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. You can only view your own team.'
        });
    }

    const query = `
        SELECT 
            m.id as manager_id,
            m.name as manager_name,
            m.email as manager_email,
            u.id as member_id,
            u.name as member_name,
            u.email as member_email,
            u.role as member_role,
            u.status as member_status,
            COALESCE(DATE_FORMAT(u.created_at, '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s')) as created_at
        FROM users m
        LEFT JOIN users u ON m.id = u.manager_id
        WHERE m.role = 'manager' AND m.id = ?
        ORDER BY m.id, u.id
    `;

    db.query(query, [teamId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching team'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        // Structure the data into team format
        const team = results.reduce((acc, row) => {
            if (!acc.manager_id) {
                acc = {
                    manager_id: row.manager_id,
                    manager_name: row.manager_name,
                    manager_email: row.manager_email,
                    team_size: 0,
                    team_members: []
                };
            }

            if (row.member_id) {
                acc.team_members.push({
                    id: row.member_id,
                    name: row.member_name,
                    email: row.member_email,
                    role: row.member_role,
                    status: row.member_status,
                    created_at: row.created_at
                });
                acc.team_size = acc.team_members.length;
            }

            return acc;
        }, {});

        res.json({
            success: true,
            data: team
        });
    });
});

// Get unassigned users (callers and field employees)
router.get('/unassigned-users', authenticateToken, checkManagerAccess, (req, res) => {
    const query = `
        SELECT 
            u.id,
            u.name,
            u.email,
            u.phone_no,
            u.role,
            u.status,
            u.created_at,
            u.last_login
        FROM users u
        WHERE u.manager_id IS NULL 
        AND u.status = 'active'
        AND u.role IN ('caller', 'field_employee')
        ORDER BY u.created_at DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching unassigned users'
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
});

// Assign users to team/manager
router.post('/assign-users', authenticateToken, checkManagerAccess, (req, res) => {
    const { manager_id, user_ids } = req.body;

    if (!manager_id || !user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid request parameters'
        });
    }

    // First verify the manager exists and is active
    db.query('SELECT id, status FROM users WHERE id = ? AND role = "manager"', [manager_id], (err, managers) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (managers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Manager not found'
            });
        }

        if (managers[0].status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Manager is not active'
            });
        }

        // Update users
        const updateQuery = 'UPDATE users SET manager_id = ? WHERE id IN (?) AND role IN ("caller", "field_employee")';
        db.query(updateQuery, [manager_id, user_ids], (err) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error assigning users to manager'
                });
            }

            res.json({
                success: true,
                message: 'Users assigned to manager successfully'
            });
        });
    });
});

// Assign leads to team members
router.post('/assign-leads', authenticateToken, checkManagerAccess, async (req, res) => {
    try {
        const { userId, leadIds } = req.body;
        const managerId = req.user.id;

        // First, verify the user belongs to this manager's team
        const [userCheck] = await db.promise().query(
            'SELECT id FROM users WHERE id = ? AND manager_id = ?',
            [userId, managerId]
        );

        if (userCheck.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'You can only assign leads to your team members'
            });
        }

        // Then update leads in a separate query
        const [result] = await db.promise().query(
            `UPDATE leads 
             SET assigned_to = ?,
                 updated_at = NOW() 
             WHERE id IN (?) 
             AND (assigned_to IS NULL 
                  OR assigned_to IN (
                     SELECT id FROM (
                         SELECT u.id 
                         FROM users u 
                         WHERE u.manager_id = ?
                     ) AS subq
                  ))`,
            [userId, leadIds, managerId]
        );

        res.json({
            success: true,
            message: 'Leads assigned successfully',
            affected: result.affectedRows
        });
    } catch (error) {
        console.error('Error assigning leads:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign leads'
        });
    }
});

// Get dashboard statistics
// Get unassigned leads for a manager
router.get('/unassigned-leads', authenticateToken, checkManagerAccess, managerController.getUnassignedLeads);
router.get('/dashboard-stats', authenticateToken, checkManagerAccess, (req, res) => {
    const queries = {
        totalTeamMembers: `
            SELECT COUNT(*) as total 
            FROM users 
            WHERE manager_id = ? AND role IN ('caller', 'field_employee')
        `,
        activeTeamMembers: `
            SELECT COUNT(*) as total 
            FROM users 
            WHERE manager_id = ? 
            AND role IN ('caller', 'field_employee')
            AND status = 'active'
        `,
        totalCampaigns: `
            SELECT COUNT(DISTINCT c.id) as total 
            FROM campaigns c
            WHERE (c.manager_id = ? OR c.id IN (
                SELECT campaign_id 
                FROM campaign_users 
                WHERE user_id = ?
            ))
            AND LOWER(c.status) != 'archived'
        `,
        activeCampaigns: `
            SELECT COUNT(DISTINCT c.id) as total 
            FROM campaigns c
            WHERE (c.manager_id = ? OR c.id IN (
                SELECT campaign_id 
                FROM campaign_users 
                WHERE user_id = ?
            ))
            AND LOWER(c.status) = 'active'
        `
    };

    Promise.all([
        new Promise((resolve, reject) => {
            db.query(queries.totalTeamMembers, [req.user.id], (err, results) => {
                if (err) reject(err);
                resolve(results[0].total);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(queries.activeTeamMembers, [req.user.id], (err, results) => {
                if (err) reject(err);
                resolve(results[0].total);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(queries.totalCampaigns, [req.user.id, req.user.id], (err, results) => {
                if (err) reject(err);
                resolve(results[0].total);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(queries.activeCampaigns, [req.user.id, req.user.id], (err, results) => {
                if (err) reject(err);
                resolve(results[0].total);
            });
        })
    ])
    .then(([totalTeamMembers, activeTeamMembers, totalCampaigns, activeCampaigns]) => {
        res.json({
            success: true,
            data: {
                totalTeamMembers,
                activeTeamMembers,
                totalCampaigns,
                activeCampaigns
            }
        });
    })
    .catch(err => {
        console.error('Database error:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics'
        });
    });
});

// Get team performance
router.get('/team-performance', authenticateToken, checkManagerAccess, async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id,
                u.name,
                COUNT(DISTINCT l.id) as total_leads_handled,
                (
                    SELECT COUNT(DISTINCT c.id) 
                    FROM campaigns c
                    WHERE c.manager_id = u.manager_id
                ) as total_campaigns_handled,
                COUNT(CASE WHEN l.status = 'Converted' THEN 1 END) as conversions,
                ROUND((COUNT(CASE WHEN l.status = 'Converted' THEN 1 END) * 100.0 / NULLIF(COUNT(DISTINCT l.id), 0)), 2) as conversion_rate,
                (
                    SELECT COUNT(DISTINCT c.id) 
                    FROM campaigns c
                    WHERE c.manager_id = u.manager_id AND c.status = 'active'
                ) as active_campaigns
            FROM users u
            LEFT JOIN leads l ON l.assigned_to = u.id
            WHERE u.manager_id = ? AND u.role IN ('caller', 'field_employee')
            GROUP BY u.id, u.name
            ORDER BY total_leads_handled DESC`;

        const results = await new Promise((resolve, reject) => {
            db.query(query, [req.user.id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        res.json({
            success: true,
            data: results.map(member => ({
                id: member.id,
                name: member.name,
                total_leads_handled: parseInt(member.total_leads_handled) || 0,
                total_campaigns_handled: parseInt(member.total_campaigns_handled) || 0,
                conversions: parseInt(member.conversions) || 0,
                conversion_rate: parseFloat(member.conversion_rate) || 0,
                active_campaigns: parseInt(member.active_campaigns) || 0
            }))
        });
    } catch (error) {
        console.error('Error in team performance endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching team performance metrics',
            error: error.message
        });
    }
});

// Get users assigned to a manager
router.get('/:id/users', authenticateToken, checkManagerAccess, managerController.getUsersByManagerId);

// Get manager's team members
router.get('/:managerId/team', authenticateToken, checkManagerAccess, async (req, res) => {
    const managerId = req.params.managerId;
    
    // Ensure the manager can only access their own team
    if (req.user.role === 'manager' && req.user.id !== parseInt(managerId)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. You can only view your own team members.'
        });
    }

    const query = `
        SELECT 
            u.id,
            u.name,
            u.email,
            u.role,
            u.status,
            u.manager_id,
            u.created_at
        FROM users u
        WHERE u.manager_id = ?
        AND u.status = 'active'
        ORDER BY u.name ASC
    `;

    try {
        const [teamMembers] = await db.query(query, [managerId]);
        res.json({
            success: true,
            data: teamMembers
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching team members'
        });
    }
});

// Get team members for a specific manager
router.get('/:managerId/team-members', authenticateToken, checkManagerAccess, async (req, res) => {
    try {
        const parsedManagerId = parseInt(req.params.managerId);
        
        const query = `
            SELECT 
                u.id,
                u.name,
                u.email,
                u.phone_no,
                u.role,
                u.manager_id,
                u.created_at,
                u.updated_at,
                u.location,
                COALESCE(l.total_leads, 0) as total_leads,
                COALESCE(c.campaigns_handled, 0) as campaigns_handled
            FROM users u
            LEFT JOIN (
                SELECT assigned_to, COUNT(*) as total_leads
                FROM leads
                GROUP BY assigned_to
            ) l ON u.id = l.assigned_to
            LEFT JOIN (
                SELECT user_id, COUNT(*) as campaigns_handled
                FROM campaign_users cu
                INNER JOIN campaigns c ON cu.campaign_id = c.id
                WHERE c.status = 'active'
                GROUP BY user_id
            ) c ON u.id = c.user_id
            WHERE u.manager_id = ?
            AND u.role IN ('caller', 'field_employee')
            AND u.status = 'active'
            ORDER BY u.name ASC`;

        const [teamMembers] = await db.promise().query(query, [parsedManagerId]);
        
        res.json({
            success: true,
            message: "Team members retrieved successfully",
            data: teamMembers
        });
    } catch (error) {
        console.error("Error fetching team members:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch team members",
            error: error.message
        });
    }
});

// Get campaigns for a specific manager
router.get('/:managerId/campaigns', authenticateToken, checkManagerAccess, async (req, res) => {
    const managerId = req.params.managerId;
    
    // Ensure managers can only access their own campaigns
    if (req.user.role === 'manager' && req.user.id !== parseInt(managerId)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. You can only view your own campaigns.'
        });
    }    const query = `
        SELECT 
            c.*,
            COUNT(DISTINCT l.id) as total_leads,
            COUNT(DISTINCT cu.user_id) as total_users
        FROM campaigns c
        LEFT JOIN leads l ON c.id = l.campaign_id
        LEFT JOIN campaign_users cu ON c.id = cu.campaign_id
        WHERE c.manager_id = ? OR c.id IN (
            SELECT campaign_id 
            FROM campaign_users 
            WHERE user_id = ?
        )
        GROUP BY c.id
        ORDER BY c.created_at DESC
    `;

    try {
        const [campaigns] = await db.promise().query(query, [managerId, managerId]);
        res.json({
            success: true,
            data: campaigns
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching campaigns'
        });
    }
});

// Add this new route
router.get('/:managerId/campaign-performance', authenticateToken, checkManagerAccess, campaignController.getCampaignPerformance);

module.exports = router;
