import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AdminDashboard mounted");
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = localStorage.getItem("role");
    
    console.log("AdminDashboard - Stored data:", {
      storedUser,
      role,
      hasToken: !!localStorage.getItem("token")
    });
    
    if (storedUser && role?.toLowerCase() === "admin") {
      console.log("AdminDashboard - Setting user data");
      setUser(storedUser);
    } else {
      console.error("Unauthorized access. Redirecting to login...");
      navigate("/login");
    }
  }, [navigate]);

  const handleNavigation = (path) => {
    console.log("AdminDashboard - Navigating to:", path);
    navigate(path);
  };

  // If user is not set, show loading or redirect
  if (!user) {
    console.log("AdminDashboard - No user data, returning null");
    return null;
  }

  console.log("AdminDashboard - Rendering dashboard");
  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => handleNavigation("/admin/settings")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            System Settings
          </button>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Users Management */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Users</h2>
            <p>Register, assign roles, deactivate/activate users, and manage employee profiles.</p>
            <button
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => handleNavigation("/admin/ManageUsers")}
            >
              Manage Users
            </button>
          </div>

          {/* Campaigns */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Campaigns</h2>
            <p>Create campaigns, assign users, track progress, and analyze performance.</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => handleNavigation("/admin/campaigns1")}
            >
              Manage Campaigns
            </button>
          </div>

          {/* Lead Overview */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Leads</h2>
            <p>Assign leads to users, filter by status, category, and campaign. Add or import leads.</p>
            <button
              className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              onClick={() => handleNavigation("/leads")}
            >
              View Leads
            </button>
          </div>

          {/* Reports */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Reports</h2>
            <p>Performance summaries by user, team, or campaign. Export data and download PDFs.</p>
            <button
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              onClick={() => handleNavigation("/ReportsLeaderboard")}
            >
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
