// Import database connection at the top
const db = require('../config/db').promise();
const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaignController");
const { authenticateToken } = require("../middleware/auth");
const roleMiddleware = require("../middleware/checkRole");
const Activity = require("../models/Activity");

// Protected routes - require authentication
router.use(authenticateToken);

// Get all campaigns
router.get("/", roleMiddleware(["admin", "manager"]), campaignController.getCampaigns);

// Get campaigns for a specific manager
router.get("/manager/:id", roleMiddleware(["manager"]), campaignController.getCampaignsByManagerId);

// Get campaigns for a caller (specific route)
router.get("/user/:id/campaigns", roleMiddleware(["admin", "manager", "caller"]), campaignController.getCampaignsByUserId);

// Create a new campaign (Admin and Manager only)
router.post("/", roleMiddleware(["admin", "manager"]), async (req, res) => {
    try {
        const result = await campaignController.createCampaign(req.body);
        
        // Log campaign creation activity
        await Activity.logActivity(
            req.user.id,
            req.user.role,
            'campaign_create',
            `Created new campaign: ${req.body.name}`,
            'campaign',
            result.id,
            null
        );

        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get a specific campaign
router.get("/:id", roleMiddleware(["admin", "manager"]), campaignController.getCampaignById);

// Update a campaign
router.put("/:id", roleMiddleware(["admin", "manager"]), campaignController.updateCampaign);

// Delete a campaign
//router.delete("/:id", roleMiddleware(["admin"]), campaignController.deleteCampaign);
//router.delete('/api/campaigns/:id', campaignController.deleteCampaign);
router.delete('/:id', roleMiddleware(["admin"]), campaignController.deleteCampaign);

// Assign users to campaign
router.post("/:id/assign-users", roleMiddleware(["admin", "manager"]), async (req, res) => {
    try {
        const result = await campaignController.assignUsersToCampaign(req.params.id, req.body.userIds);
        
        // Log user assignment activity
        await Activity.logActivity(
            req.user.id,
            req.user.role,
            'campaign_assign_users',
            `Assigned ${req.body.userIds.length} users to campaign #${req.params.id}`,
            'campaign',
            req.params.id,
            null
        );

        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Remove users from campaign
router.delete("/:id/remove-users", roleMiddleware(["admin", "manager"]), campaignController.removeUsersFromCampaign);

// Unassign users from campaign (new route)
router.post('/unassign', roleMiddleware(["admin", "manager"]), campaignController.unassignUserFromCampaign);

// Update the campaigns with leads route
router.get("/:userId/campaigns/with-leads", authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const userRole = req.user.role;        // Different query based on role
        const query = userRole === 'caller' ? `
            SELECT 
                c.id, 
                c.name, 
                c.description, 
                c.created_at,
                c.status,
                u.name AS manager_name,
                COUNT(DISTINCT l.id) AS lead_count
            FROM campaigns c
            INNER JOIN campaign_users cu ON c.id = cu.campaign_id
            LEFT JOIN users u ON c.manager_id = u.id
            LEFT JOIN leads l ON c.id = l.campaign_id AND l.assigned_to = ?
            WHERE cu.user_id = ?
            GROUP BY c.id, c.name, c.description, c.created_at, c.status, u.name
        ` : `
            SELECT 
                c.id, 
                c.name, 
                c.description, 
                c.created_at,
                c.start_date,
                c.end_date,                c.status,
                u.name AS manager_name,
                COUNT(DISTINCT l.id) AS lead_count
            FROM campaigns c
            INNER JOIN campaign_users cu ON c.id = cu.campaign_id
            LEFT JOIN users u ON c.manager_id = u.id
            LEFT JOIN leads l ON c.id = l.campaign_id
            WHERE cu.user_id = ?
            GROUP BY c.id, c.name, c.description, c.created_at, c.start_date, c.end_date, c.status, u.name
        `;

        const [campaigns] = await db.query(query, [userId, userId]);

        res.json({
            success: true,
            data: campaigns || []
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching campaigns"
        });
    }
});

// Replace or update the existing /user/:userId route
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const userRole = req.user.role;
        
        const query = `
            SELECT 
                c.*,
                u.name as manager_name,
                COUNT(DISTINCT l.id) as lead_count
            FROM campaigns c
            INNER JOIN campaign_users cu ON c.id = cu.campaign_id
            LEFT JOIN users u ON c.manager_id = u.id
            LEFT JOIN leads l ON c.id = l.campaign_id
            WHERE cu.user_id = ?
                AND c.status = 'active'
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `;

        const [campaigns] = await db.query(query, [userId]);

        console.log('Fetched campaigns for user:', userId, campaigns.length);

        res.json({
            success: true,
            data: campaigns || []
        });

    } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching campaigns",
            error: error.message
        });
    }
});

module.exports = router;
