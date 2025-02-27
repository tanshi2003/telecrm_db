import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCSVReader } from "react-papaparse";
import { io } from "socket.io-client";

const Dashboard = () => {
  const navigate = useNavigate();
  const { CSVReader } = useCSVReader();
  const [leads, setLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const socket = io("http://localhost:5000");

  const checkAdminStatus = useCallback(async () => {
    // Check if the user is an admin
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    try {
      const res = await axios.get("http://localhost:5000/api/auth/check-admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsAdmin(res.data.isAdmin);
    } catch (error) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    // Fetch initial data
    fetchLeads();
    fetchEmployees();
    fetchCampaigns();
    checkAdminStatus();

    // Handle real-time notifications
    socket.on("notification", (notification) => {
      setNotifications((prevNotifications) => [...prevNotifications, notification]);
    });

    return () => {
      socket.disconnect();
    };
  }, [checkAdminStatus, socket]);

  const fetchLeads = async () => {
    const res = await axios.get("http://localhost:5000/api/leads");
    setLeads(res.data);
  };

  const fetchEmployees = async () => {
    const res = await axios.get("http://localhost:5000/api/employees");
    setEmployees(res.data);
  };

  const fetchCampaigns = async () => {
    const res = await axios.get("http://localhost:5000/api/campaigns");
    setCampaigns(res.data);
  };

  const handleLeadImport = async (data) => {
    try {
      await axios.post("http://localhost:5000/api/leads/import", data);
      fetchLeads();
      alert("Leads imported successfully!");
    } catch (error) {
      alert("Failed to import leads.");
    }
  };

  const handleAddLead = async (lead) => {
    try {
      await axios.post("http://localhost:5000/api/leads", lead);
      fetchLeads();
      alert("Lead added successfully!");
    } catch (error) {
      alert("Failed to add lead.");
    }
  };

  const handleAddCampaign = async (campaign) => {
    try {
      await axios.post("http://localhost:5000/api/campaigns", campaign);
      fetchCampaigns();
      alert("Campaign added successfully!");
    } catch (error) {
      alert("Failed to add campaign.");
    }
  };

  const handleRegisterUser = async (user) => {
    try {
      await axios.post("http://localhost:5000/api/auth/register", user);
      alert("User registered successfully!");
    } catch (error) {
      alert("Failed to register user.");
    }
  };

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
          <button onClick={() => handleAddLead({ /* lead data */ })}>Add Lead</button>
          <CSVReader
            onUploadAccepted={(results) => {
              handleLeadImport(results.data);
            }}
          >
            {({ getRootProps, acceptedFile }) => (
              <>
                <button type="button" {...getRootProps()}>
                  Import Leads
                </button>
                {acceptedFile && acceptedFile.name}
              </>
            )}
          </CSVReader>
          <ul>
            {leads.map((lead) => (
              <li key={lead.id}>{lead.name}</li>
            ))}
          </ul>
        </section>
        <section className="employee-performance">
          <h3>Employee Performance Tracking</h3>
          <ul>
            {employees.map((employee) => (
              <li key={employee.id}>
                {employee.name} - Leads converted: {employee.leadsConverted}
              </li>
            ))}
          </ul>
        </section>
        <section className="campaign-management">
          <h3>Campaign Management</h3>
          <button onClick={() => handleAddCampaign({ /* campaign data */ })}>Add Campaign</button>
          <ul>
            {campaigns.map((campaign) => (
              <li key={campaign.id}>{campaign.name}</li>
            ))}
          </ul>
        </section>
        <section className="realtime-communication">
          <h3>Real-Time Communication</h3>
          <ul>
            {notifications.map((notification, index) => (
              <li key={index}>{notification.message}</li>
            ))}
          </ul>
        </section>
        <section className="user-management">
          <h3>Admin Management</h3>
          {isAdmin && (
            <button onClick={() => handleRegisterUser({ /* user data */ })}>Register User</button>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;