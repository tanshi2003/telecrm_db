import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
// import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../context/AuthContext";
import BackButton from "../components/BackButton";

const AssignUser = () => {
  // const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignForm, setAssignForm] = useState({ userIds: [] });
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  // Fetch campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/campaigns`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data?.data && response.data.data.length > 0) {
          setCampaigns(response.data.data);
          // Fetch first campaign's details
          const firstCampaign = response.data.data[0];
          const res = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/api/campaigns/${firstCampaign.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
           const campaignData = res.data.data
          ? {
              ...res.data.data,
              start_date: res.data.data.start_date ? res.data.data.start_date.slice(0, 10) : "",
              end_date: res.data.data.end_date ? res.data.data.end_date.slice(0, 10) : "",
            }
          : firstCampaign;
        setSelectedCampaign(campaignData);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };
  fetchCampaigns();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data.data || []);
      } catch (error) {
        console.error("Error fetching users:", error.response?.data || error.message);
      }
    };
    fetchUsers();
  }, []);

  // Pre-check already assigned users when campaign changes
  useEffect(() => {
    setAssignForm({
      userIds: Array.isArray(selectedCampaign?.assigned_users)
        ? selectedCampaign.assigned_users.map(u => u.id)
        : []
    });
  }, [selectedCampaign]);

  // Only show users with role 'caller', 'field_employee', or 'manager'
  const assignableUsers = users.filter(
    (u) => u.role === "caller" || u.role === "field_employee" || u.role === "manager"
  );

  // Handle checkbox change for multiple users
  const handleAssignFormChange = (e) => {
    const userId = parseInt(e.target.value);
    setAssignForm((prev) => {
      if (e.target.checked) {
        // Add user
        return { userIds: [...prev.userIds, userId] };
      } else {
        // Remove user
        return { userIds: prev.userIds.filter((id) => id !== userId) };
      }
    });
  };

  // Submit assignment using assigned_users array as per your backend requirement
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/campaigns/${selectedCampaign.id}/assign-users`,
        { user_ids: assignForm.userIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("User(s) assigned successfully!");
      setIsAssigning(false);

      // Fetch updated campaign details from backend
      const updatedCampaignRes = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/campaigns/${selectedCampaign.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedCampaign(updatedCampaignRes.data.data);

    } catch (error) {
      alert("Failed to assign user(s).");
      console.error("Assign error:", error.response?.data || error.message);
    }
  };

  const handleCampaignSelect = async (campaign) => {
    setIsAssigning(false);
    setDetailsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/campaigns/${campaign.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.data) {
        const campaignData = {
          ...res.data.data,
          assigned_users: Array.isArray(res.data.data.assigned_users) ? res.data.data.assigned_users : []
        };
        setSelectedCampaign(campaignData);
      } else {
        const campaignData = {
          ...campaign,
          assigned_users: Array.isArray(campaign.assigned_users) ? campaign.assigned_users : []
        };
        setSelectedCampaign(campaignData);
      }
    } catch (error) {
      const campaignData = {
        ...campaign,
        assigned_users: Array.isArray(campaign.assigned_users) ? campaign.assigned_users : []
      };
      setSelectedCampaign(campaignData);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-gray-800">
      <Sidebar role={user?.role || "admin"} />
      <div className="ml-64 flex-grow">
        <Navbar />
        {/* BackButton at the top, like other pages */}
        <div className="flex items-center justify-between mt-4 mb-2 px-6">
          <BackButton />
        </div>
        <div className="flex h-[calc(100vh-4rem)] mt-4">
          {/* Campaign List */}
          <div className="w-1/3 bg-gray-50 p-4 overflow-y-auto border-r">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Campaigns</h2>
            </div>
            {loading ? (
              <p>Loading campaigns...</p>
            ) : campaigns.length === 0 ? (
              <p>No campaigns found.</p>
            ) : (
              <div className="space-y-3">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    onClick={() => handleCampaignSelect(campaign)}
                    className={`p-3 rounded shadow cursor-pointer ${
                      selectedCampaign?.id === campaign.id
                        ? "bg-blue-100 border-l-4 border-blue-500"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <p className="font-semibold text-blue-600">{campaign.name}</p>
                    <p className="text-xs">{campaign.description}</p>
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
            {/* BackButton at top right corner and always visible */}
            <div className="absolute top-4 right-6 z-20">
              <BackButton />
            </div>
            {detailsLoading ? (
              <div className="flex justify-center items-center h-full">
                <p>Loading campaign details...</p>
              </div>
            ) : selectedCampaign ? (
              <>
                <div className="space-y-2 relative border rounded p-4 shadow mb-4 mt-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-700">{selectedCampaign.name}</h3>
                  </div>
                  <p><strong>Description:</strong> {selectedCampaign.description || 'No description'}</p>
                  <p><strong>Status:</strong> {selectedCampaign.status || 'Not set'}</p>
                  <p><strong>Priority:</strong> {selectedCampaign.priority || 'Not set'}</p>
                  <p><strong>Lead Count:</strong> {selectedCampaign.lead_count || selectedCampaign.leads?.length || 0}</p>
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
                  <p>
                    <strong>Users Assigned:</strong>{" "}
                    {Array.isArray(selectedCampaign.assigned_users) ? (
                      selectedCampaign.assigned_users.length > 0 ? (
                        selectedCampaign.assigned_users.map(user => user.name).join(", ")
                      ) : (
                        "No users assigned"
                      )
                    ) : (
                      "Unable to load assigned users"
                    )}
                  </p>
                </div>

                <div className="mt-4">
                  {!isAssigning ? (
                    <button
                      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => setIsAssigning(true)}
                    >
                      Assign User
                    </button>
                  ) : (
                    <form onSubmit={handleAssignSubmit} className="border p-4 rounded shadow space-y-3 mt-4 bg-gray-50">
                      <div>
                        <label className="block text-sm mb-1">Select Users to Assign</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2 bg-white">
                          {assignableUsers.map((u) => (
                            <label key={u.id} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                value={u.id}
                                checked={assignForm.userIds.includes(u.id)}
                                onChange={handleAssignFormChange}
                                className="accent-blue-600"
                              />
                              <span>
                                {u.name}
                                {u.role === "manager" && (
                                  <span className="ml-2 px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded">
                                    Manager
                                  </span>
                                )}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Assign
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAssigning(false)}
                          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </>
            ) : (
              <p className="text-gray-500">Select a campaign to view details.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignUser;