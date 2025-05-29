import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar"; // Sidebar remains the same
import { useNavigate } from 'react-router-dom';
import BackButton from "../components/BackButton";

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
  const handleAllUsersclick = () => {
    navigate("/admin/users/all-user");
  };
  const handleAssignManagerClick = () => {
    navigate("/admin/users/assign-manager");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
          <BackButton />
        </div>

        {/* Dashboard Grid */}
        {/* Dashboard Grid - Updated with 6 Major Features */}

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

  {/* 1. View All Users */}
  <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
    <h2 className="text-xl font-semibold mb-4">View All Users</h2>
    <p>Full list with details like Name, Email, Role, Status, Joined Date, Performance, Location & Leads.</p>
    <button onClick={handleAllUsersclick} className="mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Open User List
    </button>
  </div>

  {/* 2. Role Management */}
  <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
    <h2 className="text-xl font-semibold mb-4">Role Management</h2>
    <p>Change roles across Caller, Manager, and Field Employee. No one touches Admin unless it's judgment day.</p>
    <button onClick={handleManageRolesclick} className="mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Manage Roles
    </button>
  </div>

  {/* 3. Create New Users */}
  <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
    <h2 className="text-xl font-semibold mb-4">Create New Users</h2>
    <p>Add user with role, phone, email, and optional lead/campaign assignment. Fast onboarding, zero drama.</p>
    <button onClick={handleRegisterclick} className="mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Register New User
    </button>
  </div>

  {/* 5. User Status Control */}
  <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
    <h2 className="text-xl font-semibold mb-4">User Status Control</h2>
    <p>Activate, suspend, or nuke users permanently. Confirmation required — we don't do oopsies here.</p>
    <button onClick={handleManageStatusclick} className="mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Manage Status
    </button>
  </div>

  {/* 6. Assign / Reassign Manager */}
  <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
    <h2 className="text-xl font-semibold mb-4">Manager Assignment</h2>
    <p>Callers & field staff need a boss. Assign or reassign with dropdowns or drag-and-drop (if implemented).</p>
    <button
      onClick={handleAssignManagerClick}
      className="mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Assign Manager
    </button>
  </div>

  {/* 7. View Teams */}
  <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
    <h2 className="text-xl font-semibold mb-4">Team Overview</h2>
    <p>View all teams and their members organized by managers.</p>
    <button
      onClick={() => navigate("/admin/users/teams")}
      className="mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      View Teams
    </button>
  </div>
</div>


      </div>
    </div>
  );
};

export default ManageUser;