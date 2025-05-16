import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    phone_no: "",
    password: "",
    manager_id: "",
    location: "",
    total_leads: "",
    campaigns_handled: "",
    total_working_hours: "",
    assigned_leads: [],
    assigned_campaigns: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Utility: Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
      phone_no: "",
      password: "",
      manager_id: "",
      location: "",
      total_leads: "",
      campaigns_handled: "",
      total_working_hours: "",
      assigned_leads: [],
      assigned_campaigns: []
    });
    setIsEditing(false);
    setEditId(null);
  };

  // Fetch users, leads, and campaigns on load
  useEffect(() => {
    fetchUsers();
    fetchLeadsAndCampaigns();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.data || []);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error("Token expired or invalid. Redirecting to login.");
        localStorage.removeItem("token"); // Clear the token
        window.location.href = "/login"; // Redirect to login page
      } else {
        console.error("Error fetching users:", error);
        setErrorMessage("Failed to load users.");
      }
    }
  };

  const fetchLeadsAndCampaigns = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all leads
      const leadsResponse = await axios.get('http://localhost:5000/api/leads', { headers });
      setLeads(leadsResponse.data.data || []);

      // Fetch all campaigns
      const campaignsResponse = await axios.get('http://localhost:5000/api/campaigns', { headers });
      setCampaigns(campaignsResponse.data.data || []);
    } catch (error) {
      console.error("Error fetching leads and campaigns:", error);
      setErrorMessage("Failed to load leads and campaigns.");
    }
  };

  const handleEditUser = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const user = users.find((u) => u.id === id);
      if (!user) return;

      // Fetch user's assigned leads
      const userLeadsResponse = await axios.get(`http://localhost:5000/api/users/${id}/leads`, { headers });
      const assignedLeads = userLeadsResponse.data.data || [];

      // Fetch user's assigned campaigns
      const userCampaignsResponse = await axios.get(`http://localhost:5000/api/users/${id}/campaigns`, { headers });
      const assignedCampaigns = userCampaignsResponse.data.data || [];

      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        phone_no: user.phone_no || "",
        password: "",
        manager_id: user.manager_id || "",
        location: user.location || "",
        total_leads: user.total_leads || "",
        campaigns_handled: user.campaigns_handled || "",
        total_working_hours: user.total_working_hours || "",
        assigned_leads: assignedLeads.map(lead => lead.id),
        assigned_campaigns: assignedCampaigns.map(campaign => campaign.id)
      });
      setIsEditing(true);
      setEditId(id);

      // Scroll to top of the page smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error fetching user assignments:", error);
      setErrorMessage("Failed to load user assignments.");
    }
  };

  // Uncomment and use this function for updating users
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/users/${editId}`,
        {
          ...formData,
          assigned_leads: formData.assigned_leads,
          assigned_campaigns: formData.assigned_campaigns
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
      resetForm();
      setSuccessMessage("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      setErrorMessage("Failed to update user.");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUsers();
      setSuccessMessage("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      setErrorMessage("Failed to delete user.");
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

  // Manager name nikalne ka function
  const getManagerName = (manager_id) => {
    const manager = users.find((u) => u.id === manager_id);
    return manager ? manager.name : "N/A";
  };

  return (
    <div className="flex">
      <Sidebar user={{ name: "Admin", role: "admin" }} />

      <div className="flex-1 ml-64 mt-16 p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Users</h1>
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

        {/* Edit User Form */}
        {isEditing && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Edit User</h2>
            <form onSubmit={handleUpdateUser}>
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Name"
                  required
                />
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email"
                  required
                />
                <input
                  type="text"
                  className="form-control"
                  name="phone_no"
                  value={formData.phone_no}
                  onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })}
                  placeholder="Phone Number"
                />
                <select
                  className="form-control"
                  name="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="caller">Caller</option>
                  <option value="field_employee">Field Employee</option>
                </select>
              </div>

              {/* Leads Section */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Assigned Leads</h3>
                <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                  {leads.map(lead => (
                    <div key={lead.id} className="flex items-center space-x-2 p-2 border rounded">
                      <input
                        type="checkbox"
                        checked={formData.assigned_leads.includes(lead.id)}
                        onChange={(e) => {
                          const newLeads = e.target.checked
                            ? [...formData.assigned_leads, lead.id]
                            : formData.assigned_leads.filter(id => id !== lead.id);
                          setFormData({ ...formData, assigned_leads: newLeads });
                        }}
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
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Assigned Campaigns</h3>
                <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                  {campaigns.map(campaign => (
                    <div key={campaign.id} className="flex items-center space-x-2 p-2 border rounded">
                      <input
                        type="checkbox"
                        checked={formData.assigned_campaigns.includes(campaign.id)}
                        onChange={(e) => {
                          const newCampaigns = e.target.checked
                            ? [...formData.assigned_campaigns, campaign.id]
                            : formData.assigned_campaigns.filter(id => id !== campaign.id);
                          setFormData({ ...formData, assigned_campaigns: newCampaigns });
                        }}
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

              {/* Other Fields */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  className="form-control"
                  name="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Location"
                />
                <select
                  className="form-control"
                  name="manager_id"
                  value={formData.manager_id}
                  onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                >
                  <option value="">Select Manager</option>
                  {users
                    .filter(user => user.role === "manager" && user.id !== editId)
                    .map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name}
                      </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 mt-4">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Update User
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* User List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">User List</h2>
          {users.length === 0 ? (
            <p>No users available. Add a new user to get started.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <div key={user.id} className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-2">{user.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">Email: <strong>{user.email}</strong></p>
                  <p className="text-sm text-gray-600 mb-1">Role: <strong>{user.role}</strong></p>
                  <p className="text-sm text-gray-600 mb-1">Phone: <strong>{user.phone_no}</strong></p>
                  <p className="text-sm text-gray-600 mb-1">Location: <strong>{user.location}</strong></p>
                  <p className="text-sm text-gray-600 mb-1">
                    Manager: <strong>{getManagerName(user.manager_id)}</strong>
                  </p>
                  <p className="text-sm text-gray-600 mb-1">Total Leads: <strong>{user.total_leads}</strong></p>
                  <p className="text-sm text-gray-600 mb-1">Campaigns Handled: <strong>{user.campaigns_handled}</strong></p>
                  <p className="text-sm text-gray-600 mb-1">Total Working Hours: <strong>{user.total_working_hours}</strong></p>

                  <div className="mt-3 flex gap-2 justify-center">
                    <button
                      onClick={() => handleEditUser(user.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
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

export default AllUsers;
