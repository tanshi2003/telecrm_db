import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from 'react-router-dom';
import BackButton from "../components/BackButton";
import { Users, FileText, BarChart2, UserCheck } from "lucide-react";
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

  const handleLeadAssignment = async (userId) => {
    try {
      navigate("/lead-assignment", { state: { selectedUserId: userId } });
    } catch (err) {
      toast.error("Failed to navigate to lead assignment");
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
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
                          <button
                            onClick={() => handleLeadAssignment(member.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Assign Leads
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
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">{selectedUser.name}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Role</p>
                <p className="font-medium capitalize">{selectedUser.role}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-medium capitalize">{selectedUser.status}</p>
              </div>
              <div>
                <p className="text-gray-600">Location</p>
                <p className="font-medium">{selectedUser.location || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-gray-600">Assigned Leads</p>
                <p className="font-medium">{selectedUser.assigned_leads?.length || 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Performance</p>
                <p className="font-medium">{selectedUser.completed_calls}/{selectedUser.total_calls} calls completed</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
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