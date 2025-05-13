import React, { useEffect, useState } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import { FaCheck, FaTimes } from "react-icons/fa";
import Sidebar from "../components/Sidebar";

const statusOptions = [
  { value: "active", label: "Activate" },
  { value: "inactive", label: "Deactivate" },
  { value: "suspended", label: "Suspend" },
];

const ManageStatus = () => {
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkStatus, setBulkStatus] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (stored) setAdmin(stored);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error("Failed to load users");
      }
    } catch {
      toast.error("Server error while loading users");
    }
    setLoading(false);
  };

  const handleUserSelect = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    setSelectedUsers(e.target.checked ? users.map((u) => u._id) : []);
  };

  const handleApplyStatus = async () => {
    if (!bulkStatus || selectedUsers.length === 0) {
      toast.error("Please select users and a status.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/users/bulk-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: selectedUsers, status: bulkStatus.value }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(`✅ ${result.modifiedCount} user(s) updated to ${bulkStatus.label}`);
        setSelectedUsers([]);
        setBulkStatus(null);
        setShowConfirm(false);
        fetchUsers();
      } else {
        toast.error("Failed to update user statuses.");
      }
    } catch (error) {
      toast.error("Server error updating statuses.");
    }
  };

  return (
    <div className="relative flex min-h-screen">
      <Sidebar user={admin} />

      <main className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        <div className="max-w-7xl mx-auto bg-white rounded-md shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            🔒 Manage User Status
          </h2>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
            <Select
              options={statusOptions}
              value={bulkStatus}
              onChange={setBulkStatus}
              className="w-full md:w-64"
              placeholder="Select Status"
            />
            <button
              onClick={() => setShowConfirm(true)}
              disabled={!bulkStatus || selectedUsers.length === 0}
              className={`px-4 py-2 rounded text-white text-sm transition ${
                !bulkStatus || selectedUsers.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Apply to Selected
            </button>
          </div>

          <div className="overflow-x-auto border rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">User</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Role</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-500">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleUserSelect(user._id)}
                        />
                      </td>
                      <td className="px-4 py-2 text-sm">{user.userName}</td>
                      <td className="px-4 py-2 text-sm">{user.email}</td>
                      <td className="px-4 py-2 text-sm capitalize">{user.role}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            user.status === "active"
                              ? "bg-green-100 text-green-800"
                              : user.status === "inactive"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md">
            <h3 className="text-xl font-bold mb-4">Confirm Bulk Status Change</h3>
            <p>
              Are you sure you want to change status of{" "}
              <strong>{selectedUsers.length}</strong> user(s) to{" "}
              <strong>{bulkStatus?.label}</strong>?
            </p>
            <div className="flex justify-end mt-6 space-x-4">
              <button
                className="flex items-center px-3 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded"
                onClick={() => setShowConfirm(false)}
              >
                <FaTimes className="mr-1" /> Cancel
              </button>
              <button
                className="flex items-center px-3 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded"
                onClick={handleApplyStatus}
              >
                <FaCheck className="mr-1" /> Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStatus;
