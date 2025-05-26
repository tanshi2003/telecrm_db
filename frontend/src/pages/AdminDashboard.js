import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaBullhorn, FaClipboardList, FaChartLine } from "react-icons/fa"; // added icons

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = localStorage.getItem("role");

    if (storedUser && role?.toLowerCase() === "admin") {
      setUser(storedUser);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleNavigation = (path) => {
    setSettingsOpen(false);
    navigate(path);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
    }
    if (settingsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingsOpen]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setSettingsOpen((prev) => !prev)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              System Settings
            </button>
            {settingsOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-lg z-50">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => handleNavigation("/admin/settings/lead-fields")}
                >
                  Lead Fields
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => handleNavigation("/admin/settings/lead-stage")}
                >
                  Lead Stage
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => handleNavigation("/admin/settings/call-feedback")}
                >
                  Call Feedback
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => handleNavigation("/admin/settings/api-templates")}
                >
                  API Templates
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => handleNavigation("/admin/settings/team")}
                >
                  Team
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => handleNavigation("/admin/settings/permission-templates")}
                >
                  Permission Templates
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => handleNavigation("/admin/settings/licenses")}
                >
                  Licenses
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => handleNavigation("/admin/settings/workspace-preferences")}
                >
                  Workspace Preferences
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Users Management Tile */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaUsers className="mr-2" />
              Users
            </h2>
            <p>Register, assign roles, deactivate/activate users, and manage employee profiles.</p>
            <button
              className="mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => handleNavigation("/admin/ManageUsers")}
            >
              Manage Users
            </button>
          </div>

          {/* Campaigns Tile */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaBullhorn className="mr-2" />
              Campaigns
            </h2>
            <p>Create campaigns, assign users, track progress, and analyze performance.</p>
            <button
              className="mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => handleNavigation("/admin/campaigns1")}
            >
              Manage Campaigns
            </button>
          </div>

          {/* Lead Overview Tile */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaClipboardList className="mr-2" />
              Leads
            </h2>
            <p>Assign leads to users, filter by status, category, and campaign. Add or import leads.</p>
            <button
              className="mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => handleNavigation("/leads")}
            >
              View Leads
            </button>
          </div>

          {/* Reports Tile */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaChartLine className="mr-2" />
              Reports
            </h2>
            <p>Performance summaries by user, team, or campaign. Export data and download PDFs.</p>
            <button
              className="mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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