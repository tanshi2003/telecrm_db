import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import {  Users,
  Phone,
  Mail,
  Calendar,
  Activity,
  Briefcase,
  BarChart2,
  UserCheck,
  Target,
  MapPin,
  FileText,
  Plus
} from "lucide-react";
import {
  getDashboardStats,
  getTeamPerformance,
  getCampaignPerformance,
  getTeams,
} from "../services/managerService";

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

const ManagerDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalTeamMembers: 0,
    activeTeamMembers: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
  });
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [campaignStats, setCampaignStats] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTeamPanel, setShowTeamPanel] = useState(false);
  const [showActiveTeamPanel, setShowActiveTeamPanel] = useState(false);
  const [showCampaignPanel, setShowCampaignPanel] = useState(false);
  const [showActiveCampaignPanel, setShowActiveCampaignPanel] = useState(false);
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
        const [dashboardStats, teamStats, campaignData, teamGridData] =
          await Promise.all([
            getDashboardStats(),
            getTeamPerformance(),
            getCampaignPerformance(),
            getTeams(),
          ]);

        setStats(dashboardStats.data);
        setTeamPerformance(teamStats.data);
        setCampaignStats(campaignData.data);
        setTeamData(teamGridData.data || []);
      } catch (err) {
        console.error("Error in dashboard:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log('Campaign Stats:', campaignStats); // Add this debug log
  }, [campaignStats]);

  // Helper to calculate stats for a team
  const calculateTeamStats = (team) => {
    const totalMembers = team.team_members.length;
    const activeMembers = team.team_members.filter(
      (member) => member.status === "active"
    ).length;
    const roles = team.team_members.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {});
    return { totalMembers, activeMembers, roles };
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">Loading...</div>
    );
  if (error)
    return <div className="text-red-500 text-center mt-4">{error}</div>;

  // Consistent grid for all popups (same as Total Team Members)
  const gridClass = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4";

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
              <h1 className="text-4xl font-bold text-gray-800">
                Manager Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Welcome back, {user?.name}</p>
            </div>
            <div className="flex gap-3">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                onClick={() => navigate("/Lead1")}
              >
                <Plus size={20} />
                Create Lead
              </button>
              
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {/* Total Team Members */}
            <div
              className="bg-white rounded-lg p-4 border-l-4 border-blue-500 cursor-pointer hover:shadow"
              onClick={() => setShowTeamPanel(true)}
              title="Click to view team members"
            >
              <div className="flex items-center gap-2">
                <Users className="text-blue-500" size={20} />
                <p className="text-sm text-gray-600">Total Team Members</p>
              </div>
              <p className="text-2xl font-semibold mt-1">
                {teamData.reduce(
                  (sum, team) => sum + team.team_members.length,
                  0
                )}
              </p>
            </div>
            {/* Active Team Members */}
            <div
              className="bg-white rounded-lg p-4 border-l-4 border-green-500 cursor-pointer hover:shadow"
              onClick={() => setShowActiveTeamPanel(true)}
              title="Click to view active team members"
            >
              <div className="flex items-center gap-2">
                <Activity className="text-green-500" size={20} />
                <p className="text-sm text-gray-600">Active Team Members</p>
              </div>
              <p className="text-2xl font-semibold mt-1">
                {teamData.reduce(
                  (sum, team) =>
                    sum +
                    team.team_members.filter((m) => m.status === "active")
                      .length,
                  0
                )}
              </p>
            </div>
            {/* Total Campaigns */}
            <div
              className="bg-white rounded-lg p-4 border-l-4 border-yellow-500 cursor-pointer hover:shadow"
              onClick={() => setShowCampaignPanel(true)}
              title="Click to view campaigns"
            >
              <div className="flex items-center gap-2">
                <Target className="text-yellow-500" size={20} />
                <p className="text-sm text-gray-600">Total Campaigns</p>
              </div>
              <p className="text-2xl font-semibold mt-1">
                {campaignStats.length}
              </p>
            </div>
            {/* Active Campaigns */}
            <div
              className="bg-white rounded-lg p-4 border-l-4 border-purple-500 cursor-pointer hover:shadow"
              onClick={() => setShowActiveCampaignPanel(true)}
              title="Click to view active campaigns"
            >
              <div className="flex items-center gap-2">
                <BarChart2 className="text-purple-500" size={20} />
                <p className="text-sm text-gray-600">Active Campaigns</p>
              </div>
              <p className="text-2xl font-semibold mt-1">
                {campaignStats.filter(campaign => campaign.status?.toLowerCase() === 'active').length}
              </p>
            </div>
          </div>
        </div>

        {/* Team Members Panel - Grid View */}
        {showTeamPanel && (
          <div className="fixed left-0 top-0 w-full h-full z-50 flex items-start justify-center pointer-events-none">
            <div
              className="bg-white rounded-lg shadow-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto mt-12 border pointer-events-auto"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Team Members</h2>
                <button
                  className="text-gray-500 hover:text-gray-800 text-2xl"
                  onClick={() => setShowTeamPanel(false)}
                  title="Close"
                >
                  &times;
                </button>
              </div>
              {teamData.length === 0 ? (
                <div className="text-gray-500">No team members found.</div>
              ) : (
                teamData.map((team) => {
                  const { totalMembers, activeMembers, roles } =
                    calculateTeamStats(team);
                  return (
                    <div
                      key={team.manager_id}
                      className="bg-gray-50 rounded-xl shadow-sm mb-6 overflow-hidden"
                    >
                      {/* Manager Section */}
                      <div className="p-4 bg-gray-100 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <Users className="text-blue-600" size={20} />
                            </div>
                            <div>
                              <h2 className="text-lg font-semibold flex items-center">
                                {team.manager_name}
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Team Manager
                                </span>
                              </h2>
                              <p className="text-gray-600 text-xs">
                                {team.manager_email}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600">
                              Team Size: {totalMembers}
                            </p>
                            <p className="text-xs text-gray-600">
                              Active Members: {activeMembers}
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Team Members Section */}
                      <div className="p-3">
                        <div className="mb-2">
                          <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries(roles).map(([role, count]) => (
                              <span
                                key={role}
                                className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
                              >
                                {role}: {count}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className={gridClass}>
                          {team.team_members.map((member) => (
                            <div
                              key={member.id}
                              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium">{member.name}</h4>
                                  <p className="text-xs text-gray-600 capitalize">
                                    {member.role}
                                  </p>
                                </div>
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    member.status === "active"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {member.status}
                                </span>
                              </div>
                              <div className="space-y-1 text-xs text-gray-600">
                                <div className="flex items-center">
                                  <Mail className="w-4 h-4 mr-2" />
                                  {member.email}
                                </div>
                                {member.phone_no && (
                                  <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-2" />
                                    {member.phone_no}
                                  </div>
                                )}
                                {member.location && (
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    {member.location}
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Joined:{" "}
                                  {formatDate(member.created_at)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Active Team Members Panel - Grid View */}
        {showActiveTeamPanel && (
          <div className="fixed left-0 top-0 w-full h-full z-50 flex items-start justify-center pointer-events-none">
            <div
              className="bg-white rounded-lg shadow-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto mt-12 border pointer-events-auto"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Active Team Members</h2>
                <button
                  className="text-gray-500 hover:text-gray-800 text-2xl"
                  onClick={() => setShowActiveTeamPanel(false)}
                  title="Close"
                >
                  &times;
                </button>
              </div>
              {teamData.length === 0 ? (
                <div className="text-gray-500">No active team members found.</div>
              ) : (
                teamData.map((team) => {
                  const activeMembersArr = team.team_members.filter(
                    (member) => member.status === "active"
                  );
                  if (activeMembersArr.length === 0) return null;
                  const roles = activeMembersArr.reduce((acc, member) => {
                    acc[member.role] = (acc[member.role] || 0) + 1;
                    return acc;
                  }, {});
                  return (
                    <div
                      key={team.manager_id}
                      className="bg-gray-50 rounded-xl shadow-sm mb-6 overflow-hidden"
                    >
                      {/* Manager Section */}
                      <div className="p-4 bg-gray-100 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <Users className="text-blue-600" size={20} />
                            </div>
                            <div>
                              <h2 className="text-lg font-semibold flex items-center">
                                {team.manager_name}
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Team Manager
                                </span>
                              </h2>
                              <p className="text-gray-600 text-xs">
                                {team.manager_email}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600">
                              Active Members: {activeMembersArr.length}
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Active Team Members Section */}
                      <div className="p-3">
                        <div className="mb-2">
                          <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries(roles).map(([role, count]) => (
                              <span
                                key={role}
                                className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
                              >
                                {role}: {count}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className={gridClass}>
                          {activeMembersArr.map((member) => (
                            <div
                              key={member.id}
                              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium">{member.name}</h4>
                                  <p className="text-xs text-gray-600 capitalize">
                                    {member.role}
                                  </p>
                                </div>
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                  {member.status}
                                </span>
                              </div>
                              <div className="space-y-1 text-xs text-gray-600">
                                <div className="flex items-center">
                                  <Mail className="w-4 h-4 mr-2" />
                                  {member.email}
                                </div>
                                {member.phone_no && (
                                  <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-2" />
                                    {member.phone_no}
                                  </div>
                                )}
                                {member.location && (
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    {member.location}
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Joined:{" "}
                                  {formatDate(member.created_at)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Total Campaigns Panel - Grid View */}
        {showCampaignPanel && (
          <div className="fixed left-0 top-0 w-full h-full z-50 flex items-start justify-center pointer-events-none">
            <div
              className="bg-white rounded-lg shadow-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto mt-12 border pointer-events-auto"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">All Campaigns</h2>
                <button
                  className="text-gray-500 hover:text-gray-800 text-2xl"
                  onClick={() => setShowCampaignPanel(false)}
                  title="Close"
                >
                  &times;
                </button>
              </div>
              {campaignStats.length === 0 ? (
                <div className="text-gray-500">No campaigns found.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {campaignStats.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-xs text-gray-600 capitalize">
                            {campaign.status}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            campaign.status === 'Active'
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Assigned Users: {campaign.assigned_users?.length || 0}
                        </div>
                        <div className="flex items-center">
                          <Target className="w-4 h-4 mr-2" />
                          Total Leads: {campaign.total_leads || 0}
                        </div>
                        <div className="flex items-center">
                          <BarChart2 className="w-4 h-4 mr-2" />
                          Conversion Rate: {campaign.conversion_rate || 0}%
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Created:{" "}
                          {campaign.created_at
                            ? new Date(campaign.created_at).toLocaleDateString()
                            : "-"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Campaigns Panel - Grid View */}
        {showActiveCampaignPanel && (
          <div className="fixed left-0 top-0 w-full h-full z-50 flex items-start justify-center pointer-events-none">
            <div
              className="bg-white rounded-lg shadow-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto mt-12 border pointer-events-auto"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Active Campaigns</h2>
                <button
                  className="text-gray-500 hover:text-gray-800 text-2xl"
                  onClick={() => setShowActiveCampaignPanel(false)}
                  title="Close"
                >
                  &times;
                </button>
              </div>
              {campaignStats.filter(c => c.status?.toLowerCase() === 'active').length === 0 ? (
                <div className="text-gray-500">No active campaigns found.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {campaignStats
                    .filter(c => c.status?.toLowerCase() === 'active')
                    .map((campaign) => (
                      <div
                        key={campaign.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{campaign.name}</h4>
                            <p className="text-xs text-gray-600 capitalize">
                              {campaign.status}
                            </p>
                          </div>
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            {campaign.status}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            Assigned Users: {campaign.assigned_users?.length || 0}
                          </div>
                          <div className="flex items-center">
                            <Target className="w-4 h-4 mr-2" />
                            Total Leads: {campaign.total_leads || 0}
                          </div>
                          <div className="flex items-center">
                            <BarChart2 className="w-4 h-4 mr-2" />
                            Conversion Rate: {campaign.conversion_rate || 0}%
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Created: {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : "-"}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Performance Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Team Performance Card */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <UserCheck className="text-white" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Team Performance</h3>
            </div>
            <div className="space-y-3">
              {teamPerformance.slice(0, 2).map((member) => (
                <div key={member.id} className="bg-gray-50 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        {member.name[0]}
                      </span>
                      <div>
                        <h4 className="font-medium text-sm">{member.name}</h4>
                        <p className="text-xs text-gray-500">Team Member</p>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <p className="text-blue-600">{member.total_leads_handled} Leads</p>
                      <p className="text-green-600">{member.active_campaigns} Campaigns</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campaign Performance Card */}
          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <Target className="text-white" size={18} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Campaign Stats</h3>
            </div>
            <div className="space-y-2">
              {campaignStats
                .slice(0, 2)
                .map((campaign) => (
                <div key={campaign.id} className="bg-gray-50 rounded p-2">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm truncate mr-2">{campaign.name}</h4>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      campaign.status?.toLowerCase() === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded flex flex-col">
                      <p className="text-gray-500 mb-1">Team Members</p>
                      <div>
                        <p className="font-semibold text-sm">
                          {campaign.assigned_users?.length || 0} Total
                        </p>
                        {/* Since we don't have active status in user data, just show total */}
                        <p className="text-xs text-green-600">
                          {campaign.assigned_users?.length || 0} Assigned
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded flex flex-col">
                      <p className="text-gray-500 mb-1">Total Leads</p>
                      <div>
                        <p className="font-semibold text-sm">{campaign.total_leads || 0}</p>
                        <p className="text-xs text-blue-600">{campaign.conversion_rate || 0}% Rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Overview Card */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                <Users className="text-white" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Team Overview</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Total</span>
                </div>
                <p className="text-xl font-bold text-gray-800">
                  {teamData.reduce((sum, team) => sum + team.team_members.length, 0)}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <UserCheck className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">Active</span>
                </div>
                <p className="text-xl font-bold text-gray-800">
                  {teamData.reduce((sum, team) => 
                    sum + team.team_members.filter(m => m.status === "active").length, 0
                  )}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-600">Campaigns</span>
                </div>
                <p className="text-xl font-bold text-gray-800">{stats.totalCampaigns}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-600">Active</span>
                </div>
                <p className="text-xl font-bold text-gray-800">{stats.activeCampaigns}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() =>  navigate("/manager/users")}
              className="flex items-center justify-center p-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Briefcase className="w-5 h-5 mr-2" />
              <span>Team Overview</span>
            </button>
            <button
              onClick={() => navigate("/viewleads")}
              className="flex items-center justify-center p-4 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <FileText className="w-5 h-5 mr-2" />
              <span>Manage Leads</span>
            </button>
            <button
              onClick={() => navigate("/manager/campaigns")}
              className="flex items-center justify-center p-4 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
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