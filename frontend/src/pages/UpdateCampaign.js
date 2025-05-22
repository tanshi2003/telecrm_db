import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../context/AuthContext";
import BackButton from "../components/BackButton";

const UpdateCampaign = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const { user } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/campaigns", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data?.data) {
          // Remove time from start_date and end_date for all campaigns
          const processedCampaigns = response.data.data.map(c => ({
            ...c,
            start_date: c.start_date ? c.start_date.slice(0, 10) : "",
            end_date: c.end_date ? c.end_date.slice(0, 10) : "",
          }));
          setCampaigns(processedCampaigns);
          setSelectedCampaign(processedCampaigns[0]);
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/campaigns/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedCampaigns = campaigns.filter((campaign) => campaign.id !== campaignId);
      setCampaigns(updatedCampaigns);
      setSelectedCampaign(updatedCampaigns.length > 0 ? updatedCampaigns[0] : null);
      setIsEditing(false);
      alert("Campaign deleted successfully!");
    } catch (error) {
      alert("Failed to delete campaign.");
      console.error("Delete error:", error.response?.data || error.message);
    }
  };

  const handleEditCampaign = () => {
    // Remove time from dates before editing
    setEditForm({
      ...selectedCampaign,
      start_date: selectedCampaign.start_date ? selectedCampaign.start_date.slice(0, 10) : "",
      end_date: selectedCampaign.end_date ? selectedCampaign.end_date.slice(0, 10) : "",
    });
    setIsEditing(true);
    setDropdownOpen(false);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/campaigns/${editForm.id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove time from dates in updated campaign
      const updatedData = response.data.data
        ? {
            ...response.data.data,
            start_date: response.data.data.start_date
              ? response.data.data.start_date.slice(0, 10)
              : "",
            end_date: response.data.data.end_date
              ? response.data.data.end_date.slice(0, 10)
              : "",
          }
        : editForm;
      const updatedCampaigns = campaigns.map((campaign) =>
        campaign.id === editForm.id ? updatedData : campaign
      );
      setCampaigns(updatedCampaigns);
      setSelectedCampaign(updatedData);
      setIsEditing(false);
      alert("Campaign updated successfully!");
    } catch (error) {
      alert("Failed to update campaign.");
      console.error("Update error:", error.response?.data || error.message);
    }
  };

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-white font-sans text-gray-800">
      <Sidebar role={user?.role || "admin"} />
      <div className="ml-64 flex-grow">
        <Navbar />
        <div className="flex h-[calc(100vh-4rem)] mt-16">
          {/* Campaign List */}
          <div className="w-1/3 bg-gray-50 p-4 overflow-y-auto border-r">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Campaigns</h2>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : campaigns.length === 0 ? (
              <p>No campaigns found.</p>
            ) : (
              <div className="space-y-3">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    onClick={() => {
                      setSelectedCampaign(campaign);
                      setIsEditing(false);
                    }}
                    className={`p-3 rounded shadow cursor-pointer ${
                      selectedCampaign?.id === campaign.id
                        ? "bg-blue-100 border-l-4 border-blue-500"
                        : "bg-white"
                    }`}
                  >
                    <p className="font-semibold text-blue-600">{campaign.name}</p>
                    <p className="text-xs">{campaign.phone_no}</p>
                    <p className="text-xs mt-1 inline-block px-2 py-0.5 bg-gray-200 rounded">
                      {campaign.status || "Fresh"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Campaign Detail Panel */}
          <div className="w-2/3 p-6 bg-white overflow-y-auto relative">
            {/* Single BackButton at top right */}
            <div className="absolute top-4 right-6 z-10">
              <BackButton />
            </div>
            {selectedCampaign ? (
              isEditing ? (
                <form onSubmit={handleEditFormSubmit} className="border p-4 rounded shadow mb-4 space-y-3">
                  <h3 className="text-lg font-semibold text-purple-600 mb-2">Edit Campaign</h3>
                  {/* Name */}
                  <div>
                    <label className="block text-sm capitalize">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name || ""}
                      onChange={handleEditFormChange}
                      className="w-full border rounded p-2"
                      required
                    />
                  </div>
                  {/* Description */}
                  <div>
                    <label className="block text-sm capitalize">Description</label>
                    <input
                      type="text"
                      name="description"
                      value={editForm.description || ""}
                      onChange={handleEditFormChange}
                      className="w-full border rounded p-2"
                      required
                    />
                  </div>
                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-sm capitalize">Status</label>
                    <select
                      name="status"
                      value={editForm.status || ""}
                      onChange={handleEditFormChange}
                      className="w-full border rounded p-2"
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  {/* Priority Dropdown */}
                  <div>
                    <label className="block text-sm capitalize">Priority</label>
                    <select
                      name="priority"
                      value={editForm.priority || ""}
                      onChange={handleEditFormChange}
                      className="w-full border rounded p-2"
                      required
                    >
                      <option value="">Select Priority</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  {/* Start Date */}
                  <div>
                    <label className="block text-sm capitalize">Start Date</label>
                    <input
                      type="date"
                      name="start_date"
                      value={editForm.start_date ? editForm.start_date.slice(0, 10) : ""}
                      onChange={handleEditFormChange}
                      className="w-full border rounded p-2"
                      required
                    />
                  </div>
                  {/* End Date */}
                  <div>
                    <label className="block text-sm capitalize">End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      value={editForm.end_date ? editForm.end_date.slice(0, 10) : ""}
                      onChange={handleEditFormChange}
                      className="w-full border rounded p-2"
                      required
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
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2 relative border rounded p-4 shadow">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-700">{selectedCampaign.name}</h3>
                    {/* Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="text-gray-600 hover:text-gray-800 text-xl"
                      >
                        ⋮
                      </button>
                      {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-28 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                          <div className="py-1">
                            <button
                              onClick={handleEditCampaign}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCampaign(selectedCampaign.id)}
                              className="block px-4 py-2 text-sm text-red-600 hover:bg-red-100 w-full text-left"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p><strong>Description:</strong> {selectedCampaign.description}</p>
                  <p><strong>Status:</strong> {selectedCampaign.status}</p>
                  <p><strong>Priority:</strong> {selectedCampaign.priority}</p>
                  <p><strong>Lead Count:</strong> {selectedCampaign.lead_count ?? selectedCampaign.leads?.length ?? "N/A"}</p>
                 <p>
  <strong>Start Date:</strong>{" "}
  {selectedCampaign.start_date
    ? new Date(selectedCampaign.start_date).toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "Not set"}
</p>
<p>
  <strong>End Date:</strong>{" "}
  {selectedCampaign.end_date
    ? new Date(selectedCampaign.end_date).toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "Not set"}
</p>

                </div>
              )
            ) : (
              <p className="text-gray-500">Select a campaign to view details.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateCampaign;
