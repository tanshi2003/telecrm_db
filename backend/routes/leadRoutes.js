const express = require("express");
const router = express.Router();
const leadController = require("../controllers/leadController");
const { authenticateToken } = require("../middlewares/auth");
const roleMiddleware = require("../middlewares/role");

// Protected routes - require authentication
router.use(authenticateToken);

// 🆕 Create a new lead
router.post("/", roleMiddleware(['admin', 'user', 'caller']), leadController.createLead);

// 📋 Get all leads
router.get("/", roleMiddleware(['admin', 'user', 'caller']), leadController.getLeads);

// 🔍 Get lead by ID
router.get("/:id", roleMiddleware(['admin', 'user', 'caller']), leadController.getLeadById);

// ✏️ Update a lead
router.put("/:id", roleMiddleware(['admin', 'user', 'caller']), leadController.updateLead);

// ❌ Delete a lead (Admins only)
router.delete("/:id", roleMiddleware(['admin']), leadController.deleteLead);

// Bulk operations
router.post("/bulk-create", roleMiddleware(['admin']), leadController.bulkCreateLeads);
router.put("/bulk-update", roleMiddleware(['admin']), leadController.bulkUpdateLeads);
router.delete("/bulk-delete", roleMiddleware(['admin']), leadController.bulkDeleteLeads);

// New route for getting user lead counts
router.get("/user/:userId/lead-counts", leadController.getUserLeadCounts);

module.exports = router;
