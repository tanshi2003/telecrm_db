import api from './api';

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

// Get dashboard statistics
export const getDashboardStats = async () => {
    const response = await api.get('/api/managers/dashboard-stats');
    return response.data;
};

// Get team performance
export const getTeamPerformance = async () => {
    try {
        const response = await api.get('/api/managers/team-performance');
        console.log('Team Performance API Response:', response.data);
        
        // Ensure we have an array of team members
        if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
            console.error('Invalid team performance data format:', response.data);
            return { data: [] };
        }

        // Ensure each member has the required fields
        const processedData = response.data.data.map(member => ({
            id: member.id || 0,
            name: member.name || 'Unknown',
            total_leads_handled: parseInt(member.total_leads_handled) || 0,
            total_campaigns_handled: parseInt(member.total_campaigns_handled) || 0,
            active_campaigns: parseInt(member.active_campaigns) || 0
        }));

        return { data: processedData };
    } catch (error) {
        console.error('Error fetching team performance:', error);
        return { data: [] };
    }
};

// Get campaign performance for specific manager
export const getCampaignPerformance = async (managerId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(
            `http://localhost:5000/api/campaigns`,
            {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const responseData = await response.json();
        console.log('Raw API Response:', responseData); // Debug log

        // Map the data to match dashboard expectations
        const processedData = responseData.data?.map(campaign => ({
            id: campaign.id,
            name: campaign.name,
            status: campaign.status,
            total_leads: campaign.total_leads || 0,
            assigned_users: campaign.assigned_users || [],
            team_size: (campaign.assigned_users || []).length,
            description: campaign.description,
            priority: campaign.priority,
            start_date: campaign.start_date,
            end_date: campaign.end_date,
            created_at: campaign.created_at,
            conversion_rate: campaign.conversion_rate || 0
        })) || [];

        console.log('Processed Campaign Data:', processedData); // Debug log

        return { success: true, data: processedData };
    } catch (error) {
        console.error('Error fetching campaign performance:', error);
        return { success: false, data: [], error: error.message };
    }
};

// Get unassigned users
export const getUnassignedUsers = async () => {
    const response = await api.get('/api/managers/unassigned-users');
    return response.data;
};

// Get all teams
export const getTeams = async () => {
    try {
        const response = await api.get('/api/managers/teams');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Assign users to team
export const assignUsersToTeam = async (manager_id, user_ids) => {
    const response = await api.post('/api/managers/assign-users', { manager_id, user_ids });
    return response.data;
};

// Assign leads to team member
export const assignLeads = async (selectedMember, selectedLeads) => {
    // Ensure selectedLeads is an array
    const leadsArray = Array.isArray(selectedLeads) ? selectedLeads : [selectedLeads];
    const response = await api.post('/api/managers/assign-leads', { 
        selectedMember, 
        selectedLeads: leadsArray 
    }, getAuthHeader());
    return response.data;
};

// Get users under manager
export const getUsers = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const managerId = user.id;
    // Use the dedicated team-members endpoint
    const response = await api.get(`/api/managers/${managerId}/team-members`, getAuthHeader());
    return {
      success: true,
      data: response.data.data || []
    };
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update user status
export const updateUserStatus = async (userId, status) => {
  try {
    const response = await api.put(`/api/users/${userId}/status`, { status }, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Assign lead to user
export const assignLead = async (leadId, userId) => {
  try {
    const response = await api.post('/api/managers/leads/assign', { leadId, userId }, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get specific team by ID
export const getTeamById = async (teamId) => {
    const response = await api.get(`/api/managers/teams/${teamId}`);
    return response.data;
};

// Get unassigned leads
export const getUnassignedLeads = async () => {
    try {
        const response = await api.get('/api/managers/unassigned-leads');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};