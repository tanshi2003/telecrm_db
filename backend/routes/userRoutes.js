const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticateToken } = require("../middlewares/auth");
const roleMiddleware = require("../middlewares/role");
const User = require("../models/user");

// Public routes
router.post("/login", userController.loginUser);
router.post("/forgot-password", userController.forgotPassword);

// Protected routes (require authentication)
router.use(authenticateToken);

// Get unassigned users (users without managers) - Must be before /:id routes
router.get("/unassigned", roleMiddleware(['admin', 'manager']), userController.getUnassignedUsers);

// Get all managers
router.get("/managers", roleMiddleware(['admin']), userController.getManagers);

// Admin only routes
router.post("/register", roleMiddleware(['admin']), userController.registerUser);
router.get("/", roleMiddleware(['admin']), userController.getUsers);

// Routes with :id parameter
router.get("/:id", roleMiddleware(['admin']), userController.getUserById);
router.put("/:id", roleMiddleware(['admin']), userController.updateUser);
router.delete("/:id", roleMiddleware(['admin']), userController.deleteUser);

// User status management
router.put("/bulk-status", roleMiddleware(['admin']), userController.updateBulkStatus);
router.put("/:id/status", roleMiddleware(['admin']), userController.updateUserStatus);

// Role management
router.put("/:id/role", roleMiddleware(['admin']), userController.updateUserRole);

// Manager assignment
router.put("/:id/assign-manager", roleMiddleware(['admin']), userController.assignManager);

// User statistics
router.get("/:id/stats", roleMiddleware(['admin']), userController.getUserStats);
router.get("/:id/leads", roleMiddleware(['admin']), userController.getLeadsByUserId);
router.get("/:id/campaigns", roleMiddleware(['admin']), userController.getCampaignsByUserId);

module.exports = router;
