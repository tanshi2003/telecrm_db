import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";
import { Users, Phone, Mail, MapPin, Calendar, Activity, Briefcase, Clock } from "lucide-react";
import { getTeams } from "../services/managerService";
import toast from "react-hot-toast";
import axios from "axios";

const TeamView = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamData, setTeamData] = useState([]);
  const [currentManager, setCurrentManager] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const storedManager = JSON.parse(localStorage.getItem("user"));
    if (storedManager) {
      setCurrentManager(storedManager);
    } else {
      setError("Manager not found. Please login again.");
      setLoading(false);
    }
  }, []);

  const fetchTeamData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getTeams();
      setTeamData(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch team data");
      toast.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentManager) {
      fetchTeamData();
    }
  }, [currentManager, fetchTeamData]);

  const calculateTeamStats = (team) => {
    const totalMembers = team.team_members.length;
    const activeMembers = team.team_members.filter(member => member.status === 'active').length;
    const roles = team.team_members.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {});

    return { totalMembers, activeMembers, roles };
  };

  const handleUserClick = async (member) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/leads/user/${member.id}/lead-counts`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setSelectedUser({
          ...member,
          ...response.data.data
        });
      }
      setShowModal(true);
    } catch (error) {
      toast.error("Failed to fetch lead counts");
      setSelectedUser(member);
      setShowModal(true);
    }
  };

  const UserDetailsModal = ({ user, onClose }) => {
    if (!user) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-blue-600">{user.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Briefcase className="w-5 h-5 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Role</p>
                    <p className="capitalize">{user.role}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="w-5 h-5 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p>{user.email}</p>
                  </div>
                </div>
                {user.phone_no && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-5 h-5 mr-3" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p>{user.phone_no}</p>
                    </div>
                  </div>
                )}
                {user.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p>{user.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status & Activity */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 border-b pb-2">Status & Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Activity className="w-5 h-5 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Briefcase className="w-5 h-5 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Total Leads Assigned</p>
                    <p className="font-medium text-blue-600">{user.total_leads || 0}</p>
                  </div>
                </div>
                {user.last_login && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-3" />
                    <div>
                      <p className="text-sm font-medium">Last Login</p>
                      <p>{new Date(user.last_login).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {user.created_at && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3" />
                    <div>
                      <p className="text-sm font-medium">Joined Date</p>
                      <p>{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="col-span-2 space-y-4">
              <h3 className="font-semibold text-gray-800 border-b pb-2">Performance Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-600">Total Leads</p>
                  <p className="text-2xl font-bold text-blue-700">{user.total_leads || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-green-600">Active Leads</p>
                  <p className="text-2xl font-bold text-green-700">{user.active_leads || 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-purple-600">Converted Leads</p>
                  <p className="text-2xl font-bold text-purple-700">{user.converted_leads || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    </div>
  );

  if (!teamData || teamData.length === 0) return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Team Structure</h1>
          <BackButton />
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600 text-center">No team members found. Start by adding members to your team.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Team Structure</h1>
          <BackButton />
        </div>

        {teamData.map((team) => {
          const { totalMembers, activeMembers, roles } = calculateTeamStats(team);

          return (
            <div 
              key={team.manager_id} 
              className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden"
            >
              {/* Manager Section */}
              <div className="p-6 bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold flex items-center">
                        {team.manager_name}
                        <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Team Manager
                        </span>
                      </h2>
                      <p className="text-gray-600">{team.manager_email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Team Size: {totalMembers}</p>
                    <p className="text-sm text-gray-600">Active Members: {activeMembers}</p>
                  </div>
                </div>
              </div>

              {/* Team Members Section */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Team Members</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(roles).map(([role, count]) => (
                      <span 
                        key={role}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                      >
                        {role}: {count}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {team.team_members.map((member) => (
                    <div 
                      key={member.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleUserClick(member)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-gray-600 capitalize">{member.role}</p>
                        </div>
                        <span 
                          className={`px-2 py-1 text-xs rounded-full ${
                            member.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {member.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
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
                          Joined: {new Date(member.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {showModal && selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            onClose={() => {
              setShowModal(false);
              setSelectedUser(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TeamView; 