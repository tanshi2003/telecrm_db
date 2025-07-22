import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch user details
        const userResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/${id}`, { headers });
        setUser(userResponse.data.data);

        // Fetch all leads
        const leadsResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/leads`, { headers });
        setLeads(leadsResponse.data.data || []);

        // Fetch all campaigns
        const campaignsResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/campaigns`, { headers });
        setCampaigns(campaignsResponse.data.data || []);

        // Fetch user's assigned leads
        const userLeadsResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/${id}/leads`, { headers });
        setSelectedLeads(userLeadsResponse.data.data || []);

        // Fetch user's assigned campaigns
        const userCampaignsResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/${id}/campaigns`, { headers });
        setSelectedCampaigns(userCampaignsResponse.data.data || []);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleLeadChange = (leadId) => {
    setSelectedLeads(prev => {
      if (prev.includes(leadId)) {
        return prev.filter(id => id !== leadId);
      } else {
        return [...prev, leadId];
      }
    });
  };

  const handleCampaignChange = (campaignId) => {
    setSelectedCampaigns(prev => {
      if (prev.includes(campaignId)) {
        return prev.filter(id => id !== campaignId);
      } else {
        return [...prev, campaignId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/users/${id}`,
        {
          ...user,
          assigned_leads: selectedLeads,
          assigned_campaigns: selectedCampaigns
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert("User updated successfully!");
      navigate("/admin/users");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit User</h1>
          <BackButton />
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          {/* Basic User Information */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block font-semibold mb-2">Name</label>
              <input
                type="text"
                value={user?.name || ""}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* Leads Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Assigned Leads</h2>
            <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto">
              {leads.map(lead => (
                <div key={lead.id} className="flex items-center space-x-2 p-2 border rounded">
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(lead.id)}
                    onChange={() => handleLeadChange(lead.id)}
                    className="h-4 w-4"
                  />
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-gray-600">{lead.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campaigns Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Assigned Campaigns</h2>
            <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto">
              {campaigns.map(campaign => (
                <div key={campaign.id} className="flex items-center space-x-2 p-2 border rounded">
                  <input
                    type="checkbox"
                    checked={selectedCampaigns.includes(campaign.id)}
                    onChange={() => handleCampaignChange(campaign.id)}
                    className="h-4 w-4"
                  />
                  <div>
                    <p className="font-medium">{campaign.name}</p>
                    <p className="text-sm text-gray-600">{campaign.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser; 