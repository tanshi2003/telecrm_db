import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import BackButton from "../components/BackButton";
import { FaPhone } from "react-icons/fa";

const Lead1 = () => {
  const [leadData, setLeadData] = useState({
    title: "",
    description: "",
    status: "New",
    lead_category: "",
    name: "",
    phone_no: "",
    address: "",
    assigned_to: "",
    campaign_id: "",
    notes: ""
  });
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  
  // Get role from localStorage to decide if we should fetch extra data.
  const role = localStorage.getItem("role")?.toLowerCase();

  // Only fetch users and campaigns if role is admin
  useEffect(() => {
    if(role === "admin"){
      fetchUsers();
      fetchCampaigns();
    }
  }, [role]);

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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if(response.data?.data){
        // Filter only callers from the users list
        const callers = response.data.data.filter(user => user.role === 'caller');
        setUsers(callers);
      }
    } catch (error) {
      console.error("Error fetching users:", error.response?.data || error.message);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/campaigns", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if(response.data?.data){
        setCampaigns(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error.response?.data || error.message);
    }
  };

  const handleAddLead = async () => {
    // Validate required fields
    if (!leadData.title || !leadData.status || !leadData.name || !leadData.phone_no) {
      alert("Please fill all required fields: Title, Status, Name, and Phone.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("user"));
      
      if (!token || !storedUser) {
        alert("⚠️ Authentication error! Please log in again.");
        navigate("/login");
        return;
      }

      const leadPayload = {
        title: leadData.title,
        description: leadData.description,
        status: leadData.status,
        lead_category: leadData.lead_category,
        name: leadData.name,
        phone_no: leadData.phone_no.startsWith('+91') ? leadData.phone_no : `+91${leadData.phone_no}`,
        address: leadData.address,
        assigned_to: leadData.assigned_to || null,
        admin_id: storedUser.id,
        campaign_id: leadData.campaign_id ? campaigns.find(c => c.name === leadData.campaign_id)?.id : null,
        notes: leadData.notes,
      };

      console.log('Sending lead data:', leadPayload);

      const response = await axios.post(
        "http://localhost:5000/api/leads",
        leadPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        alert("✅ Lead added successfully!");
        // Clear form
        setLeadData({
  title: "",
  description: "",
  status: "New",
  lead_category: "",
  name: "",
  phone_no: "",
  address: "",
  assigned_to: "",
  campaign_id: "",
  notes: ""
});
        navigate("/leads");
      } else {
        alert(response.data.message || "Failed to add lead");
      }
    } catch (error) {
      console.error("❌ Error adding lead:", error.response?.data || error);
      if (error.response?.status === 401) {
        alert("Session expired. Please log in again.");
        navigate("/login");
      } else {
        alert(error.response?.data?.message || "Failed to add lead 😔");
      }
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
              value={leadData.title}
              onChange={(e) => setLeadData({...leadData, title: e.target.value})}
              className="w-full p-2 rounded border shadow"
            />
          </div>

          <div>
            <label className="block font-semibold">Description</label>
            <input
              value={leadData.description}
              onChange={(e) => setLeadData({...leadData, description: e.target.value})}
              className="w-full p-2 rounded border shadow"
            />
          </div>

          <div>
            <label className="block font-semibold">Status</label>
            <select
              value={leadData.status}
              onChange={(e) => setLeadData({...leadData, status: e.target.value})}
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
              value={leadData.lead_category}
              onChange={(e) => setLeadData({...leadData, lead_category: e.target.value})}
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
              value={leadData.name}
              onChange={(e) => setLeadData({...leadData, name: e.target.value})}
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
                value={leadData.phone_no}
                onChange={(e) => setLeadData({...leadData, phone_no: e.target.value})}
                className="w-full p-2 rounded border shadow"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold">Address</label>
            <input
              value={leadData.address}
              onChange={(e) => setLeadData({...leadData, address: e.target.value})}
              className="w-full p-2 rounded border shadow"
            />
          </div>

          <div>
            <label className="block font-semibold">Assigned To</label>
            {role === "admin" ? (
              <select
                value={leadData.assigned_to || ""}
                onChange={(e) => setLeadData({...leadData, assigned_to: e.target.value})}
                className="w-full p-2 rounded border shadow bg-white"
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="p-2 border rounded bg-gray-100">N/A</p>
            )}
          </div>

          <div>
            <label className="block font-semibold">Campaign Name</label>
            {role === "admin" ? (
              <select
                value={leadData.campaign_id || ""}
                onChange={(e) => setLeadData({...leadData, campaign_id: e.target.value})}
                className="w-full p-2 rounded border shadow bg-white"
              >
                <option value="">Select Campaign</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.name}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="p-2 border rounded bg-gray-100">N/A</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold">Notes</label>
            <textarea
              value={leadData.notes}
              onChange={(e) => setLeadData({...leadData, notes: e.target.value})}
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