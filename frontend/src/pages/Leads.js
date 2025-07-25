import api from '../config/api';
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

const Leads = () => {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]); 
  // Removed unused filters and setFilters state
  const navigate = useNavigate();
  
  // Define fetchLeadsAndUsers before using it
  const fetchLeadsAndUsers = React.useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/leads`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setLeads(response.data.data);
      } else {
        console.error("Failed to fetch leads:", response.data.message);
      }

      // Fetch users
      const usersResponse = await api.get(`/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(usersResponse.data.data || []);
    } catch (error) {
      console.error("Error fetching leads or users:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  }, [navigate]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    
    if (!storedUser || !token) {
      console.error("No user data or token found");
      navigate("/login");
      return;
    }

    setUser(storedUser);
    fetchLeadsAndUsers();
  }, [navigate, fetchLeadsAndUsers]);

  // Map assigned_to ID to user name using the fetched users
  const getAssignedUserName = (userId) => {
    const foundUser = users.find((u) => u._id === userId || u.id === userId);
    return foundUser ? foundUser.name : "N/A";
  };

  // Removed unused handleFilterChange

  // Delete lead from frontend and database
  const handleDeleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLeads((prevLeads) => prevLeads.filter((lead) => lead._id !== id && lead.id !== id));
      console.log("Lead deleted successfully.");
    } catch (error) {
      alert("Failed to delete lead.");
      console.error("Failed to delete lead:", error.response?.data || error.message);
    }
  };

  // No filters, so show all leads
  const filteredLeads = leads;

  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar user={user} />

      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Leads</h1>
          <div className="flex gap-2">
            {/* Removed Add Lead button */}
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600"
            >
              Back
            </button>
          </div>
        </div>
        <p className="text-gray-600 mb-6">Add, update, or import leads easily.</p>

        {/* Cards for Add/Update/Import */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md w-full min-h-[220px] flex flex-col justify-between">
            <div>
              <h4 className="font-semibold text-lg mb-2">Add Lead</h4>
              <p className="text-sm text-gray-600 mb-4">Add a new lead to the system.</p>
            </div>
            <button
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => navigate("/Lead1")}
            >
              + Add Lead
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md w-full min-h-[220px] flex flex-col justify-between">
            <div>
              <h4 className="font-semibold text-lg mb-2">Update Lead</h4>
              <p className="text-sm text-gray-600 mb-4">Modify existing lead details and track progress.</p>
            </div>
            <button
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => navigate("/Updatelead")}
            >
              + Update Lead
            </button>
          </div>
        </section>

        {/* Lead List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="font-semibold text-lg mb-4">Lead List</h4>
          {filteredLeads.length === 0 ? (
            <p>No leads available. Add a new lead to get started.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLeads.map((lead) => (
                <div
                  key={lead._id || lead.id}
                  className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between min-h-[320px]"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{lead.title || "N/A"}</h3>
                    <p className="text-sm text-gray-600 mb-1">
                      Customer Name: <strong>{lead.name || "N/A"}</strong>
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      Phone Number: <strong>{lead.phone_no || "N/A"}</strong>
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      Status: <strong>{lead.status || "N/A"}</strong>
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      Category: <strong>{lead.lead_category || "N/A"}</strong>
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      Assigned To: <strong>{getAssignedUserName(lead.assigned_to)}</strong>
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      Created At: {new Date(lead.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      Updated At: {new Date(lead.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-3 flex gap-2 justify-center">
                    <button
                      onClick={() => navigate(`/viewlead/${lead._id || lead.id}`, { state: { lead } })}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/editlead/${lead._id || lead.id}`, { state: { lead } })}
                      className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLead(lead._id || lead.id)}
                      className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leads;