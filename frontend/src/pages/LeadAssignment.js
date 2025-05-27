import React, { useState, useEffect } from 'react';
import { getUnassignedLeads, getUsers, assignLeads } from '../services/managerService';
import { Search, X, UserPlus, ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const LeadAssignment = () => {
  const [unassignedLeads, setUnassignedLeads] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leadsResponse, teamResponse] = await Promise.all([
        getUnassignedLeads(),
        getUsers()
      ]);

      setUnassignedLeads(leadsResponse.data);
      setTeamMembers(teamResponse.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSelect = (leadId) => {
    setSelectedLeads(prev => {
      if (prev.includes(leadId)) {
        return prev.filter(id => id !== leadId);
      }
      return [...prev, leadId];
    });
  };

  const handleAssignLeads = async () => {
    if (!selectedMember || selectedLeads.length === 0) {
      setError('Please select a team member and at least one lead');
      return;
    }

    try {
      await assignLeads(selectedMember, selectedLeads);
      setSuccess('Leads assigned successfully');
      setSelectedLeads([]);
      setSelectedMember('');
      fetchData(); // Refresh the leads list
    } catch (err) {
      setError(err.message || 'Failed to assign leads');
    }
  };

  const filteredLeads = unassignedLeads.filter(lead => {
    const matchesSearch = lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone?.includes(searchTerm) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="relative flex min-h-screen">
      {/* Sidebar */}
      {user && <Sidebar user={user} />}

      {/* Main Content */}
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">        {/* Header with Back Button */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Lead Assignment</h1>
            <p className="text-gray-600">Assign unassigned leads to your team members</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600"
          >
            Back
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <div className="flex items-center">
              <AlertCircle className="mr-2" size={20} />
              {error}
            </div>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search leads by name, phone, or email..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-48">
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
            </select>
          </div>
        </div>

        {/* Assignment Controls */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Team Member</label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
              >
                <option value="">Choose a team member...</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
                onClick={handleAssignLeads}
                disabled={!selectedMember || selectedLeads.length === 0}
              >
                <UserPlus className="inline-block mr-2" size={20} />
                Assign Selected Leads
              </button>
              <button
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center"
                onClick={() => {
                  setSelectedLeads([]);
                  setSelectedMember('');
                }}
              >
                <X className="inline-block mr-2" size={20} />
                Clear Selection
              </button>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedLeads.length === filteredLeads.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLeads(filteredLeads.map(lead => lead.id));
                      } else {
                        setSelectedLeads([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => handleLeadSelect(lead.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lead.phone}</div>
                    <div className="text-sm text-gray-500">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${lead.status === 'new' ? 'bg-green-100 text-green-800' : 
                        lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLeads.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No unassigned leads found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadAssignment; 