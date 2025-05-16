import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar"; // Sidebar remains the same
import { useNavigate } from 'react-router-dom';

const ManageUser = () => { // ✅ Capitalized component name
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const storedAdmin = JSON.parse(localStorage.getItem("user"));
    if (storedAdmin) {
      setAdmin(storedAdmin);
    } else {
      console.error("Admin not found. Redirecting to login...");
      // TODO: Redirect to login if not found
    }
  }, []);
  const navigate = useNavigate();
  const handleRegisterclick = () => {
    navigate("/admin/users/register");
  };
  const handleManageRolesclick = () => {
    navigate("/admin/users/manage-roles");
  };
  const handleManageStatusclick = () => {
    navigate("/admin/users/manage-status");
  };
const handleEmployeeProfileclick = () => {
    navigate("/admin/users/employee-profile");
  } 
    
  const handleAllUsersclick = () => {
    navigate("/admin/users/all-user");
  };
  const handleAccessLogsclick = () => {
    navigate("/admin/users/access-logs");
  };
  // const handleViewAllUserclick = () => {
  //   navigate("/admin/users/all-user");
  // };
  // const handleViewLogeclick = () => {
  //   navigate("/admin/users/access-logs");
  // };
  // const handleViewProfileclick = () => {
  //   navigate("/admin/users/employee-profile");
  // };
  // const handleViewAllUserclick = () => {
  //   navigate("/admin/users/all-user");
  // };

  return (
    <div className="relative flex min-h-screen">
      {/* Sidebar */}
      <Sidebar user={admin} />

      {/* Main Content */}
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <button onClick={handleRegisterclick} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Register User
          </button>
        </div>

        {/* Dashboard Grid */}
        {/* Dashboard Grid - Updated with 6 Major Features */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

  {/* 1. View All Users */}
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-semibold mb-4">View All Users</h2>
    <p>Full list with details like Name, Email, Role, Status, Joined Date, Performance, Location & Leads.</p>
    <button onClick={handleAllUsersclick} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Open User List
    </button>
  </div>

  {/* 2. Role Management */}
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-semibold mb-4">Role Management</h2>
    <p>Change roles across Caller, Manager, and Field Employee. No one touches Admin unless it’s judgment day.</p>
    <button onClick={handleManageRolesclick} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Manage Roles
    </button>
  </div>

  {/* 3. Create New Users */}
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-semibold mb-4">Create New Users</h2>
    <p>Add user with role, phone, email, and optional lead/campaign assignment. Fast onboarding, zero drama.</p>
    <button onClick={handleRegisterclick} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Register New User
    </button>
  </div>

  {/* 4. Update & Edit User Info */}
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-semibold mb-4">Edit User Info</h2>
    <p>Edit name, phone, email, working hours, and field zones. Keep profiles fresh & functional.</p>
    <button onClick={handleEmployeeProfileclick} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Edit User Profiles
    </button>
  </div>

  {/* 5. User Status Control */}
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-semibold mb-4">User Status Control</h2>
    <p>Activate, suspend, or nuke users permanently. Confirmation required — we don’t do oopsies here.</p>
    <button onClick={handleManageStatusclick} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Manage Status
    </button>
  </div>

  {/* 6. Assign / Reassign Manager */}
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-semibold mb-4">Manager Assignment</h2>
    <p>Callers & field staff need a boss. Assign or reassign with dropdowns or drag-and-drop (if implemented).</p>
    <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Assign Manager
    </button>
  </div>
</div>

      </div>
    </div>
  );
};

export default ManageUser; 