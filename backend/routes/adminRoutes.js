const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/auth");
const roleMiddleware = require("../middlewares/role");

// Register a new admin
router.post("/register", adminController.registerAdmin);

// Login an admin
router.post("/login", adminController.loginAdmin);

// Get all admins
router.get("/", authMiddleware, roleMiddleware(['admin']), adminController.getAdmins);

// Update an admin
router.put("/:id", authMiddleware, roleMiddleware(['admin']), adminController.updateAdmin);

// Delete an admin
router.delete("/:id", authMiddleware, roleMiddleware(['admin']), adminController.deleteAdmin);

module.exports = router;
