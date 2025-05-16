import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";
import { FaPhone } from "react-icons/fa";
import axios from "axios";

const Lead1 = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [leadCategory, setLeadCategory] = useState("");
  const [address, setAddress] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [notes, setNotes] = useState("");
  const [userName, setUserName] = useState("");
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    // Validate user access
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role")?.toLowerCase();
    const allowedRoles = ["admin", "manager", "caller", "field_employee"];

    if (!token || !allowedRoles.includes(role)) {
      console.log("Unauthorized access to Lead1. Token:", !!token, "Role:", role);
      navigate("/login");
      return;
    }

    // Fetch the user's name from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.name) {
      setUserName(storedUser.name);
    } else {
      setUserName("User");
    }
  }, [navigate]);

  useEffect(() => {
    // Fetch users for Assigned To dropdown
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

  useEffect(() => {
    // Fetch campaigns for Campaign Name dropdown
    const fetchCampaigns = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/campaigns", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data?.data) {
          setCampaigns(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error.response?.data || error.message);
      }
    };
    fetchCampaigns();
  }, []);

  const handleAddLead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("⚠️ Authentication token missing!");
        return;
      }

      await axios.post(
        "http://localhost:5000/api/leads",
        {
          name,
          phone_no: `+91${phone}`,
          title,
          description,
          status,
          lead_category: leadCategory,
          address,
          assigned_to: assignedTo,
          campaign_name: campaignName,
          notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("✅ Lead added successfully!");
      setName("");
      setPhone("");
      setTitle("");
      setDescription("");
      setStatus("");
      setLeadCategory("");
      setAddress("");
      setAssignedTo("");
      setCampaignName("");
      setNotes("");
      navigate("/leads");
    } catch (error) {
      console.error("❌ Error adding lead:", error.response?.data || error.message);
      alert("Failed to add lead 😔");
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-grow bg-gray-100 ml-64 mt-16 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="company-box text-lg font-semibold">
            Engineering Techno World 🛠️
          </div>
          <BackButton />
        </div>

        {/* Welcome Message */}
        <p className="text-gray-800 text-sm font-semibold truncate">
          Hey, {userName}!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <div>
            <label className="block font-semibold">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded border shadow"
            />
          </div>

          <div>
            <label className="block font-semibold">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded border shadow"
            />
          </div>

          <div>
            <label className="block font-semibold">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 rounded border shadow"
            >
              <option value="">Select Status</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Follow-Up Scheduled">Follow-Up Scheduled</option>
              <option value="Interested">Interested</option>
              <option value="Not Interested">Not Interested</option>
              <option value="Call Back Later">Call Back Later</option>
              <option value="Under Review">Under Review</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
              <option value="Not Reachable">Not Reachable</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold">Lead Category</label>
            <select
              value={leadCategory}
              onChange={(e) => setLeadCategory(e.target.value)}
              className="w-full p-2 rounded border shadow"
            >
              <option value="">Select Lead Category</option>
              <option value="Fresh Lead">Fresh Lead</option>
              <option value="Bulk Lead">Bulk Lead</option>
              <option value="Cold Lead">Cold Lead</option>
              <option value="Warm Lead">Warm Lead</option>
              <option value="Hot Lead">Hot Lead</option>
              <option value="Converted Lead">Converted Lead</option>
              <option value="Lost Lead">Lost Lead</option>
              <option value="Walk-in Lead">Walk-in Lead</option>
              <option value="Re-Targeted Lead">Re-Targeted Lead</option>
              <option value="Campaign Lead">Campaign Lead</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded border shadow"
            />
          </div>

          <div>
            <label className="block font-semibold">Phone</label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 border rounded shadow bg-white">
                <FaPhone />
                +91
              </div>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 rounded border shadow"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold">Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2 rounded border shadow"
            />
          </div>

          <div>
            <label className="block font-semibold">Assigned To</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full p-2 rounded border shadow bg-white"
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold">Campaign Name</label>
            <select
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full p-2 rounded border shadow bg-white"
            >
              <option value="">Select Campaign</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.name}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 rounded border shadow"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={handleAddLead}
            className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-md shadow-md hover:bg-blue-600 transition"
          >
            Add Lead
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lead1;