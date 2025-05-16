import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";

const TeamsList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem("token");
      // First get all managers
      const managersRes = await axios.get("http://localhost:5000/api/users?role=manager", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const managers = managersRes.data.data || [];
      
      // Get all users to map team members
      const usersRes = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const allUsers = usersRes.data.data || [];
      
      // Create teams structure
      const teamsData = managers.map(manager => ({
        ...manager,
        team: allUsers.filter(user => user.manager_id === manager.id)
      }));
      
      setTeams(teamsData);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch teams data");
      setLoading(false);
    }
  };

  const handleUserClick = async (user) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserDetails(response.data.data);
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching user details:", err);
    }
  };

  const UserDetailsModal = ({ user, onClose }) => {
    if (!user) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-blue-600">{user.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700">Basic Information</h3>
                <div className="mt-2 space-y-2">
                  <p><span className="font-medium">Role:</span> {user.role}</p>
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  <p><span className="font-medium">Phone:</span> {user.phone_no}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Performance Metrics</h3>
                <div className="mt-2 space-y-2">
                  <p><span className="font-medium">Total Leads:</span> {user.total_leads || 0}</p>
                  <p><span className="font-medium">Campaigns Handled:</span> {user.campaigns_handled || 0}</p>
                  <p><span className="font-medium">Working Hours:</span> {user.total_working_hours || '0.00'}</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-gray-700">Location Information</h3>
              <p className="mt-2">{user.location || 'Location not specified'}</p>
            </div>

            {user.campaigns_handled > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700">Campaign Performance</h3>
                <div className="mt-2 bg-blue-50 p-4 rounded">
                  <p className="text-blue-800">
                    Successfully handled {user.campaigns_handled} campaigns with {user.total_leads} total leads
                  </p>
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
          <div className="text-center">Loading...</div>
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
          <h1 className="text-2xl font-bold">Team Management</h1>
          <BackButton />
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {teams.map((manager) => (
            <div key={manager.id} className="border rounded-lg shadow-sm p-6">
              <div className="border-b pb-4 mb-4">
                <h2 className="text-xl font-semibold text-blue-600">
                  {manager.name}'s Team
                </h2>
                <p className="text-gray-600">
                  Email: {manager.email} | Phone: {manager.phone_no}
                </p>
                <p className="text-gray-600">
                  Location: {manager.location || 'Not specified'}
                </p>
              </div>
              
              {manager.team.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">Team Members ({manager.team.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {manager.team.map((member) => (
                      <div 
                        key={member.id} 
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleUserClick(member)}
                      >
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-gray-600">Role: {member.role}</p>
                        <p className="text-sm text-gray-600">Email: {member.email}</p>
                        <p className="text-sm text-gray-600">Phone: {member.phone_no}</p>
                        <div className="mt-2">
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {member.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No team members assigned yet</p>
              )}
            </div>
          ))}
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