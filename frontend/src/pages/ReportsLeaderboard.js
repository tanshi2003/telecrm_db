import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

const Reports = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.role === "admin") {
      setUser(storedUser);
    } else {
      console.error("Unauthorized access. Redirecting to login...");
    }
  }, [navigate]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <div className="flex gap-4">
            <BackButton />
            <button
              onClick={() => handleNavigation("/admin/settings")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              System Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
        
