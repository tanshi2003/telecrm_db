import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";

const ManageCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "",
    priority: "",
    start_date: "",
    end_date: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Utility: Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      status: "",
      priority: "",
      start_date: "",
      end_date: "",
    });
    setIsEditing(false);
    setEditId(null);
  };

  // Fetch campaigns on load
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/campaigns", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCampaigns(response.data.data || []);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error("Token expired or invalid. Redirecting to login.");
        localStorage.removeItem("token"); // Clear the token
        window.location.href = "/login"; // Redirect to login page
      } else {
        console.error("Error fetching campaigns:", error);
        setErrorMessage("Failed to load campaigns.");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { name, description, status, priority, start_date } = formData;
    return name && description && status && priority && start_date;
  };

  const handleAddCampaign = async () => {
    if (!validateForm()) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/campaigns", formData, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      });
      fetchCampaigns();
      resetForm();
      setSuccessMessage("Campaign created successfully!");
    } catch (error) {
      console.error("Error adding campaign:", error);
      setErrorMessage("Failed to add campaign.");
    }
  };

  const handleEditCampaign = (id) => {
    const campaign = campaigns.find((c) => c.id === id);
    if (!campaign) return;
    setFormData({ ...campaign });
    setIsEditing(true);
    setEditId(id);
  };

  const handleUpdateCampaign = async () => {
    try {
      await axios.put(`/api/campaigns/${editId}`, formData);
      fetchCampaigns();
      resetForm();
      setSuccessMessage("Campaign updated successfully!");
    } catch (error) {
      console.error("Error updating campaign:", error);
      setErrorMessage("Failed to update campaign.");
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await axios.delete(`/api/campaigns/${id}`);
      fetchCampaigns();
      setSuccessMessage("Campaign deleted successfully!");
    } catch (error) {
      console.error("Error deleting campaign:", error);
      setErrorMessage("Failed to delete campaign.");
    }
  };

  // Success & Error notification timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 3000);
    return () => clearTimeout(timer);
  }, [successMessage, errorMessage]);

  return (
    <div className="flex">
      <Sidebar user={{ name: "Admin", role: "admin" }} />

      <div className="flex-1 ml-64 mt-16 p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Manage Campaigns</h1>

        <BackButton />

        {/* Feedback messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">
            {successMessage}
          </div>
        )}
        {errorMessage && <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">{errorMessage}</div>}

        {/* Campaign Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">{isEditing ? "Edit Campaign" : "Add Campaign"}</h2>

          <input type="text" name="name" placeholder="Campaign Name" value={formData.name} onChange={handleInputChange} className="w-full p-2 mb-4 border rounded" />
          <textarea name="description" placeholder="Campaign Description" value={formData.description} onChange={handleInputChange} className="w-full p-2 mb-4 border rounded" />
          <select name="status" value={formData.status} onChange={handleInputChange} className="w-full p-2 mb-4 border rounded">
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full p-2 mb-4 border rounded">
            <option value="">Select Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} className="w-full p-2 mb-4 border rounded" />
          <input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} className="w-full p-2 mb-4 border rounded" />

          {isEditing ? (
            <button onClick={handleUpdateCampaign} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Update Campaign</button>
          ) : (
            <button onClick={handleAddCampaign} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Campaign</button>
          )}
        </div>

        {/* Campaign List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Campaign List</h2>
          {campaigns.length === 0 ? (
            <p>No campaigns available. Add a new campaign to get started.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-2">{campaign.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">Description: <strong>{campaign.description || "N/A"}</strong></p>
                  <p className="text-sm text-gray-600 mb-1">Status: <strong>{campaign.status || "N/A"}</strong></p>
                  <p className="text-sm text-gray-600 mb-1">Priority: <strong>{campaign.priority || "N/A"}</strong></p>
                  <p className="text-sm text-gray-600 mb-1">Start Date: {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : "N/A"}</p>
                  <p className="text-sm text-gray-600 mb-1">End Date: {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : "N/A"}</p>

                  <div className="mt-3 flex gap-2 justify-center">
                    <button
                      onClick={() => handleEditCampaign(campaign.id)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCampaigns;
