import React from "react";
import Sidebar from "../components/Sidebar"; // Import Sidebar component

const AdminDashboard = ({ user }) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div className="flex-grow bg-gray-100 p-8 ml-64">
        {/* Header Section */}
        <div className="navbar mb-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold">Admin Dashboard</h2>
          
        </div>

        {/* Dashboard Content */}
        <div className="content">
          {/* Lead Management Section */}
          <section className="lead-management mb-6">
            <h3 className="text-xl font-semibold mb-2">Lead Management</h3>
            <ul className="list-disc pl-6">
              <li>Lead 1</li>
              <li>Lead 2</li>
            </ul>
          </section>

          {/* Employee Performance Section */}
          <section className="employee-performance mb-6">
            <h3 className="text-xl font-semibold mb-2">Employee Performance Tracking</h3>
            <ul className="list-disc pl-6">
              <li>Employee 1 - Leads converted: 5</li>
              <li>Employee 2 - Leads converted: 3</li>
            </ul>
          </section>

          {/* Campaign Management Section */}
          <section className="campaign-management mb-6">
            <h3 className="text-xl font-semibold mb-2">Campaign Management</h3>
            <ul className="list-disc pl-6">
              <li>Campaign 1</li>
              <li>Campaign 2</li>
            </ul>
          </section>

          {/* Real-Time Communication Section */}
          <section className="realtime-communication mb-6">
            <h3 className="text-xl font-semibold mb-2">Real-Time Communication</h3>
            <ul className="list-disc pl-6">
              <li>Notification 1</li>
              <li>Notification 2</li>
            </ul>
          </section>

          {/* User Management Section */}
          <section className="user-management">
            <h3 className="text-xl font-semibold mb-2">Admin Management</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Register User
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;