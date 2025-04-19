import React from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="navbar">
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="content">
        <section className="lead-management">
          <h3>Lead Management</h3>
          {/* Mock Data */}
          <ul>
            <li>Lead 1</li>
            <li>Lead 2</li>
          </ul>
        </section>
        <section className="employee-performance">
          <h3>Employee Performance Tracking</h3>
          {/* Mock Data */}
          <ul>
            <li>Employee 1 - Leads converted: 5</li>
            <li>Employee 2 - Leads converted: 3</li>
          </ul>
        </section>
        <section className="campaign-management">
          <h3>Campaign Management</h3>
          {/* Mock Data */}
          <ul>
            <li>Campaign 1</li>
            <li>Campaign 2</li>
          </ul>
        </section>
        <section className="realtime-communication">
          <h3>Real-Time Communication</h3>
          <ul>
            <li>Notification 1</li>
            <li>Notification 2</li>
          </ul>
        </section>
        <section className="user-management">
          <h3>Admin Management</h3>
          <button>Register User</button>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;