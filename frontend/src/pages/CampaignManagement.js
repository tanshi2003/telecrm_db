import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Users, BarChart2, FileText } from 'lucide-react';

const CampaignManagement = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
    fetchEmployees();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const managerId = JSON.parse(localStorage.getItem('user')).id;

      const response = await axios.get(
        `http://localhost:5000/api/managers/${managerId}/campaigns`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCampaigns(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const managerId = JSON.parse(localStorage.getItem('user')).id;

      const response = await axios.get(
        `http://localhost:5000/api/managers/${managerId}/team`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEmployees(response.data.data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const handleAssignEmployee = async (campaignId, employeeId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/campaigns/${campaignId}/assign`,
        { employeeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh campaigns after assignment
      fetchCampaigns();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign employee');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-4">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campaign Management</h1>
        <button
          onClick={() => navigate('/create-campaign')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusCircle size={20} />
          Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{campaign.name}</h3>
                <p className="text-sm text-gray-500">{campaign.description}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                campaign.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {campaign.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Leads:</span>
                <span className="font-semibold">{campaign.totalLeads}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Assigned Employees:</span>
                <span className="font-semibold">{campaign.assignedEmployees?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Conversion Rate:</span>
                <span className="font-semibold">{campaign.conversionRate}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold mb-2">Lead Distribution</h4>
              <div className="flex items-center gap-2">
                <div className="h-2 rounded-full bg-red-400" style={{ width: `${campaign.coldLeadsPercentage}%` }} />
                <div className="h-2 rounded-full bg-yellow-400" style={{ width: `${campaign.warmLeadsPercentage}%` }} />
                <div className="h-2 rounded-full bg-green-400" style={{ width: `${campaign.hotLeadsPercentage}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Cold ({campaign.coldLeadsPercentage}%)</span>
                <span>Warm ({campaign.warmLeadsPercentage}%)</span>
                <span>Hot ({campaign.hotLeadsPercentage}%)</span>
              </div>
            </div>

            <div className="mt-4 space-x-2">
              <button
                onClick={() => setSelectedCampaign(campaign.id)}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Assign Employees
              </button>
              <button
                onClick={() => navigate(`/campaign/${campaign.id}`)}
                className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Assign Employees Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-4">Assign Employees</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {employees.map(employee => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-gray-500">{employee.role}</p>
                  </div>
                  <button
                    onClick={() => handleAssignEmployee(selectedCampaign, employee.id)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Assign
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedCampaign(null)}
              className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManagement; 