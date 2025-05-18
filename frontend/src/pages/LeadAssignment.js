import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";
import { Users, Search, Filter } from "lucide-react";
import { getUnassignedLeads, assignLeads } from "../services/managerService";
import toast from "react-hot-toast";

const LeadAssignment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leads, setLeads] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
  });

  // Get the selected user ID from navigation state if it exists
  const selectedUserId = location.state?.selectedUserId;

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await getUnassignedLeads();
      setLeads(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch leads");
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignLeads = async () => {
    if (!selectedUserId) {
      toast.error("Please select a team member first");
      return;
    }

    if (selectedLeads.length === 0) {
      toast.error("Please select at least one lead");
      return;
    }

    try {
      await assignLeads(selectedUserId, selectedLeads);
      toast.success("Leads assigned successfully");
      setSelectedLeads([]);
      fetchLeads(); // Refresh the leads list
    } catch (err) {
      toast.error(err.message || "Failed to assign leads");
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.title?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filters.status === "all" || lead.status === filters.status;
    const matchesCategory = filters.category === "all" || lead.lead_category === filters.category;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Lead Assignment</h1>
          <BackButton />
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <Filter size={20} className="text-gray-500" />
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="lost">Lost</option>
              </select>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leads List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold">Available Leads</h2>
            </div>
            {selectedLeads.length > 0 && (
              <button
                onClick={handleAssignLeads}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Assign Selected ({selectedLeads.length})
              </button>
            )}
          </div>

          {error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No leads available for assignment</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className={`border rounded-lg p-4 ${
                    selectedLeads.includes(lead.id)
                      ? "border-blue-500 bg-blue-50"
                      : "hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{lead.title || "Untitled Lead"}</h3>
                      <p className="text-sm text-gray-600">{lead.name}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLeads([...selectedLeads, lead.id]);
                        } else {
                          setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                        }
                      }}
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-500">Phone:</span>{" "}
                      {lead.phone_no || "N/A"}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Category:</span>{" "}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        lead.lead_category === "hot"
                          ? "bg-red-100 text-red-800"
                          : lead.lead_category === "warm"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {lead.lead_category || "N/A"}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Status:</span>{" "}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        lead.status === "new"
                          ? "bg-green-100 text-green-800"
                          : lead.status === "contacted"
                          ? "bg-blue-100 text-blue-800"
                          : lead.status === "qualified"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {lead.status || "N/A"}
                      </span>
                    </p>
                    {lead.notes && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        <span className="text-gray-500">Notes:</span> {lead.notes}
                      </p>
                    )}
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

export default LeadAssignment; 