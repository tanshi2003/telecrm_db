import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";
import { Toaster, toast } from "react-hot-toast";
import { FaCheckCircle, FaTimes } from "react-icons/fa";

const AssignManager = () => {
  const [managers, setManagers] = useState([]);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedManager, setSelectedManager] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Update the fetchData function to handle users who are both team members and managers
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch all users first
      const usersRes = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allUsers = usersRes.data.data || [];

      // Get managers (anyone with role 'manager')
      const managersData = allUsers.filter(user => user.role === 'manager');

      // Get unassigned users (not managers and no manager_id)
      const unassigned = allUsers.filter(user => 
        user.role !== 'manager' && !user.manager_id
      );

      // Create managers with their team members
      const managersWithTeams = managersData.map(manager => {
        // Get team members for this manager
        const teamMembers = allUsers.filter(user => user.manager_id === manager.id);
        
        // If the manager is also assigned to another manager's team, include that info
        const isAlsoTeamMember = allUsers.find(user => 
          user.role === 'manager' && 
          user.id === manager.id && 
          user.manager_id
        );

        return {
          ...manager,
          team: teamMembers,
          assignedTo: isAlsoTeamMember ? {
            manager_id: manager.manager_id,
            managerName: allUsers.find(u => u.id === manager.manager_id)?.name
          } : null
        };
      });

      setManagers(managersWithTeams);
      setUnassignedUsers(unassigned);
    } catch (err) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      
      const user = unassignedUsers.find(u => u.id === userId);
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
        setUnassignedUsers(prevUsers => 
          prevUsers.map(u => u.id === userId ? updatedUser : u)
        );

        // Update teams state
        setManagers(prevManagers => 
          prevManagers.map(team => {
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
      await fetchData();
    }
  };

  const handleReassign = async (userId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Find the user in all teams
      let userToReassign = null;
      let currentManager = null;
      
      managers.forEach(manager => {
        const foundMember = manager.team.find(member => member.id === userId);
        if (foundMember) {
          userToReassign = foundMember;
          currentManager = manager;
        }
      });

      if (!userToReassign || !currentManager) {
        showToast("User not found in any team", "error");
        return;
      }

      // Create a modal or dialog for reassignment
      const newManagerId = window.prompt(
        `Select new manager for ${userToReassign.name} (Current: ${currentManager.name})\n\n` +
        `Available Managers:\n${managers
          .filter(m => m.id !== currentManager.id)
          .map(m => `${m.id}: ${m.name}`)
          .join('\n')}\n\n` +
        "Enter manager ID or 'cancel' to cancel:"
      );

      if (!newManagerId || newManagerId.toLowerCase() === 'cancel') {
        setLoading(false);
        return;
      }

      const newManager = managers.find(m => m.id === parseInt(newManagerId));
      if (!newManager) {
        showToast("Invalid manager selection", "error");
        setLoading(false);
        return;
      }

      // Perform the reassignment
      const response = await axios.put(
        `http://localhost:5000/api/users/${userId}/assign-manager`,
        { manager_id: parseInt(newManagerId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showToast(
          `${userToReassign.name} has been reassigned from ${currentManager.name}'s team to ${newManager.name}'s team`,
          "success"
        );
        setSuccessMessage(
          `${userToReassign.name} has been reassigned from ${currentManager.name}'s team to ${newManager.name}'s team`
        );
        await fetchData(); // Refresh data
      }
    } catch (err) {
      console.error("Reassignment error:", err);
      showToast(err.response?.data?.message || "Failed to reassign team member", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId) => {
    try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("role");

        if (userRole !== "admin") {
            showToast("Only administrators can remove team members", "error");
            return;
        }

        const userToRemove = managers.flatMap(m => m.team).find(u => u.id === userId);
        if (!userToRemove) {
            showToast("User not found in any team", "error");
            return;
        }

        // Using the dedicated remove endpoint
        const response = await axios({
            method: 'put',
            url: `http://localhost:5000/api/users/${userId}/remove-manager`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.success) {
            await fetchData();
            showToast(`${userToRemove.name} has been removed from team`, "success");
            setSuccessMessage(`${userToRemove.name} has been removed from team`);
        }
    } catch (err) {
        console.error("Remove error:", err);
        showToast(
            err.response?.data?.message || "Failed to remove user from team", 
            "error"
        );
    } finally {
        setLoading(false);
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
          <h1 className="text-2xl font-bold">Team Management</h1>
          <BackButton />
        </div>

        <Toaster position="top-center" />

        {successMessage && (
          <SuccessAlert message={successMessage} onClose={() => setSuccessMessage("")} />
        )}

        {loading ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading team data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Unassigned Users Section */}
            {unassignedUsers.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-red-600">Unassigned Users</h2>
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
                      {unassignedUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap capitalize">{user.role}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={selectedManager[user.id] || ""}
                              onChange={(e) => {
                                setSelectedManager(prev => ({
                                  ...prev,
                                  [user.id]: e.target.value
                                }));
                              }}
                            >
                              <option value="">Select Manager</option>
                              {managers.map((manager) => (
                                <option key={manager.id} value={manager.id}>{manager.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              className="h-6 px-2 inline-flex items-center justify-center
                                        text-[11px] font-medium text-white 
                                        bg-blue-600 rounded-sm
                                        hover:bg-blue-700 
                                        disabled:bg-gray-400 disabled:cursor-not-allowed"
                              onClick={() => handleAssign(user.id, selectedManager[user.id])}
                              disabled={!selectedManager[user.id]}
                            >
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              <span className="ml-1">Assign</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Managers and Their Teams Section */}
            <div className="space-y-6">
              {managers.map((manager) => (
                <div key={manager.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="border-b pb-4 mb-4">
                    <h2 className="text-xl font-semibold text-blue-600">
                      {manager.name}'s Team
                    </h2>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600">
                        Manager Email: {manager.email} | Team Size: {manager.team.length}
                      </p>
                      
                      {/* Show if manager is assigned to another team */}
                      {manager.assignedTo && (
                        <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                          Reports to: {manager.assignedTo.managerName}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {manager.team.map((member) => (
                      <div key={member.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col">
                          {/* User Information */}
                          <div className="mb-3">
                            <h4 className="font-medium">{member.name}</h4>
                            <p className="text-sm text-gray-600">Role: {member.role}</p>
                            <p className="text-sm text-gray-600">Email: {member.email}</p>
                            {member.role === 'manager' && (
                              <p className="text-sm text-blue-600">
                                Also manages a team
                              </p>
                            )}
                          </div>

                          {/* Divider */}
                          <div className="border-t my-2"></div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2 pt-2">
                            <button
                              onClick={() => handleReassign(member.id)}
                              className="h-7 w-full inline-flex items-center justify-center
                                        text-xs font-medium text-blue-600 
                                        bg-blue-50 border border-blue-200 
                                        rounded hover:bg-blue-100"
                            >
                              <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M8 7h12M20 7l-4-4M20 7l-4 4" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              Move to Another Team
                            </button>
                            {localStorage.getItem("role") === "admin" && (
                              <button
                                onClick={() => handleRemove(member.id)}
                                className="h-7 w-full inline-flex items-center justify-center
                                          text-xs font-medium text-red-600 
                                          bg-red-50 border border-red-200 
                                          rounded hover:bg-red-100"
                              >
                                <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                Remove from Team
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {manager.team.length === 0 && (
                      <p className="col-span-full text-gray-500 italic text-center py-4">
                        No team members assigned
                      </p>
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