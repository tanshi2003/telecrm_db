import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
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
    });
    setIsEditing(false);
    setEditId(null);
  };

  // Fetch users on load
  useEffect(() => {
    fetchUsers();
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

  const handleEditUser = (id) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
      phone_no: user.phone_no || "",
      password: "", // Don't prefill password for security
      manager_id: user.manager_id || "",
      location: user.location || "",
      total_leads: user.total_leads || "",
      campaigns_handled: user.campaigns_handled || "",
      total_working_hours: user.total_working_hours || "",
    });
    setIsEditing(true);
    setEditId(id);
  };

  // Uncomment and use this function for updating users
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/users/${editId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
              <input
                type="text"
                className="form-control mb-2"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Name"
                required
              />
              <input
                type="email"
                className="form-control mb-2"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email"
                required
              />
              <input
                type="text"
                className="form-control mb-2"
                name="phone_no"
                value={formData.phone_no}
                onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })}
                placeholder="Phone Number"
              />
              <select
                className="form-control mb-2"
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
              <input
                type="text"
                className="form-control mb-2"
                name="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Location"
              />
              <input
                type="number"
                className="form-control mb-2"
                name="manager_id"
                value={formData.manager_id}
                onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                placeholder="Manager ID"
              />
              <input
                type="number"
                className="form-control mb-2"
                name="total_leads"
                value={formData.total_leads}
                onChange={(e) => setFormData({ ...formData, total_leads: e.target.value })}
                placeholder="Total Leads"
              />
              <input
                type="number"
                className="form-control mb-2"
                name="campaigns_handled"
                value={formData.campaigns_handled}
                onChange={(e) => setFormData({ ...formData, campaigns_handled: e.target.value })}
                placeholder="Campaigns Handled"
              />
              <input
                type="text"
                className="form-control mb-2"
                name="total_working_hours"
                value={formData.total_working_hours}
                onChange={(e) => setFormData({ ...formData, total_working_hours: e.target.value })}
                placeholder="Total Working Hours"
              />
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
