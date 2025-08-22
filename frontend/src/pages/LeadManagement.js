import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Filter, UserPlus, FileText, MessageSquare } from 'lucide-react';

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    assignedTo: 'all',
    campaign: 'all'
  });
  const [employees, setEmployees] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
    fetchEmployees();
    fetchCampaigns();
  }, [filters]);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('token');
      const managerId = JSON.parse(localStorage.getItem('user')).id;

      const queryParams = new URLSearchParams({
        status: filters.status,
        assignedTo: filters.assignedTo,
        campaign: filters.campaign
      }).toString();

      const response = await axios.get(
         `${process.env.REACT_APP_API_BASE_URL}/managers/${managerId}/leads?${queryParams}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLeads(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const managerId = JSON.parse(localStorage.getItem('user')).id;

      const response = await axios.get(
         `${process.env.REACT_APP_API_BASE_URL}/managers/${managerId}/team`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEmployees(response.data.data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
         `${process.env.REACT_APP_API_BASE_URL}/campaigns`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCampaigns(response.data.data);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
    }
  };

  const handleAssignLeads = async (employeeId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
         `${process.env.REACT_APP_API_BASE_URL}/leads/assign`,
        {
          leadIds: selectedLeads,
          employeeId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh leads after assignment
      fetchLeads();
      setSelectedLeads([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign leads');
    }
  };

  const handleAddNote = async (leadId, note) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
         `${process.env.REACT_APP_API_BASE_URL}/leads/${leadId}/notes`,
        { note },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh leads to show new note
      fetchLeads();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add note');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-4">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lead Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/add-lead')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <UserPlus size={20} />
            Add Lead
          </button>
          {selectedLeads.length > 0 && (
            <button
              onClick={() => navigate('/bulk-assign', { state: { leads: selectedLeads } })}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Assign Selected ({selectedLeads.length})
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-gray-500" />
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="border rounded-md px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="follow-up">Follow Up</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>

          <select
            value={filters.assignedTo}
            onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value }))}
            className="border rounded-md px-3 py-2"
          >
            <option value="all">All Employees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>

          <select
            value={filters.campaign}
            onChange={(e) => setFilters(prev => ({ ...prev, campaign: e.target.value }))}
            className="border rounded-md px-3 py-2"
          >
            <option value="all">All Campaigns</option>
            {campaigns.map(camp => (
              <option key={camp.id} value={camp.id}>{camp.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedLeads(leads.map(lead => lead.id));
                    } else {
                      setSelectedLeads([]);
                    }
                  }}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Assigned To</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Campaign</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Last Contact</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leads.map(lead => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(lead.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLeads(prev => [...prev, lead.id]);
                      } else {
                        setSelectedLeads(prev => prev.filter(id => id !== lead.id));
                      }
                    }}
                  />
                </td>
                <td className="px-4 py-3">{lead.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                    lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                    lead.status === 'follow-up' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-4 py-3">{lead.assignedTo}</td>
                <td className="px-4 py-3">{lead.campaign}</td>
                <td className="px-4 py-3">{new Date(lead.lastContact).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/lead/${lead.id}`)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                    >
                      <FileText size={18} />
                    </button>
                    <button
                      onClick={() => {
                        const note = prompt('Enter note:');
                        if (note) handleAddNote(lead.id, note);
                      }}
                      className="p-1 text-gray-600 hover:text-gray-800"
                    >
                      <MessageSquare size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadManagement; 