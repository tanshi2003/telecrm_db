import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [performance, setPerformance] = useState({});
  const [campaigns, setCampaigns] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const socket = io("http://localhost:5000");
  console.log("UserDashboard component is rendering");

  const checkUserStatus = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    try {
      const res = await axios.get("http://localhost:5000/api/auth/check-user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.data.isUser) {
        navigate("/login");
      }
    } catch (error) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    fetchLeads();
    fetchPerformance();
    fetchCampaigns();
    checkUserStatus();

    socket.on("notification", (notification) => {
      setNotifications((prevNotifications) => [...prevNotifications, notification]);
    });

    return () => {
      socket.disconnect();
    };
  }, [checkUserStatus, socket]);

  const fetchLeads = async () => {
    const res = await axios.get("http://localhost:5000/api/leads/my-leads");
    setLeads(res.data);
  };

  const fetchPerformance = async () => {
    const res = await axios.get("http://localhost:5000/api/performance/my-performance");
    setPerformance(res.data);
  };

  const fetchCampaigns = async () => {
    const res = await axios.get("http://localhost:5000/api/campaigns/my-campaigns");
    setCampaigns(res.data);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="navbar">
        <h2>User Dashboard</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="content">
        <section className="lead-management">
          <h3>My Leads</h3>
          <ul>
            {leads.map((lead) => (
              <li key={lead.id}>{lead.name}</li>
            ))}
          </ul>
        </section>
        <section className="performance">
          <h3>My Performance</h3>
          <p>Leads assigned: {performance.leadsAssigned}</p>
          <p>Leads converted: {performance.leadsConverted}</p>
        </section>
        <section className="campaign-involvement">
          <h3>My Campaigns</h3>
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
      </div>
    </div>
  );
};

export default UserDashboard;