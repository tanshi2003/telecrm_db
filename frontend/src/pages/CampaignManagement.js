import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Users, BarChart2, FileText, X, Calendar, Target, Mail, Phone } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CampaignManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [viewCampaign, setViewCampaign] = useState(null);
  const [assignLeadCampaign, setAssignLeadCampaign] = useState(null);
  const [user, setUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showColorInfo, setShowColorInfo] = useState(null); // Store campaign ID for showing color info // 'all', 'active', 'leads'
  const [showAllCampaignsModal, setShowAllCampaignsModal] = useState(false);
  const [showActiveCampaignsModal, setShowActiveCampaignsModal] = useState(false);
  const [showLeadsModal, setShowLeadsModal] = useState(false);
  const [availableLeads, setAvailableLeads] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
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
    fetchAllCampaigns();
  }, [navigate]);

  useEffect(() => {
    // Debug: log all campaigns to verify status values
    console.log('All campaigns:', allCampaigns);
  }, [allCampaigns]);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(
        `http://localhost:5000/api/campaigns/manager/${user.id}`,
        { 
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const campaignsData = response.data.data.map(campaign => ({
          ...campaign,
          total_leads: campaign.lead_count || 0,
          assigned_users: campaign.assigned_users || []
        }));
        setCampaigns(campaignsData);
        setAllCampaigns(campaignsData);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(
        `http://localhost:5000/api/campaigns/manager/${storedUser.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success && Array.isArray(response.data.data)) {
        const campaignsWithMetrics = response.data.data.map(campaign => ({
          ...campaign,
          total_leads: campaign.lead_count || 0,
          conversion_rate: campaign.conversion_rate || 0,
          assigned_users: campaign.assigned_users || [],
          manager_name: campaign.manager_name || (campaign.manager_id === storedUser.id ? storedUser.name : 'Not assigned')
        }));
        setAllCampaigns(campaignsWithMetrics);
      }
    } catch (err) {
      setAllCampaigns([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user'));

      if (!token || !storedUser) {
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
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUsers = async (campaignId, userIds) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Ensure userIds is an array
      const userIdsArray = Array.isArray(userIds) ? userIds : [userIds];

      const response = await axios.post(
        `http://localhost:5000/api/campaigns/${campaignId}/assign-users`,
        { user_ids: userIdsArray },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data.success) {
        // Refresh both campaign lists to update the UI
        await Promise.all([
          fetchCampaigns(),
          fetchAllCampaigns()
        ]);
        toast.success(response.data.message || 'Successfully added team members to campaign');
      } else {
        throw new Error(response.data.message || 'Failed to assign users');
      }
    } catch (error) {
      console.error('Error assigning users:', error);
      toast.error(error.response?.data?.message || 'Failed to assign users to campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignUser = async (campaignId, userId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:5000/api/campaigns/unassign',
        {
          campaign_id: campaignId,
          user_id: userId
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data.success) {
        await fetchCampaigns();
        toast.success('User unassigned successfully');
      }
    } catch (error) {
      console.error('Unassign error:', error);
      toast.error(error.response?.data?.message || 'Failed to unassign user');
    } finally {
      setLoading(false);
    }
  };

  // Get filtered campaigns based on active filter
  const getFilteredCampaigns = () => {
    switch (activeFilter) {
      case 'active':
        return allCampaigns.filter(campaign => 
          String(campaign.status).toLowerCase() === 'active'
        );
      case 'leads':
        return allCampaigns.filter(campaign => 
          Number(campaign.total_leads) > 0
        );
      default:
        return allCampaigns;
    }
  };

  // Handle card clicks
  const handleCardClick = (filterType) => {
    setActiveFilter(filterType);
  };

  // if (loading) return (
  //   <div className="flex min-h-screen">
  //     <Sidebar user={user} />
  //     <div className="flex-grow bg-gray-100 ml-64">
  //       <Navbar />
  //       <div className="flex justify-center items-center h-[calc(100vh-64px)]">
  //         Loading...
  //       </div>
  //     </div>
  //   </div>
  // );
  if (error) return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <div className="flex-grow bg-gray-100 ml-64">
        <Navbar />
        <div className={`text-center mt-4 p-4 ${error.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
          {error.message}
        </div>
      </div>
    </div>
  );

  // Calculate system-wide total leads from allCampaigns
  const systemWideTotalLeads = allCampaigns.reduce(
    (sum, c) => sum + (Number(c.total_leads) || 0),
    0
  );

  const filteredCampaigns = getFilteredCampaigns();

  // Add this function to fetch leads
  const fetchAvailableLeads = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(
        `http://localhost:5000/api/leads?role=manager`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      if (response.data.success) {
        // Filter out leads that are already assigned to campaigns and belong to this manager
        const unassignedLeads = response.data.data.filter(lead => 
          !lead.campaign_id && 
          lead.manager_id === storedUser.id
        );
        console.log('Available leads for assignment:', unassignedLeads);
        setAvailableLeads(unassignedLeads);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    }
  };

  // Add this function to handle lead assignment
  const handleAssignLeads = async () => {
    if (selectedLeads.length === 0) {
      toast.warning('Please select leads to assign');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/leads/assign-campaign`,
        { 
          campaignId: assignLeadCampaign,
          leadId: selectedLeads[0] // If multiple leads, we'll need to make multiple requests
        },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data.success) {
        // If there are multiple leads, handle them sequentially
        if (selectedLeads.length > 1) {
          for (let i = 1; i < selectedLeads.length; i++) {
            await axios.post(
              `http://localhost:5000/api/leads/assign-campaign`,
              { 
                campaignId: assignLeadCampaign,
                leadId: selectedLeads[i]
              },
              { 
                headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                } 
              }
            );
          }
        }

        toast.success('Leads assigned successfully');
        setAssignLeadCampaign(null);
        setSelectedLeads([]);
        // Refresh both campaign lists to update the UI
        await Promise.all([
          fetchCampaigns(),
          fetchAllCampaigns()
        ]);
      }
    } catch (error) {
      console.error('Error assigning leads:', error);
      toast.error(error.response?.data?.message || 'Failed to assign leads');
    }
  };

  // Add this computed value for filtered leads
  const filteredLeads = availableLeads.filter(lead => {
    const matchesSearch = 
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone_no?.includes(searchTerm) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || lead.status?.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

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
            <div className="flex justify-between items-center mb-6">              <div>
                <h1 className="text-2xl font-bold text-gray-800">Campaign Management</h1>
                <p className="text-gray-600 mt-2">Manage and track your campaigns</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/create-campaign-with-users')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <PlusCircle size={20} />
                  Create Campaign
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600"
                >
                  Back
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div 
                className={`bg-white rounded-lg p-4 border-l-4 border-blue-500 cursor-pointer transition-all duration-200 ${activeFilter === 'all' ? 'shadow-lg scale-105' : 'hover:shadow-md'}`}
                onClick={() => setShowAllCampaignsModal(true)}
              >
                <div className="flex items-center gap-2">
                  <BarChart2 className="text-blue-500" size={20} />
                  <p className="text-sm text-gray-600">Total Campaigns</p>
                </div>
                <p className="text-2xl font-semibold mt-1">
                  {allCampaigns.length}
                </p>
              </div>
              <div 
                className={`bg-white rounded-lg p-4 border-l-4 border-green-500 cursor-pointer transition-all duration-200 ${activeFilter === 'active' ? 'shadow-lg scale-105' : 'hover:shadow-md'}`}
                onClick={() => setShowActiveCampaignsModal(true)}
              >
                <div className="flex items-center gap-2">
                  <Users className="text-green-500" size={20} />
                  <p className="text-sm text-gray-600">Active Campaigns</p>
                </div>
                <p className="text-2xl font-semibold mt-1">
                  {allCampaigns.filter(c => String(c.status).toLowerCase() === 'active').length}
                </p>
              </div>
              <div 
                className={`bg-white rounded-lg p-4 border-l-4 border-yellow-500 cursor-pointer transition-all duration-200 ${activeFilter === 'leads' ? 'shadow-lg scale-105' : 'hover:shadow-md'}`}
                onClick={() => setShowLeadsModal(true)}
              >
                <div className="flex items-center gap-2">
                  <FileText className="text-yellow-500" size={20} />
                  <p className="text-sm text-gray-600">Total Leads</p>
                </div>
                <p className="text-2xl font-semibold mt-1">
                  {systemWideTotalLeads}
                </p>
              </div>
            </div>

            {/* Filter Status */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing: {
                  activeFilter === 'all' ? 'All Campaigns' :
                  activeFilter === 'active' ? 'Active Campaigns' :
                  'Campaigns with Leads'
                }
              </p>
            </div>

            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
              {filteredCampaigns.map(campaign => (
                <div key={campaign.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 mr-4">
                      <h3 className="text-lg font-semibold truncate">{campaign.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{campaign.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Left Column */}
                    <div className="space-y-3">
                      {/* Lead Statistics */}
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-500">Total Leads</p>
                            <p className="text-sm font-semibold">{campaign.total_leads}</p>
                    </div>
                          <div>
                            <p className="text-xs text-gray-500">Conversion</p>
                            <p className="text-sm font-semibold">{campaign.conversion_rate}%</p>
                    </div>
                    </div>
                  </div>

                      {/* Team Size */}
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Team Size</p>
                        <p className="text-sm font-semibold">{campaign.assigned_users?.length || 0} members</p>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3">
                      {/* Campaign Progress */}
                      <div className="bg-gray-50 p-2 rounded relative">
                        <p className="text-xs text-gray-500 mb-1">Campaign Progress</p>
                        {(() => {
                          const startDate = new Date(campaign.start_date);
                          const endDate = new Date(campaign.end_date);
                          const currentDate = new Date();
                          
                          const totalDuration = endDate - startDate;
                          const elapsedDuration = currentDate - startDate;
                          let progressPercentage = Math.floor((elapsedDuration / totalDuration) * 100);
                          
                          // Ensure progress is between 0 and 100
                          progressPercentage = Math.max(0, Math.min(100, progressPercentage));
                          
                          // Determine color based on progress and status
                          const getProgressColor = () => {
                            if (campaign.status === 'completed') return 'bg-green-500';
                            if (progressPercentage >= 90) return 'bg-red-500';
                            if (progressPercentage >= 75) return 'bg-yellow-500';
                            return 'bg-blue-500';
                          };

                          // Get color explanation
                          const getColorExplanation = () => {
                            if (campaign.status === 'completed') return 'Campaign is completed';
                            if (progressPercentage >= 90) return 'Urgent: Campaign is in final stage (>90% of duration)';
                            if (progressPercentage >= 75) return 'Warning: Campaign is nearing completion (>75% of duration)';
                            return 'Campaign is progressing normally';
                          };

                          const progressColor = getProgressColor();

                          return (
                            <>
                              <div 
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => setShowColorInfo(showColorInfo === campaign.id ? null : campaign.id)}
                              >
                                <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-500 ${progressColor}`}
                                    style={{ width: `${progressPercentage}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium w-9">{progressPercentage}%</span>
                              </div>
                              
                              {/* Color Explanation Tooltip */}
                              {showColorInfo === campaign.id && (
                                <div className="absolute left-0 right-0 top-full mt-2 p-2 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-3 h-3 rounded-full ${progressColor}`}></div>
                                    <p className="text-xs font-medium">{getColorExplanation()}</p>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    <p>Color indicators:</p>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <span>Normal</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                        <span>Warning</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        <span>Urgent</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span>Completed</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{startDate.toLocaleDateString()}</span>
                                <span>{endDate.toLocaleDateString()}</span>
                              </div>
                            </>
                          );
                        })()}</div>

                      {/* Campaign Type */}
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Type & Priority</p>
                        <p className="text-sm font-medium truncate">{campaign.type || 'Standard'}</p>
                        <p className={`text-xs font-medium ${
                          campaign.priority === 'high' ? 'text-red-600' :
                          campaign.priority === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {campaign.priority || 'Normal'} Priority
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-auto pt-2 border-t">
                    <button
                      onClick={() => setSelectedCampaign(campaign.id)}
                      className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Users size={14} />
                      Assign Team
                    </button>
                    <button
                      onClick={() => {
                        setAssignLeadCampaign(campaign.id);
                        fetchAvailableLeads();
                        setSelectedLeads([]);
                      }}
                      className="flex-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Target size={14} />
                      Assign Lead
                    </button>
                    <button
                      onClick={() => setViewCampaign(campaign)}
                      className="flex-1 px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <BarChart2 size={14} />
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
            <div className="bg-white rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Manage Team Members</h2>
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="text-gray-500 hover:text-gray-800 text-2xl"
                >
                  &times;
                </button>
              </div>

              {/* Currently Assigned Users Section */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Currently Assigned</h3>
                <div className="space-y-2 mb-4">
                  {campaigns
                    .find(c => c.id === selectedCampaign)
                    ?.assigned_users?.map(user => (
                      <div 
                        key={user.id}
                        className="flex items-center justify-between p-2 bg-blue-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">{user.name[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.role || 'Team Member'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnassignUser(selectedCampaign, user.id)}
                          className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                        >
                          Unassign
                        </button>
                      </div>
                    ))}
                  {!campaigns.find(c => c.id === selectedCampaign)?.assigned_users?.length && (
                    <p className="text-sm text-gray-500">No users currently assigned</p>
                  )}
                </div>
              </div>

              {/* Available Users Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Available Team Members</h3>
                <div className="space-y-2">
                  {employees
                    .filter(emp => !campaigns
                      .find(c => c.id === selectedCampaign)
                      ?.assigned_users
                      ?.some(u => u.id === emp.id)
                    )
                    .map(employee => (
                      <div
                        key={employee.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-600 font-medium">{employee.name[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium">{employee.name}</p>
                            <p className="text-xs text-gray-500">{employee.role}</p>
                          </div>
                        </div>
                        {employee.current_campaign && (
                          <div className="text-xs text-gray-500 mr-2">
                            Currently in: {employee.current_campaign}
                          </div>
                        )}
                        <button
                          onClick={() => {
                            if (employee.current_campaign) {
                              if (window.confirm(`Switch ${employee.name} from ${employee.current_campaign} to this campaign?`)) {
                                handleAssignUsers(selectedCampaign, [employee.id]);
                              }
                            } else {
                              handleAssignUsers(selectedCampaign, [employee.id]);
                            }
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          {employee.current_campaign ? 'Switch' : 'Assign'}
                        </button>
                      </div>
                    ))}
                  {!employees.filter(emp => !campaigns
                    .find(c => c.id === selectedCampaign)
                    ?.assigned_users
                    ?.some(u => u.id === emp.id)
                  ).length && (
                    <p className="text-sm text-gray-500">No available team members</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Campaign Details Modal */}
        {viewCampaign && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[800px] max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">{viewCampaign.name}</h2>
                <button
                  onClick={() => setViewCampaign(null)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Campaign Overview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Campaign Overview</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Target className="text-blue-500 w-5 h-5 mt-1" />
                      <div>
                        <p className="font-medium">Status</p>
                        <span className={`px-2 py-1 rounded-full text-xs inline-block mt-1 ${
                          viewCampaign.status === 'active' ? 'bg-green-100 text-green-800' :
                          viewCampaign.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {viewCampaign.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="text-blue-500 w-5 h-5 mt-1" />
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-sm text-gray-600">
                          {new Date(viewCampaign.start_date).toLocaleDateString()} - {new Date(viewCampaign.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="text-blue-500 w-5 h-5 mt-1" />
                      <div>
                        <p className="font-medium">Campaign Type</p>
                        <p className="text-sm text-gray-600">{viewCampaign.type || 'Standard'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lead Statistics */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Lead Statistics</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Leads</p>
                      <p className="text-2xl font-semibold text-blue-600">{viewCampaign.total_leads}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{ width: `${viewCampaign.conversion_rate || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{viewCampaign.conversion_rate || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Team Information</h3>
                  <div className="space-y-3">
                    {/* Campaign Manager */}
                    <div className="flex items-start gap-3">
                      <Phone className="text-blue-500 w-5 h-5 mt-1" />
                      <div>
                        <p className="font-medium">Campaign Manager</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-medium">
                              {viewCampaign.manager_name?.charAt(0).toUpperCase() || 'M'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{viewCampaign.manager_name || 'Not assigned'}</p>
                            <p className="text-xs text-gray-500">Campaign Manager</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Assigned Team Members */}
                    <div className="flex items-start gap-3">
                      <Users className="text-blue-500 w-5 h-5 mt-1" />
                      <div>
                        <p className="font-medium">Assigned Team Members</p>
                        <p className="text-sm text-gray-600">
                          {viewCampaign.assigned_users?.filter(user => user.id !== viewCampaign.manager_id).length || 0} members
                        </p>
                        {viewCampaign.assigned_users && viewCampaign.assigned_users.length > 0 ? (
                          <div className="mt-2 space-y-1">
                            {viewCampaign.assigned_users
                              .filter(user => user.id !== viewCampaign.manager_id)
                              .map((user) => (
                              <div key={user.id} className="flex items-center gap-2 bg-white p-2 rounded">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 text-sm font-medium">
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{user.name}</p>
                                  <p className="text-xs text-gray-500">{user.role || 'Team Member'}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 mt-1">No team members assigned yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Campaign Description */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Description</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {viewCampaign.description || 'No description available.'}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setViewCampaign(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              </div>
            </div>
          </div>
        )}

        {/* All Campaigns Modal */}
        {showAllCampaignsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto mt-12">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">All Campaigns</h2>
                <button
                  onClick={() => setShowAllCampaignsModal(false)}
                  className="text-gray-500 hover:text-gray-800 text-2xl"
                >
                  &times;
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {allCampaigns.map(campaign => (
                  <div key={campaign.id} className="border rounded-lg p-4 hover:shadow-md">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{campaign.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        campaign.status?.toLowerCase() === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Users: {campaign.assigned_users?.length || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        <span>Leads: {campaign.total_leads || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <BarChart2 className="w-4 h-4 mr-2" />
                        <span>Conversion: {campaign.conversion_rate || 0}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Campaigns Modal */}
        {showActiveCampaignsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto mt-12">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Active Campaigns</h2>
                <button
                  onClick={() => setShowActiveCampaignsModal(false)}
                  className="text-gray-500 hover:text-gray-800 text-2xl"
                >
                  &times;
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {allCampaigns
                  .filter(c => String(c.status).toLowerCase() === 'active')
                  .map(campaign => (
                    <div key={campaign.id} className="border rounded-lg p-4 hover:shadow-md">
                      {/* Same content as All Campaigns card */}
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{campaign.name}</h4>
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {campaign.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          <span>Users: {campaign.assigned_users?.length || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <Target className="w-4 h-4 mr-2" />
                          <span>Leads: {campaign.total_leads || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <BarChart2 className="w-4 h-4 mr-2" />
                          <span>Conversion: {campaign.conversion_rate || 0}%</span>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Leads Modal */}
        {showLeadsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto mt-12">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Campaign Leads Overview</h2>
                <button
                  onClick={() => setShowLeadsModal(false)}
                  className="text-gray-500 hover:text-gray-800 text-2xl"
                >
                  &times;
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {allCampaigns
                  .filter(c => c.total_leads > 0)
                  .map(campaign => (
                    <div key={campaign.id} className="border rounded-lg p-4 hover:shadow-md">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{campaign.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          campaign.status?.toLowerCase() === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Target className="w-4 h-4 mr-2" />
                          <span>Total Leads: {campaign.total_leads || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <BarChart2 className="w-4 h-4 mr-2" />
                          <span>Conversion Rate: {campaign.conversion_rate || 0}%</span>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Assign Leads Modal */}
        {assignLeadCampaign && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[800px] max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Assign Leads to Campaign</h2>
                <button
                  onClick={() => {
                    setAssignLeadCampaign(null);
                    setSelectedLeads([]);
                  }}
                  className="text-gray-500 hover:text-gray-800 text-2xl"
                >
                  &times;
                </button>
              </div>

              {/* Search and Filter */}
              <div className="mb-4 flex gap-4">
                <input
                  type="text"
                  placeholder="Search leads by name, phone, or email..."
                  className="flex-1 px-4 py-2 border rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="px-4 py-2 border rounded-lg"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="cold">Cold</option>
                  <option value="warm">Warm</option>
                  <option value="hot">Hot</option>
                </select>
              </div>

              {/* Leads List */}
              <div className="space-y-2 mb-4">
                {filteredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${
                      selectedLeads.includes(lead.id) ? 'border-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => {
                            setSelectedLeads(prev =>
                              prev.includes(lead.id)
                                ? prev.filter(id => id !== lead.id)
                                : [...prev, lead.id]
                            );
                          }}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Phone size={14} />
                              {lead.phone_no}
                            </span>
                            {lead.email && (
                              <span className="flex items-center gap-1">
                                <Mail size={14} />
                                {lead.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          lead.status?.toLowerCase() === 'hot'
                            ? 'bg-red-100 text-red-800'
                            : lead.status?.toLowerCase() === 'warm'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </div>
                  </div>
                ))}

                {filteredLeads.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No leads available
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setAssignLeadCampaign(null);
                    setSelectedLeads([]);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignLeads}
                  disabled={selectedLeads.length === 0}
                  className={`px-4 py-2 rounded text-white ${
                    selectedLeads.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Assign Selected ({selectedLeads.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignManagement;