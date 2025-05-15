import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const ManageCampaigns = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "",
    priority: "",
    start_date: "",
    end_date: "",
    leads: [], // <-- selected lead IDs
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [leads, setLeads] = useState([]); // <-- all leads from DB

  const navigate = useNavigate();

  // Fetch all leads on mount
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/leads", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeads(response.data.data || []);
      } catch (error) {
        console.error("Error fetching leads:", error);
      }
    };
    fetchLeads();
  }, []);

  // Utility: Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      status: "",
      priority: "",
      start_date: "",
      end_date: "",
      leads: [],
    });
    setIsEditing(false);
    setEditId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle lead checkbox change
  const handleLeadCheckbox = (leadId) => {
    setFormData((prev) => {
      const leads = prev.leads.includes(leadId)
        ? prev.leads.filter((id) => id !== leadId)
        : [...prev.leads, leadId];
      return { ...prev, leads };
    });
  };

  const validateForm = () => {
    const { name, description, status, priority, start_date, leads } = formData;
    return name && description && status && priority && start_date && leads.length > 0;
  };

  const handleAddCampaign = async () => {
    // Set lead_count automatically
    const submitData = { ...formData, lead_count: formData.leads.length.toString() };

    if (!validateForm()) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/campaigns", submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      resetForm();
      toast.success("Campaign created successfully!");

      setTimeout(() => {
        navigate("/admin/campaigns1");
      }, 2000);
    } catch (error) {
      console.error("Error adding campaign:", error);
      toast.error("Failed to add campaign.");
    }
  };

  const handleEditCampaign = (id) => {
    setIsEditing(true);
    setEditId(id);
  };

  const handleUpdateCampaign = async () => {
    const submitData = { ...formData, lead_count: formData.leads.length.toString() };
    try {
      await axios.put(`/api/campaigns/${editId}`, submitData);
      resetForm();
      setSuccessMessage("Campaign updated successfully!");
    } catch (error) {
      console.error("Error updating campaign:", error);
      setErrorMessage("Failed to update campaign.");
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Create Campaigns</h1>
          <BackButton />
        </div>

        {/* Feedback messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">
            {errorMessage}
          </div>
        )}

        {/* Campaign Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? "Edit Campaign" : "Add Campaign"}
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Campaign Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="Enter campaign name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="description">
              Campaign Description<span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              rows="3"
              placeholder="Enter description"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="status">
              Status<span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Lead selection with checkboxes */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Select Leads<span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2 bg-gray-50">
              {leads.map(lead => (
                <label key={lead.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={lead.id}
                    checked={formData.leads.includes(lead.id)}
                    onChange={() => handleLeadCheckbox(lead.id)}
                    className="accent-blue-600"
                  />
                  <span>{lead.name} ({lead.phone_no})</span>
                </label>
              ))}
            </div>
            <small className="text-gray-500">Select one or more leads for this campaign.</small>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="priority">
              Priority<span className="text-red-500">*</span>
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="start_date">
              Start Date<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="end_date">
              End Date
            </label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
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
        </div>

        {/* Toast Notifications */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default ManageCampaigns;
