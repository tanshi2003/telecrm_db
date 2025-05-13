import React, { useEffect, useState } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import { FaCheck, FaEdit } from "react-icons/fa";
import Sidebar from "../components/Sidebar"; // Sidebar included

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "employee", label: "Employee" },
];

const ManageRoles = () => {
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setAdmin(storedUser);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setManagers(data.users.filter((u) => u.role === "manager"));
      } else {
        toast.error("Failed to fetch users.");
      }
    } catch {
      toast.error("Server error while fetching users.");
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId, newRole, managerId = null) => {
    try {
      const res = await fetch("http://localhost:5000/users/update-role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole, managerId }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success("✅ Role updated successfully!");
        fetchUsers();
      } else {
        toast.error("❌ Failed to update role.");
      }
    } catch {
      toast.error("Server error while updating role.");
    }
  };

  return (
    <div className="relative flex min-h-screen">
      <Sidebar user={admin} />

      <main className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        <div className="max-w-7xl mx-auto bg-white rounded-md shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            🛠️ Manage User Roles
          </h2>

          {loading ? (
            <p className="text-gray-500">Loading users...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">User</th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Email</th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Current Role</th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">New Role</th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Assign Manager</th>
                    <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Action</th>
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
                        key={user._id}
                        user={user}
                        roles={roleOptions}
                        managers={managers}
                        onUpdate={handleRoleChange}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const RoleRow = ({ user, roles, managers, onUpdate }) => {
  const [selectedRole, setSelectedRole] = useState(
    roles.find((r) => r.value === user.role)
  );
  const [selectedManager, setSelectedManager] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const showManagerSelect = selectedRole?.value === "employee";

  const handleSave = () => {
    onUpdate(user._id, selectedRole.value, selectedManager?.value || null);
    setIsEditing(false);
  };

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-4 py-2 text-sm">{user.userName}</td>
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
      <td className="px-4 py-2 min-w-[200px]">
        {showManagerSelect ? (
          <Select
            options={managers.map((m) => ({
              value: m._id,
              label: `${m.firstName || ""} ${m.lastName || ""} (${m.userName})`,
            }))}
            value={selectedManager}
            onChange={setSelectedManager}
            isDisabled={!isEditing}
            placeholder="Select Manager"
          />
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-2">
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
            <FaEdit className="mr-1" /> Edit
          </button>
        )}
      </td>
    </tr>
  );
};

export default ManageRoles;
