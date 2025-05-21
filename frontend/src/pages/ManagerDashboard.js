import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { Users, Phone, Mail, Calendar, Activity, Briefcase, BarChart2, UserCheck, Target, UserCog, MapPin, Clock, Filter } from "lucide-react";
import { getDashboardStats, getTeamPerformance, getCampaignPerformance } from "../services/managerService";

const ManagerDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalTeamMembers: 0,
    activeTeamMembers: 0,
    totalCampaigns: 0,
    activeCampaigns: 0
  });
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [campaignStats, setCampaignStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (!storedUser || !token) {
          throw new Error("Authentication required");
        }

        setUser(storedUser);

        // Fetch all dashboard data in parallel
        const [dashboardStats, teamStats, campaignData] = await Promise.all([
          getDashboardStats(),
          getTeamPerformance(),
          getCampaignPerformance()
        ]);

        setStats(dashboardStats.data);
        setTeamPerformance(teamStats.data);
        setCampaignStats(campaignData.data);
      } catch (err) {
        console.error("Error in dashboard:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-4">{error}</div>;

  return (
    <div className="relative flex min-h-screen">
      {/* Sidebar */}
      {user && <Sidebar user={user} />}

      {/* Main Content */}
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Manager Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back, {user?.name}</p>
            </div>
            <div className="flex gap-3">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                onClick={() => navigate("/manager/users")}
              >
                <UserCog size={20} />
                Manage Team
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => navigate("/manager/campaigns")}
              >
                <BarChart2 size={20} />
                Manage Campaigns
              </button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-center gap-2">
                <Users className="text-blue-500" size={20} />
                <p className="text-sm text-gray-600">Total Team Members</p>
              </div>
              <p className="text-2xl font-semibold mt-1">{stats.totalTeamMembers}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
              <div className="flex items-center gap-2">
                <Activity className="text-green-500" size={20} />
                <p className="text-sm text-gray-600">Active Team Members</p>
              </div>
              <p className="text-2xl font-semibold mt-1">{stats.activeTeamMembers}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500">
              <div className="flex items-center gap-2">
                <Target className="text-yellow-500" size={20} />
                <p className="text-sm text-gray-600">Total Campaigns</p>
              </div>
              <p className="text-2xl font-semibold mt-1">{stats.totalCampaigns}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center gap-2">
                <BarChart2 className="text-purple-500" size={20} />
                <p className="text-sm text-gray-600">Active Campaigns</p>
              </div>
              <p className="text-2xl font-semibold mt-1">{stats.activeCampaigns}</p>
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Team Performance */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserCheck className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Team Performance</h3>
                <div className="mt-2 space-y-2">
                  {teamPerformance.slice(0, 3).map(member => (
                    <div key={member.id} className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{member.name}</span>
                        <span className="font-medium">{member.conversion_rate}% conversion</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${member.conversion_rate}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span>Leads: {member.total_leads}</span>
                        <span className="mx-2">|</span>
                        <span>Converted: {member.converted_leads}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Performance */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Campaign Performance</h3>
                <div className="mt-2 space-y-2">
                  {campaignStats.slice(0, 3).map(campaign => (
                    <div key={campaign.id} className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{campaign.name}</span>
                        <span className="font-medium">{campaign.conversion_rate}% conversion</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-green-600 h-1.5 rounded-full"
                          style={{ width: `${campaign.conversion_rate}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span>Assigned to: {campaign.assigned_users} users</span>
                        <span className="mx-2">|</span>
                        <span>Total Leads: {campaign.total_leads}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Team Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Team Overview</h3>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Phone size={16} />
                      Total Team Members:
                    </span>
                    <span className="font-medium">{stats.totalTeamMembers}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Mail size={16} />
                      Active Members:
                    </span>
                    <span className="font-medium">{stats.activeTeamMembers}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Calendar size={16} />
                      Total Campaigns:
                    </span>
                    <span className="font-medium">{stats.totalCampaigns}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Clock size={16} />
                      Active Campaigns:
                    </span>
                    <span className="font-medium">{stats.activeCampaigns}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      <MapPin size={16} />
                      Team Location:
                    </span>
                    <span className="font-medium">Main Office</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-500" size={20} />
              <span className="text-sm text-gray-500">Filter Actions</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/lead-assignment')}
              className="flex items-center justify-center p-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Users className="w-5 h-5 mr-2" />
              <span>Lead Assignment</span>
            </button>
            <button
              onClick={() => navigate('/manager/teams')}
              className="flex items-center justify-center p-4 bg-blue-50 text-green-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Briefcase className="w-5 h-5 mr-2" />
              <span>Team Management</span>
            </button>
            <button
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              onClick={() => navigate("/campaign-management")}
            >
              <Target className="w-5 h-5 mr-2" />
              <span>Campaign Management</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;