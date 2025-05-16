import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";
import { Toaster, toast } from "react-hot-toast";
import { FaCheckCircle, FaTimes } from "react-icons/fa";

const AssignManager = () => {
  const [managers, setManagers] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedManager, setSelectedManager] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const fetchTeamsData = async () => {
    try {
      const token = localStorage.getItem("token");
      // First get all managers
      const managersRes = await axios.get("http://localhost:5000/api/users?role=manager", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const managersData = managersRes.data.data || [];
      setManagers(managersData);

      // Get all users to map team members
      const usersRes = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const allUsers = usersRes.data.data || [];
      const nonManagerUsers = allUsers.filter(user => user.role !== 'manager');
      setUsers(nonManagerUsers);
      
      // Create teams structure
      const teamsData = managersData.map(manager => ({
        ...manager,
        team: allUsers.filter(user => user.manager_id === manager.id)
      }));
      
      setTeams(teamsData);
    } catch (err) {
      toast.error("Failed to fetch teams data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamsData();
  }, []);

  // Clear success message after 5 seconds
  useEffect(() => {
    let timer;
    if (successMessage) {
      timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [successMessage]);

  const showToast = (message, type = 'success') => {
    if (type === 'success') {
      toast.success(message, {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#363636',
          color: '#fff',
          padding: '16px',
          marginTop: '70px',
        },
      });
    } else {
      toast.error(message, {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#363636',
          color: '#fff',
          padding: '16px',
          marginTop: '70px',
        },
      });
    }
  };

  const handleAssign = async (userId, managerId) => {
    if (!userId || !managerId) {
      showToast("Please select a manager first", "error");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const user = users.find(u => u.id === userId);
      const manager = managers.find(m => m.id === parseInt(managerId));
      
      if (!user || !manager) {
        showToast("Invalid user or manager selection", "error");
        return;
      }

      // Check if this is a reassignment
      const isReassignment = user.manager_id !== null;
      const oldManager = managers.find(m => m.id === user.manager_id);

      const response = await axios.put(
        `http://localhost:5000/api/users/${userId}/assign-manager`,
        { manager_id: parseInt(managerId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update users state
        const updatedUser = { ...user, manager_id: parseInt(managerId) };
        setUsers(prevUsers => 
          prevUsers.map(u => u.id === userId ? updatedUser : u)
        );

        // Update teams state
        setTeams(prevTeams => 
          prevTeams.map(team => {
            if (team.id === parseInt(managerId)) {
              return {
                ...team,
                team: [...team.team.filter(m => m.id !== userId), updatedUser]
              };
            } else {
              return {
                ...team,
                team: team.team.filter(m => m.id !== userId)
              };
            }
          })
        );

        // Clear selection
        setSelectedManager(prev => ({
          ...prev,
          [userId]: ""
        }));

        // Show success message
        const successMsg = isReassignment
          ? `${user.name} has been reassigned from ${oldManager?.name}'s team to ${manager.name}'s team!`
          : `${user.name} has been assigned to ${manager.name}'s team!`;

        showToast(successMsg, "success");
        setSuccessMessage(successMsg);
      }
    } catch (err) {
      console.error("Assignment error:", err);
      showToast(err.response?.data?.message || "Failed to assign manager. Please try again.", "error");
    } finally {
      setLoading(false);
      await fetchTeamsData();
    }
  };

  const SuccessAlert = ({ message, onClose }) => (
    <div className="fixed top-20 right-4 w-96 z-50 animate-slide-in">
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md shadow-lg">
        <div className="flex items-center">
          <FaCheckCircle className="text-green-500 text-xl mr-3 flex-shrink-0" />
          <div className="flex-1 mr-2">
            <p className="text-green-700 font-medium">{message}</p>
            <p className="text-green-600 text-sm mt-1">
              The team structure has been updated successfully.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-green-700 hover:text-green-900 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 mt-16 p-8 bg-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Assign/Reassign Manager</h1>
          <BackButton />
        </div>

        <Toaster
          position="top-center"
          toastOptions={{
            className: '',
            style: {
              marginTop: '70px',
              background: '#363636',
              color: '#fff',
              zIndex: 9999,
            },
          }}
        />

        {/* Success Message */}
        {successMessage && (
          <SuccessAlert 
            message={successMessage} 
            onClose={() => setSuccessMessage("")}
          />
        )}

        {loading ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Updating team structure...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Unassigned Users Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Unassigned Users</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assign To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.filter(user => !user.manager_id).map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{user.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={selectedManager[user.id] || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setSelectedManager(prev => ({
                                ...prev,
                                [user.id]: value
                              }));
                            }}
                          >
                            <option value="">Select Manager</option>
                            {managers.map((manager) => (
                              <option key={manager.id} value={manager.id}>
                                {manager.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400"
                            onClick={() => handleAssign(user.id, selectedManager[user.id])}
                            disabled={!selectedManager[user.id]}
                          >
                            Assign
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Teams Section */}
            <div className="space-y-6">
              {teams.map((manager) => (
                <div key={manager.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="border-b pb-4 mb-4">
                    <h2 className="text-xl font-semibold text-blue-600">
                      {manager.name}'s Team
                    </h2>
                    <p className="text-gray-600">
                      Email: {manager.email} | Total Team Members: {manager.team.length}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {manager.team.map((member) => (
                        <div key={member.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{member.name}</h4>
                              <p className="text-sm text-gray-600">Role: {member.role}</p>
                              <p className="text-sm text-gray-600">Email: {member.email}</p>
                            </div>
                            <div className="ml-4">
                              <select
                                className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={selectedManager[member.id] || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSelectedManager(prev => ({
                                    ...prev,
                                    [member.id]: value
                                  }));
                                }}
                              >
                                <option value="">Change Manager</option>
                                {managers
                                  .filter(m => m.id !== manager.id)
                                  .map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.name}
                                    </option>
                                  ))}
                              </select>
                              {selectedManager[member.id] && (
                                <button
                                  className="mt-2 w-full px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                  onClick={() => {
                                    const newManagerId = selectedManager[member.id];
                                    const newManager = managers.find(m => m.id === parseInt(newManagerId));
                                    if (newManager) {
                                      handleAssign(member.id, newManagerId);
                                    }
                                  }}
                                >
                                  Reassign
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {manager.team.length === 0 && (
                      <p className="text-gray-500 italic">No team members assigned yet</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignManager;