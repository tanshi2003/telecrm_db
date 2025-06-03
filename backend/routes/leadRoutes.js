const express = require("express");
const router = express.Router();
const leadController = require("../controllers/leadController");
const { authenticateToken } = require("../middleware/auth");
const roleMiddleware = require("../middleware/checkRole");
const db = require("../config/db");
const Activity = require("../models/Activity"); // Import Activity model

// Protected routes - require authentication
router.use(authenticateToken);

// Get lead distribution statistics
router.get("/stats/distribution", authenticateToken, async (req, res) => {
    try {
        // Query to get overall lead distribution
        const query = `
            SELECT status, COUNT(*) as count
            FROM leads
            WHERE 1=1
            ${req.user.role === 'manager' 
                ? 'AND (manager_id = ? OR assigned_to IN (SELECT id FROM users WHERE manager_id = ?))' 
                : req.user.role !== 'admin' 
                    ? 'AND assigned_to = ?' 
                    : ''}
            GROUP BY status
        `;

        const params = req.user.role === 'manager' 
            ? [req.user.id, req.user.id]
            : req.user.role !== 'admin' 
                ? [req.user.id]
                : [];

        const [results] = await db.promise().query(query, params);
        
        // Format the response
        res.json({
            success: true,
            message: "Lead distribution fetched successfully",
            data: {
                overallDistribution: results.reduce((acc, curr) => ({
                    ...acc,
                    [curr.status]: curr.count
                }), {})
            }
        });
    } catch (error) {
        console.error("Error fetching lead distribution:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching lead distribution",
            error: error.message
        });
    }
});

// Create a new lead
router.post(
    "/",
    roleMiddleware(['admin', 'user', 'caller', 'manager', 'field_employee']),
    leadController.createLead
);

// 📋 Get all leads
router.get("/", roleMiddleware(['admin', 'user', 'caller', 'manager', 'field_employee']), leadController.getLeads);

// 🔍 Get lead by ID
router.get("/:id", roleMiddleware(['admin', 'user', 'caller', 'field_employee']), leadController.getLeadById);

// ✏️ Update a lead
router.put(
    "/:id",
    roleMiddleware(['admin', 'user', 'caller', 'field_employee', 'manager']),
    leadController.updateLead
);

// ❌ Delete a lead (Admins only)
router.delete("/:id", roleMiddleware(['admin', 'manager']), leadController.deleteLead);

// New route for getting user lead counts
router.get("/user/:userId/lead-counts", leadController.getUserLeadCounts);

// Add lead for all users (caller, field_employee only)
router.post("/add-lead", roleMiddleware(['caller', 'field_employee']), leadController.addLeadForAllUsers);

// Assign campaign to a lead (manager only)
router.post("/assign-campaign", roleMiddleware(['manager']), leadController.assignCampaignToLead);
// Assign user to a lead (manager only)
router.post("/assign-user", roleMiddleware(['manager']), leadController.assignUserToLead);

// Update the assigned leads route
router.get("/assigned/:userId", authenticateToken, (req, res) => {
    const userId = req.params.userId;
    const userRole = req.user.role;
    
    // Log request details for debugging
    console.log('Request:', { userId, userRole });

    // Only allow users to fetch their own leads unless they're admin/manager
    if (userRole !== 'admin' && userRole !== 'manager' && parseInt(userId) !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: "You can only view your own assigned leads"
        });
    }

    const query = `
        SELECT 
            l.*,
            COALESCE(COUNT(DISTINCT c.id), 0) as call_count,
            u.name as assigned_to_name,
            cr.name as created_by_name,
            ca.name as campaign_name
        FROM leads l
        LEFT JOIN calls c ON l.id = c.lead_id
        LEFT JOIN users u ON l.assigned_to = u.id
        LEFT JOIN users cr ON l.created_by = cr.id
        LEFT JOIN campaigns ca ON l.campaign_id = ca.id
        WHERE l.assigned_to = ?
        GROUP BY l.id
        ORDER BY l.updated_at DESC
    `;

    db.query(query, [userId], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({
                success: false,
                message: "Error fetching leads",
                error: error.message
            });
        }

        console.log(`Found ${results?.length || 0} leads for user ${userId}`);

        res.json({
            success: true,
            data: results || []
        });
    });
});

module.exports = router;
