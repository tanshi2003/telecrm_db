import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const AssignManager = () => {
  const [managers, setManagers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchManagers();
    fetchUnassignedUsers();
  }, []);

  const fetchManagers = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5000/api/users?role=manager", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setManagers(res.data.data || []);
  };

  const fetchUnassignedUsers = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5000/api/users?unassigned=true", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(res.data.data || []);
  };

  const handleAssign = async () => {
    setSuccess("");
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/users/${selectedUser}/assign-manager`,
        { manager_id: selectedManager },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Manager assigned successfully!");
      fetchUnassignedUsers();
    } catch (err) {
      setError("Failed to assign manager.");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 mt-16 p-8 bg-gray-100">
        <h1 className="text-2xl font-bold mb-6">Assign Manager</h1>
        {success && <div className="mb-4 p-2 bg-green-100 text-green-800">{success}</div>}
        {error && <div className="mb-4 p-2 bg-red-100 text-red-800">{error}</div>}
        <div className="bg-white p-6 rounded shadow-md">
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Select User (No Manager):</label>
            <select
              className="form-control"
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
            >
              <option value="">-- Select User --</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Assign Manager:</label>
            <select
              className="form-control"
              value={selectedManager}
              onChange={e => setSelectedManager(e.target.value)}
            >
              <option value="">-- Select Manager --</option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} ({manager.email})
                </option>
              ))}
            </select>
          </div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleAssign}
            disabled={!selectedUser || !selectedManager}
          >
            Assign Manager
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignManager;