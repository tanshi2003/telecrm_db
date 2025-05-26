const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require("../middleware/auth");

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
            u.status as member_status
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
                    status: row.member_status
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
            u.status as member_status
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
                    status: row.member_status
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

// Get dashboard statistics
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
            SELECT COUNT(*) as total 
            FROM campaigns 
            WHERE status != 'archived'
        `,
        activeCampaigns: `
            SELECT COUNT(*) as total 
            FROM campaigns 
            WHERE status = 'active'
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
            db.query(queries.totalCampaigns, (err, results) => {
                if (err) reject(err);
                resolve(results[0].total);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(queries.activeCampaigns, (err, results) => {
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
router.get('/team-performance', authenticateToken, checkManagerAccess, (req, res) => {
    const query = `
        SELECT 
            u.id,
            u.name,
            COUNT(DISTINCT l.id) as total_leads_handled,
            COUNT(DISTINCT c.id) as total_campaigns_handled,
            COUNT(CASE WHEN l.status = 'Converted' THEN 1 END) as conversions,
            ROUND((COUNT(CASE WHEN l.status = 'Converted' THEN 1 END) * 100.0 / NULLIF(COUNT(DISTINCT l.id), 0)), 2) as conversion_rate,
            COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_campaigns
        FROM users u
        LEFT JOIN campaign_members cm ON u.id = cm.user_id
        LEFT JOIN campaigns c ON cm.campaign_id = c.id
        LEFT JOIN leads l ON l.assigned_to = u.id
        WHERE u.manager_id = ? AND u.role IN ('caller', 'field_employee')
        GROUP BY u.id, u.name
        ORDER BY total_leads_handled DESC
    `;

    db.query(query, [req.user.id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching team performance'
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
});

// Get campaign performance
router.get('/campaign-performance', authenticateToken, checkManagerAccess, (req, res) => {
    const query = `
        SELECT 
            c.id, 
            c.name, 
            c.status, 
            c.priority,
            c.start_date, 
            c.end_date, 
            c.lead_count,
            COUNT(DISTINCT l.id) as total_leads,
            ROUND((COUNT(CASE WHEN l.status = 'Converted' THEN 1 END) / NULLIF(COUNT(l.id), 0)) * 100, 2) as conversion_rate,
            GROUP_CONCAT(DISTINCT u.id) as assigned_user_ids,
            GROUP_CONCAT(DISTINCT u.name) as assigned_user_names
        FROM campaigns c
        LEFT JOIN leads l ON c.id = l.campaign_id
        LEFT JOIN campaign_users cu ON c.id = cu.campaign_id
        LEFT JOIN users u ON cu.user_id = u.id
        GROUP BY c.id, c.name, c.status, c.priority, c.start_date, c.end_date, c.lead_count
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching campaign performance'
            });
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

        res.json({
            success: true,
            data: processedResults
        });
    });
});

// Assign leads to callers
router.post('/assign-leads', authenticateToken, checkManagerAccess, (req, res) => {
    const { caller_id, lead_ids } = req.body;

    if (!caller_id || !lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid request parameters'
        });
    }

    // First verify the caller exists and is active
    db.query(
        'SELECT u.id, u.status, u.manager_id FROM users u WHERE u.id = ? AND u.role = "caller"',
        [caller_id],
        (err, users) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Caller not found'
                });
            }

            const caller = users[0];

            if (caller.status !== 'active') {
                return res.status(400).json({
                    success: false,
                    message: 'Caller is not active'
                });
            }

            // If manager is assigning leads, verify the caller is in their team
            if (req.user.role === 'manager' && caller.manager_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Cannot assign leads to caller from another team'
                });
            }

            // Verify leads exist and are unassigned or assigned to this manager's team
            const leadsQuery = req.user.role === 'manager'
                ? 'SELECT id, assigned_to FROM leads WHERE id IN (?) AND (assigned_to IS NULL OR assigned_to IN (SELECT id FROM users WHERE manager_id = ?))'
                : 'SELECT id, assigned_to FROM leads WHERE id IN (?)';
            const leadsParams = req.user.role === 'manager' ? [lead_ids, req.user.id] : [lead_ids];

            db.query(leadsQuery, leadsParams, (err, leads) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error'
                    });
                }

                if (leads.length !== lead_ids.length) {
                    return res.status(400).json({
                        success: false,
                        message: 'Some leads are invalid or not accessible'
                    });
                }

                // Update leads
                const updateQuery = 'UPDATE leads SET assigned_to = ? WHERE id IN (?)';
                db.query(updateQuery, [caller_id, lead_ids], (err) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Error assigning leads'
                        });
                    }

                    // Update user's total leads count
                    db.query(
                        'UPDATE users SET total_leads = total_leads + ? WHERE id = ?',
                        [lead_ids.length, caller_id],
                        (err) => {
                            if (err) {
                                console.error('Database error:', err);
                                // Don't return error as leads are already assigned
                            }

                            res.json({
                                success: true,
                                message: 'Leads assigned successfully'
                            });
                        }
                    );
                });
            });
        }
    );
});

// Get unassigned leads
router.get('/unassigned-leads', authenticateToken, checkManagerAccess, (req, res) => {
    const query = 'SELECT * FROM leads WHERE assigned_to IS NULL';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching unassigned leads'
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
});

// Get active callers
router.get('/active-callers', authenticateToken, checkManagerAccess, (req, res) => {
    const query = `
        SELECT 
            u.id,
            u.name,
            u.email,
            COUNT(l.id) as assigned_leads
        FROM users u
        LEFT JOIN leads l ON u.id = l.assigned_to
        WHERE u.role = 'caller' AND u.status = 'active'
        GROUP BY u.id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching active callers'
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
});

// Get manager's team members
router.get('/:managerId/team', authenticateToken, checkManagerAccess, (req, res) => {
    const { managerId } = req.params;
    
    console.log('Fetching team for manager:', managerId);
    console.log('Request user:', req.user);
    
    // If manager role, can only access their own team
    if (req.user.role === 'manager' && req.user.id !== parseInt(managerId)) {
        console.log('Access denied: Manager trying to access another team');
        return res.status(403).json({
            success: false,
            message: 'Access denied. You can only view your own team.'
        });
    }

    // First verify the manager exists
    db.query('SELECT id, role FROM users WHERE id = ? AND role = "manager"', [managerId], (err, managers) => {
        if (err) {
            console.error('Error checking manager:', err);
            return res.status(500).json({
                success: false,
                message: 'Error verifying manager'
            });
        }

        if (managers.length === 0) {
            console.log('Manager not found:', managerId);
            return res.status(404).json({
                success: false,
                message: 'Manager not found'
            });
        }

        const query = `
            SELECT 
                u.id,
                u.name,
                u.email,
                u.role,
                u.status
            FROM users u
            WHERE u.manager_id = ?
            AND u.role IN ('caller', 'field_employee')
            AND u.status = 'active'
            ORDER BY u.name
        `;

        console.log('Executing query:', query, 'with managerId:', managerId);

        db.query(query, [managerId], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching team members'
                });
            }

            console.log('Query results:', results);

            res.json({
                success: true,
                data: results
            });
        });
    });
});

module.exports = router;