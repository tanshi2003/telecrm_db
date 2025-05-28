import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import axios from "axios";

const Viewlead = () => {
  const { id } = useParams(); // Get the lead ID from the URL
  const { state } = useLocation(); // Access the state passed from Leads.js
  const navigate = useNavigate();
  const [lead, setLead] = useState(state?.lead || null); // Use passed lead data if available
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]); // For user names

  // Fetch user from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    } else {
      console.error("Unauthorized access.");
    }
  }, []);

  // Fetch users for Assigned To name
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data?.data) {
          setUsers(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error.response?.data || error.message);
      }
    };
    fetchUsers();
  }, []);

  // Fetch lead if not passed via state
  useEffect(() => {
    if (!lead) {
      const fetchLead = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(`http://localhost:5000/api/leads/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data) {
            setLead(response.data);
          }
        } catch (error) {
          console.error("Error fetching lead:", error.response?.data || error.message);
        }
      };
      fetchLead();
    }
  }, [id, lead]);

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        {/* Navbar */}
        <Navbar />

        {/* Lead Details */}
        <div className="bg-white p-6 rounded-lg shadow-md relative">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Lead Details</h1>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back
            </button>
          </div>
          {lead ? (
            <div>
              <p><strong>Customer Name:</strong> {lead.name || "N/A"}</p>
              <p><strong>Phone Number:</strong> {lead.phone_no || "N/A"}</p>
              <p><strong>Status:</strong> {lead.status || "N/A"}</p>
              <p><strong>Category:</strong> {lead.lead_category || "N/A"}</p>
              <p>
                <strong>Assigned To:</strong>{" "}
                {users.find((u) => u.id === lead.assigned_to)?.name || "N/A"}
              </p>
              <p><strong>Created At:</strong> {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "N/A"}</p>
              <p><strong>Updated At:</strong> {lead.updated_at ? new Date(lead.updated_at).toLocaleDateString() : "N/A"}</p>
            </div>
          ) : (
            <p>Loading lead details...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Viewlead;