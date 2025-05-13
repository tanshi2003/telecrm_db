import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar"; // Import Sidebar component

const CallerDashboard = () => {
  const [user, setUser] = useState(null);

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
      <Sidebar user={user} />

      {/* Main Content */}
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Caller Dashboard</h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add Call
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Call Logs Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Call Logs</h2>
            <ul className="list-disc pl-6">
              <li>Call with Client A</li>
              <li>Follow-up with Client B</li>
              <li>Scheduled call with Client C</li>
            </ul>
            <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              View All Calls
            </button>
          </div>

          {/* Assigned Leads Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Assigned Leads</h2>
            <ul className="list-disc pl-6">
              <li>Lead A</li>
              <li>Lead B</li>
              <li>Lead C</li>
            </ul>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              View All Leads
            </button>
          </div>

          {/* Notifications Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <ul className="list-disc pl-6">
              <li>New lead assigned</li>
              <li>Meeting scheduled with Manager</li>
            </ul>
            <button className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
              View All Notifications
            </button>
          </div>

          {/* Follow-Up Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Follow-Ups</h2>
            <p>Track and schedule follow-up calls with clients.</p>
            <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
              Schedule Follow-Up
            </button>
          </div>

          {/* Call Performance Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Call Performance</h2>
            <p>Analyze your call performance and success rate.</p>
            <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              View Performance
            </button>
          </div>

          {/* Client Feedback Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Client Feedback</h2>
            <p>Review feedback from clients to improve communication.</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              View Feedback
            </button>
          </div>

          {/* Call Scripts Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Call Scripts</h2>
            <p>Access pre-defined call scripts for better communication.</p>
            <button className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
              View Scripts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallerDashboard;