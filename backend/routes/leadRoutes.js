const express = require("express");
const router = express.Router();
const leadController = require("../controllers/leadController");
const authMiddleware = require("../middlewares/auth");
const roleMiddleware = require("../middlewares/role");

// 🆕 Create a new lead
router.post("/", authMiddleware, roleMiddleware(['admin', 'user']), leadController.createLead);

// 📋 Get all leads
router.get("/", authMiddleware, roleMiddleware(['admin', 'user']), leadController.getLeads);

// 🔍 Get lead by ID
router.get("/:id", authMiddleware, roleMiddleware(['admin', 'user']), leadController.getLeadById);

// ✏️ Update a lead
router.put("/:id", authMiddleware, roleMiddleware(['admin', 'user']), leadController.updateLead);

// ❌ Delete a lead (Admins only)
router.delete("/:id", authMiddleware, roleMiddleware(['admin']), leadController.deleteLead);

module.exports = router;
