import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Phone,
  Mail,
  Calendar,
  Activity,
  Briefcase,
  BarChart2,
  UserCheck,
  Target,
  UserCog,
  MapPin,
  Clock,
  Filter,
} from "lucide-react";
import {
  getDashboardStats,
  getTeamPerformance,
  getCampaignPerformance,
  getTeams,
} from "../services/managerService";

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

  // Helper for filtering active campaigns robustly
  const isActiveCampaign = (c) =>
    (typeof c.status === "string" && c.status.toLowerCase() === "active") ||
    c.is_active === true;

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
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => navigate("/Lead1")}
              >
                Create Lead
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                onClick={() => navigate("/manager/users")}
              >
                <UserCog size={20} />
                Manage Team
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
                {stats.totalCampaigns}
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
                {stats.activeCampaigns}
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
                                  {new Date(
                                    member.created_at
                                  ).toLocaleDateString()}
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
                                  {new Date(
                                    member.created_at
                                  ).toLocaleDateString()}
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
                <div className={gridClass}>
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
                            isActiveCampaign(campaign)
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
                          Assigned Users: {campaign.assigned_users}
                        </div>
                        <div className="flex items-center">
                          <Target className="w-4 h-4 mr-2" />
                          Total Leads: {campaign.total_leads}
                        </div>
                        <div className="flex items-center">
                          <BarChart2 className="w-4 h-4 mr-2" />
                          Conversion Rate: {campaign.conversion_rate}%
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
              {campaignStats.filter(isActiveCampaign).length === 0 ? (
                <div className="text-gray-500">No active campaigns found.</div>
              ) : (
                <div className={gridClass}>
                  {campaignStats
                    .filter(isActiveCampaign)
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
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            Assigned Users: {campaign.assigned_users}
                          </div>
                          <div className="flex items-center">
                            <Target className="w-4 h-4 mr-2" />
                            Total Leads: {campaign.total_leads}
                          </div>
                          <div className="flex items-center">
                            <BarChart2 className="w-4 h-4 mr-2" />
                            Conversion Rate: {campaign.conversion_rate}%
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

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Team Performance */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserCheck className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Team Performance
                </h3>
                <div className="mt-2 space-y-2">
                  {teamPerformance.slice(0, 3).map((member) => (
                    <div key={member.id} className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{member.name}</span>
                        <span className="font-medium">
                          {member.conversion_rate}% conversion
                        </span>
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
                <h3 className="text-lg font-semibold text-gray-800">
                  Campaign Performance
                </h3>
                <div className="mt-2 space-y-2">
                  {campaignStats.slice(0, 3).map((campaign) => (
                    <div key={campaign.id} className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{campaign.name}</span>
                        <span className="font-medium">
                          {campaign.conversion_rate}% conversion
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-green-600 h-1.5 rounded-full"
                          style={{ width: `${campaign.conversion_rate}%` }}
                        />
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
                <h3 className="text-lg font-semibold text-gray-800">
                  Team Overview
                </h3>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Phone size={16} />
                      Total Team Members:
                    </span>
                    <span className="font-medium">
                      {teamData.reduce(
                        (sum, team) => sum + team.team_members.length,
                        0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Mail size={16} />
                      Active Members:
                    </span>
                    <span className="font-medium">
                      {teamData.reduce(
                        (sum, team) =>
                          sum +
                          team.team_members.filter((m) => m.status === "active")
                            .length,
                        0
                      )}
                    </span>
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
              onClick={() => navigate("/lead-assignment")}
              className="flex items-center justify-center p-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Users className="w-5 h-5 mr-2" />
              <span>Lead Assignment</span>
            </button>
            <button
              onClick={() => navigate("/manager/teams")}
              className="flex items-center justify-center p-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Briefcase className="w-5 h-5 mr-2" />
              <span>Team Management</span>
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