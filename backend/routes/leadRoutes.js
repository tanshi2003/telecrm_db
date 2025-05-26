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
router.put("/:id", roleMiddleware(['admin', 'user', 'caller', 'field_employee']), leadController.updateLead);

// ❌ Delete a lead (Admins only)
router.delete("/:id", roleMiddleware(['admin']), leadController.deleteLead);

// New route for getting user lead counts
router.get("/user/:userId/lead-counts", leadController.getUserLeadCounts);

// Add lead for all users (manager, caller, field_employee)
router.post("/add-lead", roleMiddleware(['manager', 'caller', 'field_employee', 'user']), leadController.addLeadForAllUsers);

module.exports = router;
