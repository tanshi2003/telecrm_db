import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom"; // added Outlet
import { FaUser, FaTasks, FaBullhorn, FaChartLine } from "react-icons/fa"; // added icons
import Sidebar from "../components/Sidebar";

const FieldDashboard = () => {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadStatus, setLeadStatus] = useState("");
  const [leadNotes, setLeadNotes] = useState("");
  const [updateMessage, setUpdateMessage] = useState(""); // new state for success message

  const navigate = useNavigate(); // added

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    // use user.token if available, otherwise get token from localStorage
    const token = user.token || localStorage.getItem("token");
    if (!token) {
      console.error("Token is undefined, aborting API calls");
      return;
    }

    // Fetch Leads with error handling
    fetch(`/api/users/${user.id}/leads`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Error fetching leads: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setLeads(data.data || []);
        setTasks(data.data || []); // Just using leads as dummy tasks
      })
      .catch(err => console.error(err));

    // Fetch Campaigns with error handling
    fetch(`/api/users/${user.id}/campaigns`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Error fetching campaigns: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setCampaigns(data.data || []))
      .catch(err => console.error(err));

    // Fetch Stats with error handling
    fetch(`/api/users/${user.id}/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Error fetching stats: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setStats(data.data || null))
      .catch(err => console.error(err));
  }, [user]);

  const handleSelectLead = (lead) => {
    setSelectedLead(lead);
    setLeadStatus(lead.status);
    setLeadNotes(lead.notes || "");
  };

  const handleUpdateLead = async () => {
    if (!selectedLead) {
      console.log("No lead selected");
      return;
    }
    const token = user.token || localStorage.getItem("token");
    console.log("Updating lead", selectedLead.id, "with token:", token);

    try {
      const response = await fetch(`/api/leads/${selectedLead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: leadStatus, notes: leadNotes })
      });
      console.log("PUT response status:", response.status);
      if (!response.ok) {
        throw new Error(`Error updating lead: ${response.status}`);
      }
      
      // Refetch leads after update
      const res = await fetch(`/api/users/${user.id}/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Refetch leads response status:", res.status);
      if (!res.ok) {
        throw new Error(`Error re-fetching leads: ${res.status}`);
      }
      const data = await res.json();
      setLeads(data.data || []);
      setSelectedLead(null);

      // Set and log success message, then clear after 3 seconds
      setUpdateMessage("Lead updated successfully");
      console.log("Update message set");
      setTimeout(() => {
        setUpdateMessage("");
        console.log("Update message cleared");
      }, 3000);
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const totalLeads = stats?.total_leads || 0;
  const convertedLeads = leads.filter(l => l.status === "Converted").length;
  const conversionRate = totalLeads ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

  return (
    <div className="relative flex min-h-screen">
      <Sidebar user={user} />
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Field Employee Dashboard</h1>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => navigate("/addlead")}
          >
            Create Lead
          </button>
        </div>
        {/* Persistent Update Message */}
        {updateMessage && (
          <div className="p-4 mb-4 text-green-700 bg-green-100 rounded">
            {updateMessage}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Assigned Leads Tile */}
          <div className="bg-white p-4 rounded shadow-md hover:shadow-lg transition transform duration-300 col-span-1 flex flex-col">
            <h2 className="text-xl font-semibold mb-2 flex items-center">
              <FaUser className="mr-2" />
              Assigned Leads
            </h2>
            {selectedLead ? (
              // Update form embedded within the tile
              <>
                <div className="mb-2">
                  <label className="block mb-1 font-medium">Status</label>
                  <select
                    value={leadStatus}
                    onChange={e => setLeadStatus(e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                  >
                    <option>New</option>
                    <option>Contacted</option>
                    <option>Follow-up</option>
                    <option>Converted</option>
                    <option>Not Interested</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="block mb-1 font-medium">Notes</label>
                  <textarea
                    value={leadNotes}
                    onChange={e => setLeadNotes(e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={handleUpdateLead}
                  >
                    Save
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                    onClick={() => setSelectedLead(null)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              // Show the list of leads with icons; no update panel visible
              <>
                <p className="mb-2 text-sm text-gray-700">
                  Manage and update your assigned leads to track performance.
                </p>
                {leads.length > 0 ? (
                  <ul className="flex-grow">
                    {leads.slice(0, 5).map(lead => (
                      <li key={lead.id} className="mb-2 flex justify-between items-center">
                        <span className="flex items-center">
                          <FaUser className="mr-1" />
                          {lead.name}{" "}
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            lead.status === "New" ? "bg-blue-200" :
                            lead.status === "Contacted" ? "bg-yellow-200" :
                            lead.status === "Follow-up" ? "bg-purple-200" :
                            lead.status === "Converted" ? "bg-green-300" :
                            lead.status === "Not Interested" ? "bg-red-200" :
                            "bg-gray-200"
                          }`}>
                            {lead.status}
                          </span>
                        </span>
                        {/* Removed individual Update button */}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 flex-grow">No leads assigned yet.</p>
                )}
                <div className="flex justify-center mt-4">
                  {/* On click, set selectedLead to the first lead to trigger update form */}
                  <button 
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => leads.length > 0 && setSelectedLead(leads[0])}
                  >
                    Manage Leads
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* Today's Tasks */}
          <div className="bg-white p-4 rounded shadow-md hover:shadow-lg transition transform duration-300 col-span-1 flex flex-col">
            <h2 className="text-xl font-semibold mb-2 flex items-center">
              <FaTasks className="mr-2" />
              Today's Tasks
            </h2>
            <p className="mb-2 text-sm text-gray-700">
              Check your daily tasks and update progress.
            </p>
            {tasks.length > 0 ? (
              <ul className="flex-grow">
                {tasks.slice(0, 5).map(task => (
                  <li key={task.id} className="mb-2">{task.task || task.name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 flex-grow">No tasks for today.</p>
            )}
            <div className="flex justify-center mt-4">
              <button 
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => navigate("/tasks")}
              >
                Daily Tasks
              </button>
            </div>
          </div>
          
          {/* Campaigns Tile */}
          <div className="bg-white p-4 rounded shadow-md hover:shadow-lg transition transform duration-300 col-span-1 flex flex-col">
            <h2 className="text-xl font-semibold mb-2 flex items-center">
              <FaBullhorn className="mr-2" />
              Campaigns
            </h2>
            <p className="mb-2 text-sm text-gray-700">
              Create, assign, and track campaigns for optimal performance.
            </p>
            {campaigns.length > 0 ? (
              <ul className="flex-grow">
                {campaigns.slice(0, 5).map(camp => (
                  <li key={camp.id} className="mb-2 flex justify-between">
                    <span>{camp.name}</span>
                    <span className="bg-blue-100 px-2 rounded text-sm">
                      {camp.lead_count || "0"} Leads
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 flex-grow">No campaigns assigned yet.</p>
            )}
            <div className="flex justify-center mt-4">
              <button 
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => navigate("/CampaignDetails")}
              >
                Campaign Info
              </button>
            </div>
          </div>
          
          {/* Performance Summary */}
          <div className="bg-white p-4 rounded shadow-md hover:shadow-lg transition transform duration-300 col-span-1 flex flex-col">
            <h2 className="text-xl font-semibold mb-2 flex items-center">
              <FaChartLine className="mr-2" />
              Performance Summary
            </h2>
            <p className="mb-2 text-sm text-gray-700">
              Review overall performance and key metrics.
            </p>
            <ul className="flex-grow space-y-2 text-gray-800">
              <li>Total Leads Handled: <b>{totalLeads}</b></li>
              <li>Leads Converted: <b>{convertedLeads}</b></li>
              <li>Conversion Rate: <b>{conversionRate}%</b></li>
            </ul>
            <div className="flex justify-center mt-4">
              <button 
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => navigate("/performance")}
              >
                View Summary
              </button>
            </div>
          </div>
          
        </div>
        {/* Remove separate update panel outside the grid */}
        <Outlet /> {/* Render nested routes here */}
      </div>
    </div>
  );
};

export default FieldDashboard;
