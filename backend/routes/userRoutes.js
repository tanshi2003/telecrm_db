const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticateToken } = require("../middleware/auth");
const roleMiddleware = require("../middleware/checkRole");
const User = require("../models/user");
const Activity = require("../models/Activity");

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

// User management
router.get("/", roleMiddleware(['admin', 'manager', 'caller', 'field_employee']), userController.getUsers);

// Routes with :id parameter
router.get("/:id", roleMiddleware(['admin']), userController.getUserById);
router.put("/:id", roleMiddleware(['admin']), userController.updateUser);
router.delete("/:id", roleMiddleware(['admin']), userController.deleteUser);

// User status management
router.put("/bulk-status", roleMiddleware(['admin']), userController.updateBulkStatus);
router.put("/:id/status", roleMiddleware(['admin']), userController.updateUserStatus);

// Role management
router.put("/:id/role", roleMiddleware(['admin']), async (req, res) => {
    try {
        const result = await userController.updateUserRole(req.params.id, req.body.role);

        // Log role update activity
        await Activity.logActivity(
            req.user.id,
            req.user.role,
            'user_role_update',
            `Updated user #${req.params.id} role to ${req.body.role}`,
            'user',
            req.params.id,
            null
        );

        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Manager assignment
router.put("/:id/assign-manager", roleMiddleware(['admin']), userController.assignManager);
router.put("/:id/remove-manager", roleMiddleware(['admin']), userController.removeManager);

// User statistics
router.get("/:id/stats", roleMiddleware(['admin', 'field_employee','caller']), userController.getUserStats);
router.get("/:id/leads", roleMiddleware(['admin', 'field_employee','caller']), userController.getLeadsByUserId);
router.get("/:id/campaigns", roleMiddleware(['admin', 'field_employee']), userController.getCampaignsByUserId);

module.exports = router;
