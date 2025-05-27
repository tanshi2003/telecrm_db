const express = require("express");
const router = express.Router();
const leadController = require("../controllers/leadController");
const { authenticateToken } = require("../middleware/auth");
const roleMiddleware = require("../middleware/checkRole");

// Protected routes - require authentication
router.use(authenticateToken);

// 🆕 Create a new lead
router.post("/", roleMiddleware(['admin', 'user', 'caller', 'manager', 'field_employee']), leadController.createLead);

// 📋 Get all leads
router.get("/", roleMiddleware(['admin', 'user', 'caller', 'manager', 'field_employee']), leadController.getLeads);

// 🔍 Get lead by ID
router.get("/:id", roleMiddleware(['admin', 'user', 'caller', 'field_employee']), leadController.getLeadById);

// ✏️ Update a lead
router.put("/:id", roleMiddleware(['admin', 'user', 'caller', 'field_employee', 'manager']), leadController.updateLead);

// ❌ Delete a lead (Admins only)
router.delete("/:id", roleMiddleware(['admin']), leadController.deleteLead);

// New route for getting user lead counts
router.get("/user/:userId/lead-counts", leadController.getUserLeadCounts);

// Add lead for all users (caller, field_employee only)
router.post("/add-lead", roleMiddleware(['caller', 'field_employee']), leadController.addLeadForAllUsers);

// Assign campaign to a lead (manager only)
router.post("/assign-campaign", roleMiddleware(['manager']), leadController.assignCampaignToLead);
// Assign user to a lead (manager only)
router.post("/assign-user", roleMiddleware(['manager']), leadController.assignUserToLead);
module.exports = router;
