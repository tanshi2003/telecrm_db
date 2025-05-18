const express = require("express");
const router = express.Router();
const callController = require("../controllers/callController");
const { authenticateToken } = require("../middlewares/auth");

// Protected routes - require authentication
router.use(authenticateToken);

// Create a new call
router.post("/", callController.createCall);

// Get all calls for a specific caller
router.get("/", callController.getCallsByCallerId);

// Get a specific call record
router.get("/:id", callController.getCallById);

// Update a call record
router.put("/:id", callController.updateCall);

// Get calls by caller ID (legacy endpoint)
router.get("/caller/:callerId", callController.getCallsByCaller);

// Statistics endpoints
router.get("/stats/performance/:callerId", callController.getPerformanceMetrics);
router.get("/stats/daily/:callerId", callController.getDailyStats);
router.get("/stats/best-hours/:callerId", callController.getBestCallingHours);
router.get("/stats/callback-efficiency/:callerId", callController.getCallbackEfficiency);
router.get("/stats/monthly/:callerId", callController.getMonthlyCallerStats);
router.get("/stats/caller/:callerId", callController.getCallerStats);

module.exports = router; 