import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import axios from "axios";

const EditLead = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [lead, setLead] = useState(state?.lead || null);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]); // <-- Add this

  // Fetch user from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    } else {
      console.error("Unauthorized access.");
    }
  }, []);

  // Fetch users for Assigned To dropdown
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

  // Fetch lead details if not passed via state
  useEffect(() => {
    if (!lead) {
      const fetchLead = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.error("Authentication token is missing.");
            return;
          }

          const response = await axios.get(`http://localhost:5000/api/leads/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data) {
            setLead(response.data);
          } else {
            console.error("Unexpected API response format:", response.data);
          }
        } catch (error) {
          console.error("Error fetching lead details:", error.response?.data || error.message);
        }
      };

      fetchLead();
    }
  }, [id, lead]);

  const handleUpdateLead = async (updatedLead) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/leads/${id}`, updatedLead, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Lead updated successfully!");
      navigate("/leads");
    } catch (error) {
      console.error("Failed to update lead:", error.response?.data || error.message);
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        {/* Navbar */}
        <Navbar />

        {/* Edit Lead Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Edit Lead</h1>
          {lead ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateLead(lead);
              }}
            >
              {/* Customer Name */}
              <div className="mb-4">
                <label className="block text-gray-700">Customer Name</label>
                <input
                  type="text"
                  value={lead.name || ""}
                  onChange={(e) => setLead({ ...lead, name: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Phone Number */}
              <div className="mb-4">
                <label className="block text-gray-700">Phone Number</label>
                <input
                  type="text"
                  value={lead.phone_no || ""}
                  onChange={(e) => setLead({ ...lead, phone_no: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Status */}
              <div className="mb-4">
                <label className="block text-gray-700">Status</label>
                <select
                  value={lead.status || ""}
                  onChange={(e) => setLead({ ...lead, status: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Status</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Converted">Converted</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="block text-gray-700">Category</label>
                <select
                  value={lead.lead_category || ""}
                  onChange={(e) => setLead({ ...lead, lead_category: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Category</option>
                  <option value="Cold Lead">Cold Lead</option>
                  <option value="Warm Lead">Warm Lead</option>
                  <option value="Hot Lead">Hot Lead</option>
                </select>
              </div>

              {/* Assigned To */}
              <div className="mb-4">
                <label className="block text-gray-700">Assigned To</label>
                <select
                  value={lead.assigned_to || ""}
                  onChange={(e) => setLead({ ...lead, assigned_to: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select User</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Update Lead
              </button>
            </form>
          ) : (
            <p>Loading lead details...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditLead;