import api from '../config/api';
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from 'react-router-dom';
import BackButton from "../components/BackButton";
import { Users, UserCheck } from "lucide-react";
import { getUsers, updateUserStatus } from "../services/managerService";
import toast from "react-hot-toast";

const ManagerUserManagement = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setTeamMembers(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch team members");
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      await updateUserStatus(userId, newStatus);
      toast.success("User status updated successfully");
      fetchTeamMembers(); // Refresh the list
    } catch (err) {
      toast.error(err.message || "Failed to update user status");
    }
  };

  // const handleLeadAssignment = async (userId) => {
  //   try {
  //     navigate("/lead-assignment", { state: { selectedUserId: userId } });
  //   } catch (err) {
  //     toast.error("Failed to navigate to lead assignment");
  //   }
  // };

  const handleUserClick = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/api/leads/user/${user.id}/lead-counts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSelectedUser({
          ...user,
          ...response.data.data
        });
        setShowUserModal(true);
      } else {
        toast.error("Failed to fetch user details");
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error("Failed to fetch user details");
      // Still show the modal with basic user info
      setSelectedUser(user);
      setShowUserModal(true);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Team Management</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/manager/team-view")}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <UserCheck size={20} />
              View Team Structure
            </button>
            <BackButton />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6">
          {/* Team Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold">Your Team</h2>
            </div>

            {loading ? (
              <div className="text-center py-4">Loading team data...</div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teamMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={member.status}
                            onChange={(e) => handleStatusUpdate(member.id, e.target.value)}
                            className="text-sm rounded-md border-gray-300"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="on_leave">On Leave</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1">
                              <div className="h-2 bg-gray-200 rounded-full">
                                <div
                                  className="h-2 bg-green-500 rounded-full"
                                  style={{ width: `${(member.completed_calls / member.total_calls * 100) || 0}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="ml-2 text-sm text-gray-600">
                              {member.completed_calls}/{member.total_calls} calls
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleUserClick(member)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{selectedUser.name}</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic Information */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-2">Basic Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Email:</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Role:</p>
                    <p className="font-medium capitalize">{selectedUser.role}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status:</p>
                    <p className="font-medium capitalize">{selectedUser.status}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Location:</p>
                    <p className="font-medium">{selectedUser.location || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Lead Statistics */}
              <div>
                <h3 className="font-semibold text-gray-800 text-sm mb-2">Lead Statistics</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-xs font-medium text-blue-600">Total Leads</p>
                    <p className="text-lg font-bold text-blue-700">{selectedUser.total_leads || 0}</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-xs font-medium text-green-600">Active</p>
                    <p className="text-lg font-bold text-green-700">{selectedUser.active_leads || 0}</p>
                  </div>
                  <div className="bg-purple-50 p-2 rounded">
                    <p className="text-xs font-medium text-purple-600">Converted</p>
                    <p className="text-lg font-bold text-purple-700">{selectedUser.converted_leads || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-3 py-1.5 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerUserManagement;