import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Leads = () => {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]); // State to store leads
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    assignedTo: "",
    campaign: "",
    dateRange: { start: "", end: "" },
  });
  const navigate = useNavigate();

  // Fetch user from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.role === "admin") {
      setUser(storedUser);
    } else {
      console.error("Unauthorized access.");
    }
  }, []);

  // Ensure leads are fetched and displayed correctly
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Authentication token is missing.");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/leads", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.data) {
          setLeads(response.data.data); // Populate leads state
        } else {
          console.error("Unexpected API response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching leads:", error.response?.data || error.message);
      }
    };

    fetchLeads();
  }, []);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Filtered leads based on filters
  const filteredLeads = leads.filter((lead) => {
    return (
      (!filters.status || lead.status === filters.status) &&
      (!filters.category || lead.lead_category === filters.category) &&
      (!filters.assignedTo || lead.assigned_to === filters.assignedTo) &&
      (!filters.campaign || lead.campaign_id === filters.campaign) &&
      (!filters.dateRange.start ||
        new Date(lead.created_at) >= new Date(filters.dateRange.start)) &&
      (!filters.dateRange.end ||
        new Date(lead.created_at) <= new Date(filters.dateRange.end))
    );
  });

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Leads</h1>
          <button
            onClick={() => navigate(-1)} // Navigate back
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back
          </button>
        </div>
        <p className="text-gray-600 mb-6">Add, update, or import leads easily.</p>

        {/* Lead Actions */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Add Lead */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-lg mb-2">Add Lead</h4>
            <p className="text-sm text-gray-600 mb-4">
              Create new leads and connect with potential customers.
            </p>
            <button
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => navigate("/Lead1")}
            >
              + Add Lead
            </button>
          </div>

          {/* Update Lead */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-lg mb-2">Update Lead</h4>
            <p className="text-sm text-gray-600 mb-4">
              Modify existing lead details and track progress.
            </p>
            <button
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => navigate("/update-lead")}
            >
              + Update Lead
            </button>
          </div>

          {/* Excel Upload */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-lg mb-2">Excel Upload</h4>
            <p className="text-sm text-gray-600 mb-4">
              Import leads in bulk using an Excel file.
            </p>
            <button
              className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              onClick={() => navigate("/Excelupload")}
            >
              + Import Leads
            </button>
          </div>
        </section>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h4 className="font-semibold text-lg mb-4">Filters</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="p-2 border rounded"
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Converted">Converted</option>
            </select>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="p-2 border rounded"
            >
              <option value="">All Categories</option>
              <option value="Cold Lead">Cold Lead</option>
              <option value="Warm Lead">Warm Lead</option>
              <option value="Hot Lead">Hot Lead</option>
            </select>
            <input
              type="date"
              name="dateRange.start"
              value={filters.dateRange.start}
              onChange={handleFilterChange}
              className="p-2 border rounded"
            />
            <input
              type="date"
              name="dateRange.end"
              value={filters.dateRange.end}
              onChange={handleFilterChange}
              className="p-2 border rounded"
            />
          </div>
        </div>

        {/* Lead List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="font-semibold text-lg mb-4">Lead List</h4>
          {filteredLeads.length === 0 ? (
            <p>No leads available. Add a new lead to get started.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-2">{lead.title || "N/A"}</h3>
                  <p className="text-sm text-gray-600 mb-1">Customer Name: <strong>{lead.name || "N/A"}</strong></p>
                  <p className="text-sm text-gray-600 mb-1">Phone Number: <strong>{lead.phone_no || "N/A"}</strong></p>
                  <p className="text-sm text-gray-600 mb-1">Status: <strong>{lead.status || "N/A"}</strong></p>
                  <p className="text-sm text-gray-600 mb-1">Category: <strong>{lead.lead_category || "N/A"}</strong></p>
                  <p className="text-sm text-gray-600 mb-1">Assigned To: <strong>{lead.assigned_to || "N/A"}</strong></p>
                  <p className="text-sm text-gray-600 mb-1">Created At: {new Date(lead.created_at).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600 mb-1">Updated At: {new Date(lead.updated_at).toLocaleDateString()}</p>

                  <div className="mt-3 flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => navigate(`/leads/${lead.id}`)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/leads/edit/${lead.id}`)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => console.log("Delete lead", lead.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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

export default Leads;
