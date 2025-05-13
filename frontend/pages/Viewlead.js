import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const Viewlead = () => {
  const { id } = useParams(); // Get the lead ID from the URL
  const { state } = useLocation(); // Access the state passed from Leads.js
  const [lead, setLead] = useState(state?.lead || null); // Use passed lead data if available
  const [user, setUser] = useState(null);

  // Fetch user from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    } else {
      console.error("Unauthorized access.");
    }
  }, []);

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        {/* Navbar */}
        <Navbar />

        {/* Lead Details */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Lead Details</h1>
          {lead ? (
            <div>
              <p><strong>Customer Name:</strong> {lead.name || "N/A"}</p>
              <p><strong>Phone Number:</strong> {lead.phone_no || "N/A"}</p>
              <p><strong>Status:</strong> {lead.status || "N/A"}</p>
              <p><strong>Category:</strong> {lead.lead_category || "N/A"}</p>
              <p><strong>Assigned To:</strong> {lead.assigned_to || "N/A"}</p>
              <p><strong>Created At:</strong> {new Date(lead.created_at).toLocaleDateString()}</p>
              <p><strong>Updated At:</strong> {new Date(lead.updated_at).toLocaleDateString()}</p>
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