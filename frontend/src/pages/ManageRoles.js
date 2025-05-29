import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import toast from "react-hot-toast";
import { FaCheck, FaEdit } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";

const roleOptions = [
  { value: "manager", label: "Manager" },
  { value: "caller", label: "Caller" },
  { value: "field_employee", label: "Field Employee" },
];

const ManageRoles = () => {
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setAdmin(storedUser);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        toast.error("Failed to fetch users.");
      }
    } catch {
      toast.error("Server error while fetching users.");
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Get user details for better error messaging
      const user = users.find(u => u.id === userId);
      if (!user) {
        toast.error("User not found");
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/users/${userId}/role`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

     if (response.data.success) {
  // Update local state first for immediate feedback
  setUsers(prevUsers => 
    prevUsers.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    )
  );
        
        toast.success("Role successfully edited!"); // <-- updated message
} else {
  toast.error(response.data.message || "Failed to update role");
}

      // Fetch fresh data after a short delay
      setTimeout(() => {
        fetchUsers();
      }, 500);

    } catch (error) {
      console.error("Error updating role:", error);
      const errorMessage = error.response?.data?.message || "Failed to update role";
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen">
      <Sidebar user={admin} />

      <main className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        <div className="max-w-7xl mx-auto bg-white rounded-md shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              🛠️ Manage User Roles
            </h2>
            <BackButton />
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Updating user roles...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">
                      User
                    </th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">
                      Email
                    </th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">
                      Current Role
                    </th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">
                      New Role
                    </th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <RoleRow
                        key={user.id}
                        user={user}
                        roles={roleOptions}
                        onUpdate={handleRoleChange}
                      />
                    ))
                  )
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const RoleRow = ({ user, roles, onUpdate }) => {
  const [selectedRole, setSelectedRole] = useState(
    roles.find((r) => r.value === user.role)
  );
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    if (selectedRole.value === user.role) {
      setIsEditing(false);
      return;
    }
    onUpdate(user.id, selectedRole.value);
    setIsEditing(false);
  };

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-4 py-2 text-sm">{user.name}</td>
      <td className="px-4 py-2 text-sm">{user.email}</td>
      <td className="px-4 py-2">
        <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 capitalize">
          {user.role}
        </span>
      </td>
      <td className="px-4 py-2 min-w-[160px]">
        <Select
          options={roles}
          value={selectedRole}
          onChange={setSelectedRole}
          isDisabled={!isEditing}
        />
      </td>
      <td className="px-4 py-2">
        <div className="flex gap-2">
          {isEditing ? (
            <button
              className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              onClick={handleSave}
            >
              <FaCheck className="mr-1" /> Save
            </button>
          ) : (
            <button
              className="flex items-center px-3 py-1 border text-gray-700 border-gray-400 rounded text-sm hover:bg-gray-100"
              onClick={() => setIsEditing(true)}
            >
              <FaEdit className="mr-1" /> Edit Role
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default ManageRoles;
