const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticateToken } = require("../middlewares/auth");
const roleMiddleware = require("../middlewares/role");

// Public routes (no authentication required)
// Register a new admin
router.post("/register", adminController.registerAdmin);

// Login an admin
router.post("/login", adminController.loginAdmin);

// Protected routes (require authentication)
// Get all admins (admin only)
router.get("/", authenticateToken, roleMiddleware(['admin']), adminController.getAdmins);

// Update an admin (admin only)
router.put("/:id", authenticateToken, roleMiddleware(['admin']), adminController.updateAdmin);

// Delete an admin (admin only)
router.delete("/:id", authenticateToken, roleMiddleware(['admin']), adminController.deleteAdmin);

module.exports = router;
