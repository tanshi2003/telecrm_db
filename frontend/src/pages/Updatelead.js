import api from '../config/api';
import { BASE_URL } from '../config/api'
import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../context/AuthContext";
import BackButton from "../components/BackButton";

const statusOptions = [
  "New",
  "Contacted",
  "Follow-Up Scheduled",
  "Interested",
  "Not Interested",
  "Call Back Later",
  "Under Review",
  "Converted",
  "Lost",
  "Not Reachable",
  "On Hold",
];

const categoryOptions = [
  "Fresh Lead",
  "Bulk Lead",
  "Cold Lead",
  "Warm Lead",
  "Hot Lead",
  "Converted Lead",
  "Lost Lead",
  "Walk-in Lead",
  "Re-Targeted Lead",
  "Campaign Lead",
];

const Updatelead = () => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllFields, setShowAllFields] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [users, setUsers] = useState([]); // <-- For Assigned To dropdown
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get(`${BASE_URL}/leads`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data?.data) {
          setLeads(response.data.data);
          setSelectedLead(response.data.data[0]);
        }
      } catch (error) {
        console.error("Error fetching leads:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  // Fetch users for Assigned To dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = JSON.parse(localStorage.getItem("user"));
        let endpoint = `${process.env.REACT_APP_API_BASE_URL}/users`;
        
        // If user is a manager, only fetch their team members
        if (storedUser?.role === "manager") {
           endpoint = `${process.env.REACT_APP_API_BASE_URL}/users?managerId=${storedUser.id}`;
        }

        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data?.data) {
          setUsers(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error.response?.data || error.message);
      }
    };
    fetchUsers();
  }, []);

  // Delete lead handler
  const handleDeleteLead = async (leadId) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`${BASE_URL}/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedLeads = leads.filter((lead) => lead.id !== leadId);
      setLeads(updatedLeads);
      setSelectedLead(updatedLeads.length > 0 ? updatedLeads[0] : null);
      setShowMenu(false);
    } catch (error) {
      alert("Failed to delete lead.");
      console.error("Delete error:", error.response?.data || error.message);
    }
  };

  // Edit lead handler (show form)
  const handleEditLead = (leadId) => {
    setEditForm(selectedLead); // Pre-fill form with selected lead
    setIsEditing(true);
    setShowMenu(false);
  };

  // Handle form input changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit updated lead
  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/leads/${editForm.id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Fetch the updated lead details
      const updatedLeadRes = await api.get(`/leads/${editForm.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedLead = updatedLeadRes.data.data;
      // Update local state
      const updatedLeads = leads.map((lead) =>
        lead.id === editForm.id ? updatedLead : lead
      );
      setLeads(updatedLeads);
      setSelectedLead(updatedLead);
      setIsEditing(false);
      alert("Lead updated successfully!");
    } catch (error) {
      alert("Failed to update lead.");
      console.error("Update error:", error.response?.data || error.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-gray-800">
      <Sidebar role={user?.role || "admin"} />
      <div className="ml-64 flex-grow">
        <Navbar />
        <div className="flex h-[calc(100vh-4rem)] mt-16">
          {/* Lead List */}
          <div className="w-1/3 bg-gray-50 p-4 overflow-y-auto border-r">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Leads</h2>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : leads.length === 0 ? (
              <p>No leads found.</p>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => {
                      setSelectedLead(lead);
                      setShowAllFields(false);
                      setIsEditing(false);
                    }}
                    className={`p-3 rounded shadow cursor-pointer ${
                      selectedLead?.id === lead.id
                        ? "bg-blue-100 border-l-4 border-blue-500"
                        : "bg-white"
                    }`}
                  >
                    <p className="font-semibold text-blue-600">{lead.name}</p>
                    <p className="text-xs">{lead.phone_no}</p>
                    <p className="text-xs mt-1 inline-block px-2 py-0.5 bg-gray-200 rounded">
                      {lead.status || "Fresh"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lead Detail Panel */}
          <div className="w-2/3 p-6 bg-white overflow-y-auto relative">
            {/* Move BackButton inside the detail panel, above the form/details */}
            {selectedLead && (
              <div className="mb-4 flex justify-end">
                <BackButton />
              </div>
            )}
            {selectedLead ? (
              isEditing ? (
                // --- EDIT FORM ---
                <form onSubmit={handleEditFormSubmit} className="border p-4 rounded shadow mb-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-purple-600">Edit Lead</h3>
                  </div>
                  <div>
                    <label className="block text-sm">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name || ""}
                      onChange={handleEditFormChange}
                      className="w-full border rounded p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Phone</label>
                    <input
                      type="text"
                      name="phone_no"
                      value={editForm.phone_no || ""}
                      onChange={handleEditFormChange}
                      className="w-full border rounded p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Status</label>
                    <select
                      name="status"
                      value={editForm.status || ""}
                      onChange={handleEditFormChange}
                      className="w-full border rounded p-2"
                      required
                    >
                      <option value="">Select Status</option>
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm">Category</label>
                    <select
                      name="lead_category"
                      value={editForm.lead_category || ""}
                      onChange={handleEditFormChange}
                      className="w-full border rounded p-2"
                      required
                    >
                      <option value="">Select Category</option>
                      {categoryOptions.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm">Assigned To</label>
                    <select
                      name="assigned_to"
                      value={editForm.assigned_to || ""}
                      onChange={handleEditFormChange}
                      className="w-full border rounded p-2"
                      required
                    >
                      <option value="">Select User</option>
                      {Array.isArray(users) &&
                        users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={editForm.address || ""}
                      onChange={handleEditFormChange}
                      className="w-full border rounded p-2"
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // --- EXISTING LEAD DETAILS ---
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-purple-600">{selectedLead.name}</h3>
                  </div>
                  <div className="border p-4 rounded shadow mb-4 relative">
                    {/* Top Right Icons */}
                    <div className="absolute top-2 right-2 flex space-x-3 text-gray-500">
                      {/* Removed bell icon */}
                      {/* 3-dot menu */}
                      <div className="relative">
                        <button
                          title="More"
                          className="hover:text-black text-xl"
                          onClick={() => setShowMenu((prev) => !prev)}
                        >
                          ⋮
                        </button>
                        {showMenu && (
                          <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-10">
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                              onClick={() => handleEditLead(selectedLead.id)}
                            >
                              Edit 
                            </button>
                            <button
                            className="block w-full text-left px-4 py-2 bg-indigo-500 text-white hover:bg-indigo-600"
                              onClick={() => handleDeleteLead(selectedLead.id)}
                            >
                              Delete 
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* ...rest of your lead details... */}
                    <p className="text-sm text-gray-500">Name</p>
                    <h3 className="text-lg font-semibold text-purple-600">{selectedLead.name}</h3>
                    <p className="text-sm mt-2">
                      <strong>Status:</strong>{" "}
                      <span className="inline-block px-2 py-0.5 bg-gray-200 rounded">
                        {selectedLead.status || "Fresh"}
                      </span>
                    </p>
                    {/* <div className="flex items-center mt-1 space-x-1 text-yellow-500">
                      {[...Array(5)].map((_, i) =>
                        i < (selectedLead.rating || 0) ? (
                          <FaStar key={i} />
                        ) : (
                          <FaRegStar key={i} />
                        )
                      )}
                    </div> */}
                    <p className="text-sm mt-2">
                      <strong>Phone:</strong> {selectedLead.phone_no}
                    </p>
                    <p className="text-sm">
                      <strong>Acquired:</strong>{" "}
                      {new Date(selectedLead.created_at).toLocaleString()}
                    </p>
                    <button
                      className="mt-3 text-blue-500 text-sm underline"
                      onClick={() => setShowAllFields(!showAllFields)}
                    >
                      {showAllFields ? "Hide extra fields" : "Show all fields"}
                    </button>
                    {showAllFields && (
                      <div className="mt-4 space-y-1 text-sm text-gray-700">
                        <p><strong>Created At:</strong> {selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleString() : "N/A"}</p>
                        <p><strong>Updated At:</strong> {selectedLead.updated_at ? new Date(selectedLead.updated_at).toLocaleString() : "N/A"}</p>
                        <p><strong>Category:</strong> {selectedLead.lead_category || "N/A"}</p>
                        <p><strong>Assigned To:</strong>{" "}
                            {users.find((u) => u.id === selectedLead.assigned_to)?.name || "N/A"}
                          </p>
                        <p><strong>Address:</strong> {selectedLead.address || "N/A"}</p>
                      </div>  
                    )}
                  </div>
                  {/* ...rest of your actions/history... */}
                  <div className="grid grid-cols-5 gap-4 text-center text-sm text-gray-600 mb-4">
                  </div>
                </div>
              )
            ) : (
              <p className="text-gray-500">Select a lead to view details.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Updatelead;