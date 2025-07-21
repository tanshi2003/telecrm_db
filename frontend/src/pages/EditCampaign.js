import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import BackButton from "../components/BackButton";

const EditCampaign = () => {
  const { id } = useParams(); // Get the campaign ID from the URL
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch campaigns when the component is mounted
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/campaigns`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data?.data) {
          setCampaigns(response.data.data);
          const campaignToEdit = response.data.data.find(
            (campaign) => campaign.id === parseInt(id)
          );
          if (campaignToEdit) {
             const processedCampaign = {
            ...campaignToEdit,
            start_date: campaignToEdit.start_date
              ? campaignToEdit.start_date.slice(0, 10)
              : "",
            end_date: campaignToEdit.end_date
              ? campaignToEdit.end_date.slice(0, 10)
              : "",
          };
           setSelectedCampaign(processedCampaign);
          setEditForm(processedCampaign);
        } else {
          navigate("/admin/campaigns");
        }
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };
    fetchCampaigns();
  }, [id, navigate]);

  // Handle dropdown closing when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle form change when editing
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission for updating the campaign
  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/campaigns/${editForm.id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedCampaigns = campaigns.map((campaign) =>
        campaign.id === editForm.id ? response.data.data || editForm : campaign
      );
      setCampaigns(updatedCampaigns);
      setSelectedCampaign(response.data.data || editForm);
      setIsEditing(false);
      alert("Campaign updated successfully!");
    } catch (error) {
      alert("Failed to update campaign.");
      console.error("Update error:", error.response?.data || error.message);
    }
  };

  // Handle edit button click
  const handleEditCampaign = () => {
    setIsEditing(true);
    setDropdownOpen(false);
  };

  // Handle campaign selection from list
  const handleSelectCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setIsEditing(false);
  };

  // Handle deleting a campaign
  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/campaigns/${campaignId}`, {
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

  return (
    <div className="flex min-h-screen bg-white font-sans text-gray-800">
      <Sidebar role={user?.role || "admin"} />
      <div className="ml-64 flex-grow">
        <Navbar />
        {/* Add BackButton and title */}
        <div className="flex justify-between items-center p-4 mt-16 mb-2">
          <h1 className="text-2xl font-bold text-gray-800">Edit Campaign</h1>
          <BackButton />
        </div>
        <div className="flex h-[calc(100vh-8rem)]">
          {/* Campaign List */}
          <div className="w-1/3 bg-gray-50 p-4 overflow-y-auto border-r">
            <h2 className="text-xl font-bold mb-4">Campaigns</h2>
            {loading ? (
              <p>Loading...</p>
            ) : campaigns.length === 0 ? (
              <p>No campaigns found.</p>
            ) : (
              <div className="space-y-3">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    onClick={() => handleSelectCampaign(campaign)}
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
            {selectedCampaign ? (
              isEditing ? (
                <form onSubmit={handleEditFormSubmit} className="border p-6 rounded shadow mb-4 space-y-4">
  <h3 className="text-lg font-semibold text-purple-600 mb-4">Edit Campaign</h3>
  {/* Name */}
  <div className="space-y-2">
    <label className="block text-sm capitalize">Name</label>
    <input
      type="text"
      name="name"
      value={editForm.name || ""}
      onChange={handleEditFormChange}
      className="w-full border rounded p-3 text-sm"
      required
    />
  </div>
  {/* Description */}
  <div className="space-y-2">
    <label className="block text-sm capitalize">Description</label>
    <input
      type="text"
      name="description"
      value={editForm.description || ""}
      onChange={handleEditFormChange}
      className="w-full border rounded p-3 text-sm"
      required
    />
  </div>
  {/* Status Dropdown */}
  <div className="space-y-2">
    <label className="block text-sm capitalize">Status</label>
    <select
      name="status"
      value={editForm.status || ""}
      onChange={handleEditFormChange}
      className="w-full border rounded p-3 text-sm"
      required
    >
      <option value="">Select Status</option>
      <option value="Active">Active</option>
      <option value="Inactive">Inactive</option>
    </select>
  </div>
  {/* Priority Dropdown */}
  <div className="space-y-2">
    <label className="block text-sm capitalize">Priority</label>
    <select
      name="priority"
      value={editForm.priority || ""}
      onChange={handleEditFormChange}
      className="w-full border rounded p-3 text-sm"
      required
    >
      <option value="">Select Priority</option>
      <option value="Low">Low</option>
      <option value="Medium">Medium</option>
      <option value="High">High</option>
    </select>
  </div>
  {/* Start Date */}
  <div className="space-y-2">
    <label className="block text-sm capitalize">Start Date</label>
    <input
      type="date"
      name="start_date"
      value={editForm.start_date ? editForm.start_date.slice(0, 10) : ""}
      onChange={handleEditFormChange}
      className="w-full border rounded p-3 text-sm"
      required
    />
  </div>
  {/* End Date */}
  <div className="space-y-2">
    <label className="block text-sm capitalize">End Date</label>
    <input
      type="date"
      name="end_date"
      value={editForm.end_date ? editForm.end_date.slice(0, 10) : ""}
      onChange={handleEditFormChange}
      className="w-full border rounded p-3 text-sm"
      required
    />
  </div>
  <div className="flex gap-4 mt-4">
    <button
      type="submit"
      className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 w-full sm:w-auto"
    >
      Save Changes
    </button>
    <button
      type="button"
      onClick={() => setIsEditing(false)}
      className="px-6 py-3 bg-gray-400 text-white rounded-md hover:bg-gray-500 w-full sm:w-auto"
    >
      Cancel
    </button>
  </div>
</form>
              ) : (
                <div className="space-y-2 relative border rounded p-6 shadow">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-700">{selectedCampaign.name}</h3>
                    {/* Dropdown ... */}
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
              <p className="text-gray-600">Select a campaign to edit.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCampaign;
