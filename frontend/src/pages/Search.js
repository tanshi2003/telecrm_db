import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar"; // Import Sidebar
import { FaUser, FaClipboardList, FaListAlt } from "react-icons/fa"; // Import icons

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("users"); // Default category
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null); // For showing details of the selected result
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLeadsModal, setShowLeadsModal] = useState(false);
  const [showCampaignsModal, setShowCampaignsModal] = useState(false);
  const [filteredLeads, setFilteredLeads] = useState([]); // Leads assigned to the user
  const [filteredCampaigns, setFilteredCampaigns] = useState([]); // Campaigns handled by the user

  const fetchLeadById = async (leadId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/leads/${leadId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Lead fetched:", response.data.data); // Debugging: Log the fetched lead
      setSelectedResult(response.data.data); // Update the selected result with lead data
    } catch (error) {
      console.error("Error fetching lead:", error.response?.data || error.message);
      alert("Failed to fetch lead details.");
    }
  };

  const fetchCampaignById = async (campaignId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/campaigns/${campaignId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Campaign fetched:", response.data.data); // Debugging: Log the fetched campaign
      setSelectedResult(response.data.data); // Update the selected result with campaign data
    } catch (error) {
      console.error("Error fetching campaign:", error.response?.data || error.message);
      alert("Failed to fetch campaign details.");
    }
  };

  const fetchLeadsForUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/users/${userId}/leads`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Leads fetched for user:", response.data.data);
      setFilteredLeads(response.data.data); // Set the leads data
      setShowLeadsModal(true); // Open the leads modal
    } catch (error) {
      console.error("Error fetching leads for user:", error.response?.data || error.message);
      alert("Failed to fetch leads.");
    }
  };

  const fetchCampaignsForUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/users/${userId}/campaigns`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Campaigns fetched for user:", response.data.data);
      setFilteredCampaigns(response.data.data); // Set the campaigns data
      setShowCampaignsModal(true); // Open the campaigns modal
    } catch (error) {
      console.error("Error fetching campaigns for user:", error.response?.data || error.message);
      alert("Failed to fetch campaigns.");
    }
  };

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
      console.log("Search results:", response.data.results); // Debugging: Log the results
      setResults(response.data.results || []);
    } catch (error) {
      console.error("Error during search:", error);
      setErrorMessage("Failed to fetch search results.");
    } finally {
      setIsLoading(false); // Stop loading
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
                    onClick={() => {
                      console.log("Clicked result:", result); // Debugging: Log the clicked result
                      if (searchCategory === "leads") {
                        fetchLeadById(result.id); // Fetch lead details
                      } else if (searchCategory === "campaigns") {
                        fetchCampaignById(result.id); // Fetch campaign details
                      } else {
                        setSelectedResult(result); // For users
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {searchCategory === "users" && <FaUser className="text-blue-500" />}
                      {searchCategory === "campaigns" && <FaClipboardList className="text-green-500" />}
                      {searchCategory === "leads" && <FaListAlt className="text-orange-500" />}
                      <p className="font-bold text-lg text-blue-600">{result.name || result.title}</p>
                    </div>
                    {searchCategory === "campaigns" ? (
                      <>
                        <p className="text-sm text-gray-600">Description: {result.description}</p>
                        <p className="text-sm text-gray-600">Status: {result.status}</p>
                      </>
                    ) : searchCategory === "leads" ? (
                      <>
                        <p className="text-sm text-gray-600">Assigned To: {result.assigned_to_name || "N/A"}</p>
                        <p className="text-sm text-gray-600">Status: {result.status}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600">Role: {result.role}</p>
                        <p className="text-sm text-gray-600">Email: {result.email}</p>
                      </>
                    )}
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
              {console.log("Selected result:", selectedResult)} {/* Debugging: Log the selected result */}
              {searchCategory === "users" ? (
                <>
                  <p className="font-bold text-lg">
                    <span className="text-gray-700">Name:</span> {selectedResult.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Email:</span> {selectedResult.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Phone:</span> {selectedResult.phone_no}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Role:</span> {selectedResult.role}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Location:</span> {selectedResult.location}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Last Login:</span> {selectedResult.last_login ? new Date(selectedResult.last_login).toLocaleString() : "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Total Leads:</span> {selectedResult.total_leads}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Campaigns Handled:</span> {selectedResult.campaigns_handled || "N/A"}
                  </p>
                </>
              ) : searchCategory === "leads" ? (
                <>
                  <p className="font-bold text-lg">
                    <span className="text-gray-700">Title:</span> {selectedResult.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Description:</span> {selectedResult.description}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Status:</span> {selectedResult.status}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Category:</span> {selectedResult.lead_category}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Assigned To:</span> {selectedResult.assigned_to_name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Notes:</span> {selectedResult.notes || "N/A"}
                  </p>
                </>
              ) : searchCategory === "campaigns" ? (
                <>
                  <p className="font-bold text-lg">
                    <span className="text-gray-700">Name:</span> {selectedResult.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Description:</span> {selectedResult.description}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Status:</span> {selectedResult.status}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Priority:</span> {selectedResult.priority}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Lead Count:</span> {selectedResult.lead_count}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Start Date:</span> {selectedResult.start_date ? new Date(selectedResult.start_date).toLocaleDateString() : "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">End Date:</span> {selectedResult.end_date ? new Date(selectedResult.end_date).toLocaleDateString() : "N/A"}
                  </p>
                </>
              ) : (
                <p className="text-gray-500">No details available.</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Select a result to view details.</p>
          )}
        </div>
      </div>

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
            <h3 className="text-xl font-bold mb-4">Campaigns Handled</h3>
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
                    <p className="font-semibold text-blue-600">{campaign.name}</p>
                    <p className="text-sm">{campaign.description}</p>
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