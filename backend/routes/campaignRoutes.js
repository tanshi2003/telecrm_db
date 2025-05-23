const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaignController");
const { authenticateToken } = require("../middlewares/auth");
const roleMiddleware = require("../middlewares/role");

// Protected routes - require authentication
router.use(authenticateToken);

// Get all campaigns
router.get("/", roleMiddleware(["admin", "manager"]), campaignController.getCampaigns);

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
router.post("/:id/assign-users", roleMiddleware(["admin"]), campaignController.assignUsersToCampaign);

// Remove users from campaign
router.delete("/:id/remove-users", roleMiddleware(["admin"]), campaignController.removeUsersFromCampaign);

module.exports = router;
