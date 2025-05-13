import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar"; // Import Sidebar
import { FaUser, FaClipboardList } from "react-icons/fa"; // Import icons

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("users"); // Default category
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null); // For showing details of the selected user
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false); // For role change modal
  const [showCampaignsModal, setShowCampaignsModal] = useState(false); // For campaigns list modal
  const [showLeadsModal, setShowLeadsModal] = useState(false); // For leads list modal
  const [campaigns, setCampaigns] = useState([]); // Campaigns fetched from backend
  const [leads, setLeads] = useState([]); // Leads fetched from backend
  const [filteredLeads, setFilteredLeads] = useState([]); // Leads filtered for the selected user
  const [filteredCampaigns, setFilteredCampaigns] = useState([]); // Campaigns filtered for the selected user

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
      console.error("Error fetching campaigns:", error);
    }
  };

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/leads", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLeads(response.data.data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const filterCampaignsForUser = useCallback(() => {
    if (!selectedResult) return;
    const userCampaigns = campaigns.filter((campaign) => campaign.assigned_to === selectedResult.id);
    setFilteredCampaigns(userCampaigns);
  }, [campaigns, selectedResult]);

  const filterLeadsForUser = useCallback(() => {
    const userLeads = leads.filter((lead) => lead.assigned_to === selectedResult.id);
    setFilteredLeads(userLeads);
  }, [leads, selectedResult]);

  // Fetch campaigns and leads when modals are opened
  useEffect(() => {
    if (showCampaignsModal && selectedResult) filterCampaignsForUser();
  }, [showCampaignsModal, selectedResult, filterCampaignsForUser]);

  useEffect(() => {
    if (showLeadsModal && selectedResult) filterLeadsForUser();
  }, [showLeadsModal, selectedResult, filterLeadsForUser]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchCampaigns();
      await fetchLeads();
    };
    fetchData();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setErrorMessage("Please enter a search query.");
      return;
    }

    setIsLoading(true); // Start loading
    setErrorMessage(""); // Clear previous errors

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/search?query=${searchQuery}&category=${searchCategory}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setResults(response.data.results || []);
    } catch (error) {
      console.error("Error during search:", error);
      setErrorMessage("Failed to fetch search results.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleRoleChange = async (newRole) => {
    try {
      const token = localStorage.getItem("token");
      // Make the API call to update the user's role
      await axios.put(
        `http://localhost:5000/api/users/update-role/${selectedResult.id}`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Role updated successfully!");
      setShowRoleModal(false);

      // Refresh the selected result to reflect the updated role
      const updatedUserResponse = await axios.get(
        `http://localhost:5000/api/users/${selectedResult.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelectedResult(updatedUserResponse.data.user); // Update the selected user with the new data
    } catch (error) {
      console.error("Error updating role:", error.response?.data || error.message);
      alert("Failed to update role.");
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 mt-16 p-6 bg-gray-50 min-h-screen flex gap-6">
        {/* Left Section: Search and Results */}
        <div className="w-1/3 bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-blue-600 mb-6 flex items-center gap-2">
            <FaUser className="text-blue-500" /> Search
          </h1>

          {/* Search Bar */}
          <div className="flex flex-col gap-4 mb-6">
            <input
              type="text"
              placeholder="Enter search query..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="users">Users</option>
              <option value="campaigns">Campaigns</option>
              <option value="leads">Leads</option>
            </select>
            <button
              onClick={handleSearch}
              className="px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
            >
              Search
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
              {errorMessage}
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && <p className="text-gray-500">Loading...</p>}

          {/* Results */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Results</h2>
            {results.length === 0 ? (
              <p className="text-gray-500">No results found.</p>
            ) : (
              <ul className="space-y-4">
                {results.map((result, index) => (
                  <li
                    key={index}
                    className="p-4 border rounded-lg shadow-sm hover:shadow-md transition cursor-pointer bg-gray-50 hover:bg-gray-100"
                    onClick={() => setSelectedResult(result)} // Set the selected result
                  >
                    <p className="font-bold text-lg text-blue-600">{result.name}</p>
                    <p className="text-sm text-gray-600">Role: {result.role}</p>
                    <p className="text-sm text-gray-600">Email: {result.email}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Section: Details of Selected Result */}
        <div className="w-2/3 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-blue-600 mb-6">Details</h2>
          {selectedResult ? (
            <div className="space-y-4">
              <p className="font-bold text-lg">
                <span className="text-gray-700">Name:</span> {selectedResult.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Email:</span> {selectedResult.email}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Phone:</span> {selectedResult.phone_no}
              </p>
              <p
                className="text-sm text-blue-600 cursor-pointer hover:underline"
                onClick={() => setShowRoleModal(true)} // Open role change modal
              >
                Role: {selectedResult.role}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Status:</span> {selectedResult.status}
              </p>
              <p
                className="text-sm text-blue-600 cursor-pointer hover:underline"
                onClick={() => setShowCampaignsModal(true)} // Open campaigns modal
              >
                Campaigns Handled: {selectedResult.campaigns_handled}
              </p>
              <p className="text-sm text-gray-600">Performance Rating: {selectedResult.performance_rating}</p>
              <p className="text-sm text-gray-600">Manager ID: {selectedResult.manager_id || "N/A"}</p>
              <p className="text-sm text-gray-600">Location: {selectedResult.location}</p>
              <p
                className="text-sm text-blue-600 cursor-pointer hover:underline"
                onClick={() => setShowLeadsModal(true)} // Open leads modal
              >
                Total Leads: {selectedResult.total_leads}
              </p>
              <p className="text-sm text-gray-600">
                Last Login: {new Date(selectedResult.last_login).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">Select a result to view details.</p>
          )}
        </div>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Change Role</h2>
            <button
              className="block w-full p-2 mb-2 bg-gray-100 hover:bg-gray-200 rounded"
              onClick={() => handleRoleChange("caller")}
            >
              Caller
            </button>
            <button
              className="block w-full p-2 mb-2 bg-gray-100 hover:bg-gray-200 rounded"
              onClick={() => handleRoleChange("manager")}
            >
              Manager
            </button>
            <button
              className="block w-full p-2 mb-2 bg-gray-100 hover:bg-gray-200 rounded"
              onClick={() => handleRoleChange("field_employee")}
            >
              Field Employee
            </button>
            <button
              className="block w-full p-2 bg-red-500 text-white hover:bg-red-600 rounded"
              onClick={() => setShowRoleModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Leads Modal */}
      {showLeadsModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 max-h-[80vh] overflow-y-auto">
      <h3 className="text-xl font-bold mb-4">Leads Assigned</h3>
      <button
        className="absolute top-4 right-6 text-gray-500 hover:text-red-600 text-xl"
        onClick={() => setShowLeadsModal(false)}
      >
        &times;
      </button>
      {filteredLeads.length === 0 ? (
        <p className="text-gray-600">No leads assigned to this user.</p>
      ) : (
        <ul className="space-y-4">
          {filteredLeads.map((lead, index) => (
            <li key={index} className="p-4 border rounded-lg shadow-sm">
              <p className="font-semibold text-blue-600">{lead.title}</p>
              <p className="text-sm">{lead.description}</p>
              <p className="text-sm">Category: {lead.lead_category}</p>
              <p className="text-sm">Status: {lead.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
)}

      {/* Campaigns Modal */}
      {showCampaignsModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 max-h-[80vh] overflow-y-auto">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FaClipboardList className="text-blue-500" /> Campaigns Handled
      </h3>
      <button
        className="absolute top-4 right-6 text-gray-500 hover:text-red-600 text-xl"
        onClick={() => setShowCampaignsModal(false)}
      >
        &times;
      </button>
      {filteredCampaigns.length === 0 ? (
        <p className="text-gray-600">No campaigns assigned to this user.</p>
      ) : (
        <ul className="space-y-4">
          {filteredCampaigns.map((campaign, index) => (
            <li key={index} className="p-4 border rounded-lg shadow-sm">
              <p className="font-semibold text-blue-600 flex items-center gap-2">
                <FaClipboardList className="text-gray-500" /> {campaign.name}
              </p>
              <p className="text-sm text-gray-600">{campaign.description}</p>
              <p className="text-sm">Status: {campaign.status}</p>
              <p className="text-sm">Priority: {campaign.priority}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
)}

    </div>
  );
};

export default SearchPage;