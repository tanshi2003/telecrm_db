import api from './api';

// Get all campaigns
export const getAllCampaigns = async () => {
    try {
        const response = await api.get('/campaigns');
        console.log('All Campaigns Response:', response);
        return response.data;
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        throw error;
    }
};

// Get campaign details by ID
export const getCampaignById = async (campaignId) => {
    try {
         const response = await api.get(`/campaigns/${campaignId}`);
        console.log('Campaign Details Response:', response);
        return response.data;
    } catch (error) {
        console.error('Error fetching campaign details:', error);
        throw error;
    }
};

// Update campaign
export const updateCampaign = async (campaignId, campaignData) => {
    try {
         const response = await api.put(`/campaigns/${campaignId}`, campaignData);
        console.log('Update Campaign Response:', response);
        return response.data;
    } catch (error) {
        console.error('Error updating campaign:', error);
        throw error;
    }
}; 