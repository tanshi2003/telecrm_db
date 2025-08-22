import api from '../config/api';
import { BASE_URL } from '../config/api'
import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";
import {Phone, Mail, Calendar, MapPin, Activity, Briefcase, Clock } from "lucide-react";
import { getTeams } from "../services/managerService";
import toast from "react-hot-toast";

const TeamsList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("Current user from localStorage:", user);
    if (user) {
      setCurrentUser(user);
    } else {
      setError("User not found. Please login again.");
      setLoading(false);
    }
  }, []);

  const fetchTeams = useCallback(async () => {
    try {
      console.log("Fetching teams...");
      const response = await getTeams();
      console.log("Teams response:", response);
      const teamsData = response.data;
      
      // If manager, filter to only show their team
      if (currentUser.role === "manager") {
        const managerTeam = teamsData.find(team => team.manager_id === currentUser.id);
        console.log("Manager's team:", managerTeam);
        setTeams(managerTeam ? [managerTeam] : []);
      } else {
        console.log("Setting all teams:", teamsData);
        setTeams(teamsData);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError("Failed to fetch teams data");
      toast.error("Failed to load teams data");
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchTeams();
    }
  }, [currentUser, fetchTeams]);

  const handleUserClick = async (member) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`${BASE_URL}/leads/user/${member.id}/lead-counts`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setUserDetails({
          ...member,
          ...response.data.data
        });
      }
      setShowModal(true);
    } catch (error) {
      toast.error("Failed to fetch lead counts");
      setUserDetails(member);
      setShowModal(true);
    }
  };

  const UserDetailsModal = ({ user, onClose }) => {
    if (!user) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {(user.total_leads || user.performance_rating || user.campaigns_handled) && (
              <div className="col-span-2 space-y-4">
                <h3 className="font-semibold text-gray-800 border-b pb-2">Performance Metrics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {user.total_leads !== undefined && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-blue-600">Total Leads</p>
                      <p className="text-2xl font-bold text-blue-700">{user.total_leads}</p>
                    </div>
                  )}
                  {user.performance_rating !== undefined && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-green-600">Performance Rating</p>
                      <p className="text-2xl font-bold text-green-700">{user.performance_rating}/5</p>
                    </div>
                  )}
                  {user.campaigns_handled !== undefined && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-purple-600">Campaigns Handled</p>
                      <p className="text-2xl font-bold text-purple-700">{user.campaigns_handled}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 ml-64 mt-16 p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 ml-64 mt-16 p-8">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 ml-64 mt-16 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {currentUser?.role === "manager" ? "Your Team" : "Team Management"}
          </h1>
          <BackButton />
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {teams && teams.length > 0 ? (
            teams.map((team) => (
              <div key={team.manager_id} className="border rounded-lg shadow-sm p-6">
                <div className="border-b pb-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-blue-600">
                        {currentUser?.role === "manager" ? "Your Team" : `${team.manager_name}'s Team`}
                      </h2>
                      <p className="text-gray-600">
                        Email: {team.manager_email}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">Team Members ({team.team_members.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {team.team_members.map((member) => (
                      <div 
                        key={member.id} 
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleUserClick(member)}
                      >
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-gray-600">Role: {member.role}</p>
                          <p className="text-sm text-gray-600">Email: {member.email}</p>
                        </div>
                        <div className="mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            member.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {member.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 mt-8">
              {error ? error : "No teams found"}
            </div>
          )}
        </div>

        {showModal && userDetails && (
          <UserDetailsModal
            user={userDetails}
            onClose={() => {
              setShowModal(false);
              setUserDetails(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TeamsList; 