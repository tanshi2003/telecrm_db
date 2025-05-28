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

// Get campaign performance
export const getCampaignPerformance = async () => {
    try {
        const response = await api.get('/api/campaigns', getAuthHeader());
        return response.data;
    } catch (error) {
        console.error('Error fetching campaign performance:', error);
        throw error;
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
    const response = await api.get('/api/managers/teams', getAuthHeader());
    // The teams endpoint returns data in a different format, so we need to extract the team members
    const managerId = JSON.parse(localStorage.getItem('user')).id;
    const managerTeam = response.data.data.find(team => team.manager_id === managerId);
    return {
      success: true,
      data: managerTeam ? managerTeam.team_members : []
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