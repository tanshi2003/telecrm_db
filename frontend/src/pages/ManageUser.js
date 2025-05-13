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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Assign Roles */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Manage Roles</h2>
            <p>Assign appropriate roles to users like Admin, Caller, or Manager.</p>
            <button onClick={handleManageRolesclick}  className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Manage Roles
            </button>
          </div>

          {/* Activate/Deactivate Users */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">User Status</h2>
            <p>Activate or deactivate user accounts based on status.</p>
            <button onClick={handleManageStatusclick}  className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
              Manage Status
            </button>
          </div>

          {/* Manage Profiles */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">View Profiles</h2>
            <p>View and edit employee profile information.</p>
            <button onClick={handleEmployeeProfileclick}  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
              EmployeeProfile
            </button>
          </div>

          {/* Registered Users */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Registered Users</h2>
            <ul className="list-disc pl-6">
              <li>John Doe - Admin</li>
              <li>Jane Smith - Caller</li>
            </ul>
            <button onClick={handleAllUsersclick} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
             All Users
            </button>
          </div>

          {/* Access Logs */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">View Logs</h2>
            <p>Monitor login activity and suspicious access patterns.</p>
            <button onClick={handleAccessLogsclick} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Access Logs
            </button>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default ManageUser; 