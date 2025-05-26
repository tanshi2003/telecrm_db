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
    const response = await api.get('/api/managers/team-performance');
    return response.data;
};

// Get campaign performance
export const getCampaignPerformance = async () => {
    const response = await api.get('/api/managers/campaign-performance');
    return response.data;
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

// Assign leads to caller
export const assignLeads = async (caller_id, lead_ids) => {
    const response = await api.post('/api/managers/assign-leads', { caller_id, lead_ids });
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