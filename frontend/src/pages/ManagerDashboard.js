import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { Users, FileText, BarChart2, UserCheck, Target, UserCog } from "lucide-react";
import { getDashboardStats, getTeamPerformance, getCampaignPerformance } from "../services/managerService";

const ManagerDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalCalls: 0,
    totalLeads: 0,
    activeCallers: 0,
    conversionRate: 0
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
                onClick={() => navigate("/campaign-management")}
              >
                <BarChart2 size={20} />
                Manage Campaigns
              </button>
            </div>
          </div>
          
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-sm text-gray-600">Total Calls Today</p>
              <p className="text-2xl font-semibold mt-1">{stats.totalCalls}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
              <p className="text-sm text-gray-600">Active Callers</p>
              <p className="text-2xl font-semibold mt-1">{stats.activeCallers}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500">
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-2xl font-semibold mt-1">{stats.totalLeads}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-semibold mt-1">{stats.conversionRate}%</p>
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
                        <span className="font-medium">{member.completed_calls}/{member.total_calls} calls</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
                          style={{ width: `${(member.completed_calls/member.total_calls * 100) || 0}%` }}
                        ></div>
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Today's Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart2 className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Today's Overview</h3>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Calls:</span>
                    <span className="font-medium">{stats.totalCalls}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Active Callers:</span>
                    <span className="font-medium">{stats.activeCallers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Conversion Rate:</span>
                    <span className="font-medium">{stats.conversionRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <UserCog className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
            </div>
            <p className="text-gray-600 mb-4">Manage team members and monitor performance.</p>
            <button
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => navigate("/manager/users")}
            >
              Manage Team
            </button>
          </div>

          {/* Lead Assignment */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-green-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Lead Assignment</h2>
            </div>
            <p className="text-gray-600 mb-4">Assign and reassign leads to team members.</p>
            <button
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => navigate("/lead-assignment")}
            >
              Manage Leads
            </button>
          </div>

          {/* Campaign Management */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <BarChart2 className="text-purple-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Campaign Management</h2>
            </div>
            <p className="text-gray-600 mb-4">Create and manage marketing campaigns.</p>
            <button
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => navigate("/campaign-management")}
            >
              Manage Campaigns
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;