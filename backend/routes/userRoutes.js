const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/auth");
const roleMiddleware = require("../middlewares/role");

// Register a new user
router.post("/register", userController.registerUser);

// Login a user
router.post("/login", userController.loginUser);

// Get all users
router.get("/", authMiddleware, roleMiddleware(['admin']), userController.getUsers);

// Get a user by ID
router.get('/:id', authMiddleware, roleMiddleware(['admin']), userController.getUserById);

// Update a user
router.put("/:id", authMiddleware, roleMiddleware(['admin']), userController.updateUser);

// Update a role
router.put("/update-role/:id", userController.updateUserRole);

// Delete a user
router.delete("/:id", authMiddleware, roleMiddleware(['admin']), userController.deleteUser);

module.exports = router;
