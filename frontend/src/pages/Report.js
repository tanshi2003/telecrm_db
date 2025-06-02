import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { FaChartLine, FaPhoneVolume, FaClipboardList } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

const Reports = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    } else {
      alert("Please login to access reports.");
      navigate("/login");
    }
  }, [navigate]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={user} />
      <div className="flex-1 p-8 ml-64 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Reports</h1>
          <BackButton/>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Leaderboard */}
          <div 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => handleNavigation(`/report-leaderboard/${user?.id}`)}
          >
            <div className="flex items-center mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <FaChartLine className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Leaderboard</h3>
            <p className="text-gray-600 text-sm">
              Monitor team performance and rankings based on lead conversions and campaign contributions.
            </p>
          </div>

          {/* Calls Report */}
          <div 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => handleNavigation("/CallReport")}
          >
            <div className="flex items-center mb-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <FaPhoneVolume className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Calls Report</h3>
            <p className="text-gray-600 text-sm">
              View call statistics and performance metrics.
            </p>
          </div>

          {/* Leads Report */}
          <div 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => handleNavigation("/LeadsReport")}
          >
            <div className="flex items-center mb-4">
              <div className="bg-purple-50 p-3 rounded-lg">
                <FaClipboardList className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Leads Report</h3>
            <p className="text-gray-600 text-sm">
              Track lead progress and conversion trends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

