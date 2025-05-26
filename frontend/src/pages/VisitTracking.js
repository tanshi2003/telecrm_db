import React from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton"; // Import BackButton

const VisitTracking = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <div className="flex-grow p-6 bg-gray-100 ml-64 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Visit Tracking</h1>
          {/* <button onClick={() => navigate("/field-dashboard")} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800">
            ← Back to Dashboard
          </button> */}
          <BackButton /> {/* Use BackButton instead of a custom button */}
        </div>
        <div className="bg-white p-6 rounded shadow-md">
          <p>Track your visits and update their statuses here.</p>
          {/* Add visit tracking form here */}
        </div>
      </div>
    </div>
  );
};

export default VisitTracking;
