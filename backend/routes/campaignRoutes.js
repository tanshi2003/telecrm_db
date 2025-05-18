const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaignController");
const { authenticateToken } = require("../middlewares/auth");
const roleMiddleware = require("../middlewares/role");

// Protected routes - require authentication
router.use(authenticateToken);

// Get campaigns for a caller (must come before generic routes)
router.get("/:id", roleMiddleware(["admin", "manager", "caller"]), campaignController.getCampaignsByUserId);

// Get all campaigns
router.get("/", roleMiddleware(["admin", "manager"]), campaignController.getCampaigns);

// Create a new campaign (Admin and Manager only)
router.post("/", roleMiddleware(["admin", "manager"]), campaignController.createCampaign);

// Get a specific campaign
router.get("/:id", roleMiddleware(["admin", "manager"]), campaignController.getCampaignById);

// Update a campaign
router.put("/:id", roleMiddleware(["admin", "manager"]), campaignController.updateCampaign);

// Delete a campaign
router.delete("/:id", roleMiddleware(["admin"]), campaignController.deleteCampaign);

// Assign users to campaign
router.post("/:id/assign-users", roleMiddleware(["admin"]), campaignController.assignUsersToCampaign);

// Remove users from campaign
router.delete("/:id/remove-users", roleMiddleware(["admin"]), campaignController.removeUsersFromCampaign);

module.exports = router;
