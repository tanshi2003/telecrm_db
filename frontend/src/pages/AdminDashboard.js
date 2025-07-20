import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaBullhorn, FaClipboardList } from "react-icons/fa"; // added icons

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

          
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;