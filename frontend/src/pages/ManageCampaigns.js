import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const ManageCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]); // List of campaigns
  const [formData, setFormData] = useState({ name: "", description: "", status: "", priority: "", start_date: "", end_date: "" }); // Form data
  const [isEditing, setIsEditing] = useState(false); // Track if editing
  const [editId, setEditId] = useState(null); // Track the campaign being edited

  // Fetch campaigns on component mount
  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Fetch all campaigns
  const fetchCampaigns = async () => {
    try {
      const response = await axios.get("/api/campaigns");
      setCampaigns(response.data.data); // Assuming the API response contains campaigns in `data.data`
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Add a new campaign
  const handleAddCampaign = async () => {
    if (!formData.name || !formData.description || !formData.status || !formData.priority || !formData.start_date) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      await axios.post("/api/campaigns", formData);
      fetchCampaigns(); // Refresh the campaign list
      setFormData({ name: "", description: "", status: "", priority: "", start_date: "", end_date: "" });
    } catch (error) {
      console.error("Error adding campaign:", error);
    }
  };

  // Edit an existing campaign
  const handleEditCampaign = (id) => {
    const campaign = campaigns.find((c) => c.id === id);
    setFormData({
      name: campaign.name,
      description: campaign.description,
      status: campaign.status,
      priority: campaign.priority,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
    });
    setIsEditing(true);
    setEditId(id);
  };

  // Update a campaign
  const handleUpdateCampaign = async () => {
    try {
      await axios.put(`/api/campaigns/${editId}`, formData);
      fetchCampaigns(); // Refresh the campaign list
      setFormData({ name: "", description: "", status: "", priority: "", start_date: "", end_date: "" });
      setIsEditing(false);
      setEditId(null);
    } catch (error) {
      console.error("Error updating campaign:", error);
    }
  };

  // Delete a campaign
  const handleDeleteCampaign = async (id) => {
    try {
      await axios.delete(`/api/campaigns/${id}`);
      fetchCampaigns(); // Refresh the campaign list
    } catch (error) {
      console.error("Error deleting campaign:", error);
    }
  };

  return (
    <div className="ml-64 mt-16 p-6 bg-gray-100 min-h-screen">
        
      {/* Sidebar */}
      <Sidebar user={admin} />
      <h1 className="text-3xl font-bold mb-6">Manage Campaigns</h1>

      {/* Campaign Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">{isEditing ? "Edit Campaign" : "Add Campaign"}</h2>
        <input
          type="text"
          name="name"
          placeholder="Campaign Name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full p-2 mb-4 border rounded"
        />
        <textarea
          name="description"
          placeholder="Campaign Description"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="text"
          name="status"
          placeholder="Status"
          value={formData.status}
          onChange={handleInputChange}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="text"
          name="priority"
          placeholder="Priority"
          value={formData.priority}
          onChange={handleInputChange}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="date"
          name="start_date"
          placeholder="Start Date"
          value={formData.start_date}
          onChange={handleInputChange}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="date"
          name="end_date"
          placeholder="End Date"
          value={formData.end_date}
          onChange={handleInputChange}
          className="w-full p-2 mb-4 border rounded"
        />
        {isEditing ? (
          <button
            onClick={handleUpdateCampaign}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Update Campaign
          </button>
        ) : (
          <button
            onClick={handleAddCampaign}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Campaign
          </button>
        )}
      </div>

      {/* Campaign List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Campaign List</h2>
        {campaigns.length === 0 ? (
          <p>No campaigns available. Add a new campaign to get started.</p>
        ) : (
          <ul>
            {campaigns.map((campaign) => (
              <li key={campaign.id} className="mb-4 border-b pb-4">
                <h3 className="text-lg font-semibold">{campaign.name}</h3>
                <p>{campaign.description}</p>
                <p>Status: {campaign.status}</p>
                <p>Priority: {campaign.priority}</p>
                <p>Start Date: {campaign.start_date}</p>
                <p>End Date: {campaign.end_date}</p>
                <div className="mt-2">
                  <button
                    onClick={() => handleEditCampaign(campaign.id)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManageCampaigns;
