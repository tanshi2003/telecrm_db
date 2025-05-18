import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

const ManagerDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user details from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    } else {
      console.error("User not found. Redirecting to login...");
      // TODO: Add redirect to login page if needed
    }
  }, []);

  return (
    <div className="relative flex min-h-screen">
      {/* Sidebar */}
      {user && <Sidebar user={user} />}

      {/* Main Content */}
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => navigate("/add-report")}
          >
            Add Report
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Reports Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Reports</h2>
            <ul className="list-disc pl-6">
              <li>Weekly performance report</li>
              <li>Monthly sales report</li>
            </ul>
            <button
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => navigate("/reports")}
            >
              View All Reports
            </button>
          </div>

          {/* Notifications Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <ul className="list-disc pl-6">
              <li>New report request</li>
              <li>Meeting scheduled with Admin</li>
            </ul>
            <button
              className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              onClick={() => navigate("/notifications")}
            >
              View All Notifications
            </button>
          </div>

          {/* Team Management Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Team Management</h2>
            <p>Manage your team members and assign tasks.</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => navigate("/team-management")}
            >
              Manage Team
            </button>
          </div>

          {/* Task Assignment Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Task Assignment</h2>
            <p>Assign tasks to team members and track progress.</p>
            <button
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => navigate("/assign-tasks")}
            >
              Assign Tasks
            </button>
          </div>

          {/* Performance Analytics Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Performance Analytics</h2>
            <p>Analyze team performance and productivity metrics.</p>
            <button
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              onClick={() => navigate("/performance-analytics")}
            >
              View Analytics
            </button>
          </div>

          {/* Meetings Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Meetings</h2>
            <p>Schedule and manage meetings with team members.</p>
            <button
              className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              onClick={() => navigate("/meetings")}
            >
              Schedule Meeting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;