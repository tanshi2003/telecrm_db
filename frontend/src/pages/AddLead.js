import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";
import { FaPhone } from "react-icons/fa";

const BASE_URL = "http://localhost:5000";

const AddLead = () => {
  const [leadData, setLeadData] = useState({
    name: "",
    phone_no: "",
    lead_category: "",
    status: "",
    address: "",
    notes: "",
  });

  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const role = localStorage.getItem("role")?.toLowerCase();
  const storedUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const token = localStorage.getItem("token");
    const allowedRoles = ["admin", "manager", "caller", "field_employee"];

    if (!token || !allowedRoles.includes(role)) {
      navigate("/leads");
      return;
    }

    if (storedUser?.name) {
      setUserName(storedUser.name);
    }
  }, [navigate, role, storedUser]);

  // Add at the top of your component
  useEffect(() => {
    const checkStorage = () => {
      console.log('Token:', localStorage.getItem('token'));
      console.log('User:', localStorage.getItem('user'));
      console.log('Role:', localStorage.getItem('role'));
    };

    checkStorage();
    // Remove this in production
  }, []);

  // Log auth state every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const authData = {
        token: localStorage.getItem('token'),
        user: localStorage.getItem('user'),
        role: localStorage.getItem('role')
      };
      console.log('Auth state:', authData);
    }, 2000);

    return () => clearInterval(interval);
  }, []);
  // Update handleAddLead function
  const handleAddLead = async () => {
    const { name, phone_no, lead_category, status, address, notes } = leadData;

    if (!name || !phone_no) {
      alert("Name and Phone number are required.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("user"));

      if (!token || !storedUser) {
        alert("Session expired. Please login again.");
        return;
      }

      const leadPayload = {
        name,
        phone_no: phone_no.startsWith("+91") ? phone_no : `+91${phone_no}`,
        lead_category: lead_category || "Cold Lead",
        status: status || "New",
        address,
        notes,
        created_by: storedUser.id
      };

      const response = await axios({
        method: 'post',
        url: `${BASE_URL}/api/leads/add-lead`,
        data: leadPayload,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        alert("✅ Lead added successfully!");
        setLeadData({
          name: "",
          phone_no: "",
          lead_category: "Cold Lead",
          status: "New",
          address: "",
          notes: ""
        });
        
        if (role === "caller") {
          navigate("/caller-dashboard");
        } else if (role === "field_employee") {
          navigate("/field_employee-dashboard");
        } else {
          navigate("/leads");
        }
      }
    } catch (error) {
      console.error("Add lead error:", error);
      alert(error.response?.data?.message || "Failed to add lead");
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar />      <div className="flex-grow bg-gray-100 ml-64 mt-16 p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Add New Lead</h1>
          <BackButton />
        </div>

        <p className="text-gray-800 text-sm font-semibold truncate mb-4">
          Hey, {userName || "User"}!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mt-4">
          <div>
            <label className="block font-semibold">Name</label>
            <input
              value={leadData.name}
              onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
              className="w-full p-2 rounded border shadow"
            />
          </div>

          <div>
            <label className="block font-semibold">Phone</label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 border rounded shadow bg-white">
                <FaPhone /> +91
              </div>
              <input
                value={leadData.phone_no}
                onChange={(e) => setLeadData({ ...leadData, phone_no: e.target.value })}
                className="w-full p-2 rounded border shadow"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold">Lead Category</label>
            <select
              value={leadData.lead_category}
              onChange={(e) => setLeadData({ ...leadData, lead_category: e.target.value })}
              className="w-full p-2 rounded border shadow"
            >
              {["Cold Lead", "Warm Lead", "Hot Lead", "Bulk Lead", "Converted Lead", "Lost Lead"].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold">Status</label>
            <select
              value={leadData.status}
              onChange={(e) => setLeadData({ ...leadData, status: e.target.value })}
              className="w-full p-2 rounded border shadow"
            >
              {["New", "Contacted", "Interested", "Not Interested", "Follow-Up", "Converted", "Lost"].map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold">Address</label>
            <input
              value={leadData.address}
              onChange={(e) => setLeadData({ ...leadData, address: e.target.value })}
              className="w-full p-2 rounded border shadow"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold">Notes</label>
            <textarea
              value={leadData.notes}
              onChange={(e) => setLeadData({ ...leadData, notes: e.target.value })}
              className="w-full p-2 rounded border shadow"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={handleAddLead}
            className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
          >
            Add Lead
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLead;