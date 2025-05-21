import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Users, BarChart2, FileText } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const CampaignManagement = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/login");
      return;
    }

    setUser(storedUser);
    fetchCampaigns();
    fetchEmployees();
  }, [navigate]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !storedUser) {
        console.error('No token or user data found');
        setLoading(false);
        return;
      }

      const managerId = storedUser.id.toString().trim();

      const response = await axios.get(
        `http://localhost:5000/api/campaigns/user/${managerId}/campaigns`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success && response.data.data) {
        // Ensure we have an array of campaigns
        const campaignsData = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        
        // Add additional metrics for each campaign
        const campaignsWithMetrics = campaignsData.map(campaign => ({
          ...campaign,
          total_leads: campaign.lead_count || 0,
          conversion_rate: campaign.conversion_rate || 0,
          assigned_users: campaign.assigned_users || []
        }));

        setCampaigns(campaignsWithMetrics);
      } else {
        console.error('Invalid response format:', response.data);
        setCampaigns([]);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user'));

      if (!token || !storedUser) {
        console.error('No token or user data found');
        setLoading(false);
        return;
      }

      const managerId = storedUser.id.toString().trim();

      const response = await axios.get(
        `http://localhost:5000/api/managers/teams/${managerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const teamMembers = response.data.data?.team_members || [];
      setEmployees(Array.isArray(teamMembers) ? teamMembers : []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setEmployees([]);
    } finally {
      setLoading(false);
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

  if (loading) return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <div className="flex-grow bg-gray-100 ml-64">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          Loading...
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <div className="flex-grow bg-gray-100 ml-64">
        <Navbar />
        <div className="text-red-500 text-center mt-4 p-4">
          {error}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      {user && <Sidebar user={user} />}

      {/* Main Content */}
      <div className="flex-grow ml-64 relative">
        <div className="fixed top-0 right-0 left-64 z-50">
          <Navbar />
        </div>
        <div className="pt-16">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Campaign Management</h1>
                <p className="text-gray-600 mt-2">Manage and track your campaigns</p>
              </div>
              <button
                onClick={() => navigate('/create-campaign')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusCircle size={20} />
                Create Campaign
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-center gap-2">
                  <BarChart2 className="text-blue-500" size={20} />
                  <p className="text-sm text-gray-600">Total Campaigns</p>
                </div>
                <p className="text-2xl font-semibold mt-1">{Array.isArray(campaigns) ? campaigns.length : 0}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                <div className="flex items-center gap-2">
                  <Users className="text-green-500" size={20} />
                  <p className="text-sm text-gray-600">Active Campaigns</p>
                </div>
                <p className="text-2xl font-semibold mt-1">
                  {Array.isArray(campaigns) ? campaigns.filter(c => c.status === 'active').length : 0}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500">
                <div className="flex items-center gap-2">
                  <FileText className="text-yellow-500" size={20} />
                  <p className="text-sm text-gray-600">Total Leads</p>
                </div>
                <p className="text-2xl font-semibold mt-1">
                  {Array.isArray(campaigns) ? campaigns.reduce((sum, c) => sum + (c.total_leads || 0), 0) : 0}
                </p>
              </div>
            </div>

            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(campaigns) && campaigns.map(campaign => (
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
                      <span className="font-semibold">{campaign.total_leads}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Assigned Employees:</span>
                      <span className="font-semibold">{campaign.assigned_users?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Conversion Rate:</span>
                      <span className="font-semibold">{campaign.conversion_rate}%</span>
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
          </div>
        </div>

        {/* Assign Employees Modal */}
        {selectedCampaign && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-xl font-semibold mb-4">Assign Employees</h2>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {Array.isArray(employees) && employees.map(employee => (
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
    </div>
  );
};

export default CampaignManagement; 