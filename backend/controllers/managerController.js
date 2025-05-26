const db = require('../config/db');

// Get dashboard statistics for a manager
const getDashboardStats = async (req, res) => {
  try {
    const managerId = req.params.id;

    // Get total and active/inactive users count
    const usersQuery = `
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_users
      FROM users 
      WHERE manager_id = ?
    `;
    const [usersResult] = await db.query(usersQuery, [managerId]);

    // Get total and unassigned leads count
    const leadsQuery = `
      SELECT 
        COUNT(*) as total_leads,
        SUM(CASE WHEN assigned_user_id IS NULL THEN 1 ELSE 0 END) as unassigned_leads
      FROM leads 
      WHERE manager_id = ?
    `;
    const [leadsResult] = await db.query(leadsQuery, [managerId]);

    // Get active campaigns count
    const campaignsQuery = `
      SELECT COUNT(*) as active_campaigns 
      FROM campaigns 
      WHERE manager_id = ? AND status = 'active'
    `;
    const [campaignsResult] = await db.query(campaignsQuery, [managerId]);

    const stats = {
      totalUsers: usersResult[0].total_users || 0,
      activeUsers: usersResult[0].active_users || 0,
      inactiveUsers: usersResult[0].inactive_users || 0,
      totalLeads: leadsResult[0].total_leads || 0,
      unassignedLeads: leadsResult[0].unassigned_leads || 0,
      activeCampaigns: campaignsResult[0].active_campaigns || 0
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const updateQuery = `
      UPDATE users 
      SET status = ?, 
          updated_at = NOW() 
      WHERE id = ? AND manager_id = ?
    `;
    
    await db.query(updateQuery, [status, userId, req.user.id]);

    res.json({
      success: true,
      message: 'User status updated successfully'
    });

  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

// Get users under manager
const getUsers = async (req, res) => {
  try {
    const managerId = req.user.id;
    const query = `
      SELECT 
        id, 
        name, 
        email, 
        role, 
        status,
        created_at,
        last_login
      FROM users 
      WHERE manager_id = ?
      ORDER BY created_at DESC
    `;

    const [users] = await db.query(query, [managerId]);

    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Assign lead to user
const assignLead = async (req, res) => {
  try {
    const { leadId, userId } = req.body;
    const managerId = req.user.id;

    // Verify the lead belongs to this manager
    const verifyQuery = `
      SELECT id FROM leads 
      WHERE id = ? AND manager_id = ?
    `;
    const [lead] = await db.query(verifyQuery, [leadId, managerId]);

    if (!lead.length) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found or not authorized'
      });
    }

    // Verify the user belongs to this manager
    const verifyUserQuery = `
      SELECT id FROM users 
      WHERE id = ? AND manager_id = ?
    `;
    const [user] = await db.query(verifyUserQuery, [userId, managerId]);

    if (!user.length) {
      return res.status(404).json({
        success: false,
        message: 'User not found or not authorized'
      });
    }

    // Assign the lead
    const assignQuery = `
      UPDATE leads 
      SET 
        assigned_user_id = ?,
        updated_at = NOW()
      WHERE id = ?
    `;
    await db.query(assignQuery, [userId, leadId]);

    res.json({
      success: true,
      message: 'Lead assigned successfully'
    });

  } catch (error) {
    console.error('Error assigning lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign lead'
    });
  }
};
//getCampaignsForManager.js

exports.getCampaignsForManager = async (req, res) => {
  const managerId = req.user.id; // JWT se nikalo ya req.params se aaya ho toh waisa

  try {
    const [createdCampaigns] = await db.query(
      `SELECT * FROM campaigns WHERE admin_id = ?`, [managerId]
    );

    const [assignedCampaigns] = await db.query(
      `SELECT c.* FROM campaigns c
       JOIN campaign_users cu ON c.id = cu.campaign_id
       WHERE cu.user_id = ?`, [managerId]
    );

    // Remove duplicates if any
    const campaignMap = new Map();
    [...createdCampaigns, ...assignedCampaigns].forEach(camp => {
      campaignMap.set(camp.id, camp);
    });

    const allCampaigns = Array.from(campaignMap.values());

    res.json({ success: true, campaigns: allCampaigns });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching campaigns" });
  }
};

module.exports = {
  getDashboardStats,
  updateUserStatus,
  getUsers,
  assignLead
}; 