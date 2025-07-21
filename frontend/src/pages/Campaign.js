import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Campaign = () => {
  const [user, setUser] = useState(null);
  const [filters] = useState({
    status: "",
    priority: "",
    dateRange: { start: "", end: "" },
  });
  const [campaigns, setCampaigns] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAll, setShowAll] = useState(false); // <-- NEW STATE

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.role === "admin") {
      setUser(storedUser);
    } else {
      console.error("Unauthorized access.");
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/campaigns`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCampaigns(response.data.data || []);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error("Token expired or invalid. Redirecting to login.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        console.error("Error fetching campaigns:", error);
        setErrorMessage("Failed to load campaigns.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/campaigns/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      setErrorMessage("Error deleting campaign.");
    }
  };

  // ...existing code...

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesStatus = filters.status ? campaign.status === filters.status : true;
    const matchesPriority = filters.priority ? campaign.priority === filters.priority : true;

    const campaignStartDate = new Date(campaign.start_date);
    const filterStart = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
    const filterEnd = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

    const matchesDate =
      (!filterStart || campaignStartDate >= filterStart) &&
      (!filterEnd || campaignStartDate <= filterEnd);

    return matchesStatus && matchesPriority && matchesDate;
  });

  // Only show first 6 campaigns unless showAll is true
  const campaignsToShow = showAll ? filteredCampaigns : filteredCampaigns.slice(0, 6);

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Campaigns</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back
          </button>
        </div>
        <p className="text-gray-600 mb-6">Create, update, analyze, and manage campaigns.</p>

        {/* Campaign Management Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Create Campaign Card */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
            <h4 className="font-semibold text-lg mb-2">Create Campaign</h4>
            <p className="text-sm text-gray-600 mb-4">
              Launch a new campaign and set its parameters.
            </p>
            <button
              className="mt-auto w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => navigate("/admin/campaigns")}
            >
              + Create Campaign
            </button>
          </div>

          {/* Update Campaign Card */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
            <h4 className="font-semibold text-lg mb-2">Update Campaign</h4>
            <p className="text-sm text-gray-600 mb-4">
              Modify campaign details such as name or timeline.
            </p>
            <button
              className="mt-auto w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => navigate(`/admin/UpdateCampaign/${campaigns.id}`)}
            >
              + Update Campaign
            </button>
          </div>

          {/* Assign Users Card */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
            <h4 className="font-semibold text-lg mb-2">Assign Users</h4>
            <p className="text-sm text-gray-600 mb-4">
              Allocate employees to campaigns.
            </p>
            <button
              className="mt-auto w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => navigate("/assignuser")}
            >
              + Assign Users
            </button>
          </div>
        </section>

        {/* Campaign List Section */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Campaign List</h2>

          {errorMessage && (
            <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">{errorMessage}</div>
          )}

          {filteredCampaigns.length === 0 ? (
            <p>No campaigns match the current filters.</p>
          ) : (
            <>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {campaignsToShow.map((campaign) => (
    <div key={campaign.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col">
      <h3 className="text-lg font-semibold mb-2">{campaign.name}</h3>
      <p className="text-sm text-gray-600 mb-1">
        Description: <strong>{campaign.description || "N/A"}</strong>
      </p>
      <p className="text-sm text-gray-600 mb-1">
        Lead Count: <strong>{campaign.lead_count ?? campaign.leads?.length ?? "N/A"}</strong>
      </p>
      <p className="text-sm text-gray-600 mb-1">
        Status: <strong>{campaign.status || "N/A"}</strong>
      </p>
      <p className="text-sm text-gray-600 mb-1">
        Priority: <strong>{campaign.priority || "N/A"}</strong>
      </p>
      <p className="text-sm text-gray-600 mb-1">
        Start Date:{" "}
        {campaign.start_date
          ? new Date(campaign.start_date).toLocaleDateString()
          : "N/A"}
      </p>
      <p className="text-sm text-gray-600 mb-1">
        End Date:{" "}
        {campaign.end_date
          ? new Date(campaign.end_date).toLocaleDateString()
          : "N/A"}
      </p>
      {/* Edit/Delete Buttons aligned at the bottom */}
      <div className="mt-auto flex gap-2">
        <button
          onClick={() => navigate(`/admin/EditCampaign/${campaign.id}`)}
          className="mt-auto w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(campaign.id)}
          className="mt-auto w-full px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
        >
          Delete
        </button>
      </div>
    </div>
  ))}
</div>

              {!showAll && filteredCampaigns.length > 6 && (
                <div className="flex justify-center mt-6">
                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => setShowAll(true)}
                  >
                    Show All Campaigns
                  </button>
                </div>
              )}
              {showAll && filteredCampaigns.length > 6 && (
                <div className="flex justify-center mt-6">
                  <button
                    className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    onClick={() => setShowAll(false)}
                  >
                    Show Less
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Campaign;
