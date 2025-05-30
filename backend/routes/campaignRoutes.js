// Import database connection at the top
const db = require('../config/db').promise(); // Add .promise()
const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaignController");
const { authenticateToken } = require("../middleware/auth");
const roleMiddleware = require("../middleware/checkRole");

// Protected routes - require authentication
router.use(authenticateToken);

// Get all campaigns
router.get("/", roleMiddleware(["admin", "manager"]), campaignController.getCampaigns);

// Get campaigns for a specific manager
router.get("/manager/:id", roleMiddleware(["manager"]), campaignController.getCampaignsByManagerId);

// Get campaigns for a caller (specific route)
router.get("/user/:id/campaigns", roleMiddleware(["admin", "manager", "caller"]), campaignController.getCampaignsByUserId);

// Create a new campaign (Admin and Manager only)
router.post("/", roleMiddleware(["admin", "manager"]), campaignController.createCampaign);

// Get a specific campaign
router.get("/:id", roleMiddleware(["admin", "manager"]), campaignController.getCampaignById);

// Update a campaign
router.put("/:id", roleMiddleware(["admin", "manager"]), campaignController.updateCampaign);

// Delete a campaign
//router.delete("/:id", roleMiddleware(["admin"]), campaignController.deleteCampaign);
//router.delete('/api/campaigns/:id', campaignController.deleteCampaign);
router.delete('/:id', roleMiddleware(["admin"]), campaignController.deleteCampaign);

// Assign users to campaign
router.post("/:id/assign-users", roleMiddleware(["admin", "manager"]), campaignController.assignUsersToCampaign);

// Remove users from campaign
router.delete("/:id/remove-users", roleMiddleware(["admin", "manager"]), campaignController.removeUsersFromCampaign);

// Unassign users from campaign (new route)
router.post('/unassign', roleMiddleware(["admin", "manager"]), campaignController.unassignUserFromCampaign);

// Update the campaigns with leads route
router.get("/:userId/campaigns/with-leads", authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const [campaigns] = await db.query(`
            SELECT 
                c.id, 
                c.name, 
                c.description, 
                c.created_at,
                c.start_date,
                c.end_date,
                c.status,
                u.name as manager_name,
                COUNT(DISTINCT l.id) as lead_count
            FROM campaigns c
            INNER JOIN campaign_users cu ON c.id = cu.campaign_id
            LEFT JOIN users u ON c.manager_id = u.id
            LEFT JOIN leads l ON c.id = l.campaign_id
            WHERE cu.user_id = ?
            GROUP BY c.id, c.name, c.description, c.created_at, c.start_date, c.end_date, c.status, u.name
        `, [userId]);

        res.json({
            success: true,
            data: campaigns || []
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: "Error fetching campaigns" });
    }
});

module.exports = router;
