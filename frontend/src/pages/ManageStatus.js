import api from '../config/api';
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-hot-toast";
import { FaCheck, FaTimes } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";
import axios from "axios";

const statusOptions = [
  { value: "active", label: "Activate" },
  { value: "inactive", label: "Deactivate" },
  { value: "suspended", label: "Suspend" },
];

const ManageStatus = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // Only one user for radio
  const [bulkStatus, setBulkStatus] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(""); // <-- Add this line

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setUsers(response.data.data || []);
      } else {
        toast.error("Failed to load users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.message || "Server error while loading users");
    }
    setLoading(false);
  };

  const handleUserSelect = (id) => {
    setSelectedUser(id);
  };

  const handleApplyStatus = async () => {
    if (!bulkStatus || !selectedUser) {
      toast.error("Please select a user and a status.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const userId = selectedUser;
       const response = await axios.put(
         `${process.env.REACT_APP_API_BASE_URL}/users/${userId}/status`,
        {
          status: bulkStatus.value
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success(`✅ Successfully updated user status to ${bulkStatus.label}`);
        setSuccessMsg(`Successfully updated user status to ${bulkStatus.label}`); // <-- Add this
        setTimeout(() => setSuccessMsg(""), 3000); // <-- Add this
        setSelectedUser(null);
        setBulkStatus(null);
        setShowConfirm(false);
        await fetchUsers();
      } else {
        toast.error(response.data.message || "Failed to update user status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Server error updating status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        <div className="max-w-7xl mx-auto bg-white rounded-md shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              🔒 Manage User Status
            </h2>
            <BackButton />
          </div>

          {/* Success banner */}
          {successMsg && (
            <div className="mb-4 p-3 rounded bg-green-100 text-green-800 font-semibold text-center transition">
              {successMsg}
            </div>
          )}

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
              disabled={!bulkStatus || !selectedUser}
              className={`px-4 py-2 rounded text-white text-sm transition ${
                !bulkStatus || !selectedUser
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
                    {/* No select all for radio */}
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
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-2">
                        <input
                          type="radio"
                          name="userSelect"
                          checked={selectedUser === user.id}
                          onChange={() => handleUserSelect(user.id)}
                        />
                      </td>
                      <td className="px-4 py-2 text-sm">{user.name}</td>
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
            <h3 className="text-xl font-bold mb-4">Confirm Status Change</h3>
            <p>
              Are you sure you want to change status of{" "}
              <strong>1</strong> user to{" "}
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