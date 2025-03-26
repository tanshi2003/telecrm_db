const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaignController");
const authMiddleware = require("../middlewares/auth");
const roleMiddleware = require("../middlewares/role");

// Get all campaigns
router.get("/", authMiddleware, roleMiddleware(['admin']), campaignController.getCampaigns);

// Create a new campaign
router.post("/", authMiddleware, roleMiddleware(['admin']), campaignController.createCampaign);

// Update a campaign
router.put("/:id", authMiddleware, roleMiddleware(['admin']), campaignController.updateCampaign);

// Delete a campaign
router.delete("/:id", authMiddleware, roleMiddleware(['admin']), campaignController.deleteCampaign);

module.exports = router;