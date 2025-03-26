const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const authMiddleware = require("../middlewares/auth");
const roleMiddleware = require("../middlewares/role");

// Get all employees
router.get("/", authMiddleware, roleMiddleware(['admin']), employeeController.getEmployees);

// Create a new employee
router.post("/", authMiddleware, roleMiddleware(['admin']), employeeController.createEmployee);

// Update an employee
router.put("/:id", authMiddleware, roleMiddleware(['admin']), employeeController.updateEmployee);

// Delete an employee
router.delete("/:id", authMiddleware, roleMiddleware(['admin']), employeeController.deleteEmployee);

module.exports = router;