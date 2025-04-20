import React from "react";
import Sidebar from "../components/Sidebar"; // Import Sidebar component

const ManagerDashboard = ({ user }) => {
  return (
    <div className="relative flex min-h-screen">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div className="flex-grow bg-gray-100 p-6 ml-64">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add Task
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Team Overview Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Team Overview</h2>
            <ul className="list-disc pl-6">
              <li>Team Member A: 5 tasks completed</li>
              <li>Team Member B: 3 tasks pending</li>
              <li>Team Member C: 2 tasks in progress</li>
            </ul>
            <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              View Team Details
            </button>
          </div>

          {/* Task Management Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Task Management</h2>
            <p>Assign and track tasks for your team.</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Manage Tasks
            </button>
          </div>

          {/* Notifications Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <ul className="list-disc pl-6">
              <li>New task assigned to Team Member A</li>
              <li>Meeting scheduled with Client X</li>
            </ul>
            <button className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
              View All Notifications
            </button>
          </div>

          {/* Performance Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Performance</h2>
            <p>Track your team's performance metrics and progress.</p>
            <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
              View Performance
            </button>
          </div>

          {/* Reports Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Reports</h2>
            <p>Review and approve team reports here.</p>
            <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Review Reports
            </button>
          </div>

          {/* Profile Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <p>Manage your account details and preferences.</p>
            <button className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;