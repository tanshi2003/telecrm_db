import React, { useEffect, useState } from "react";
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
    if (!selectedLead) return;
    const token = user.token;

    try {
      const response = await fetch(`/api/leads/${selectedLead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: leadStatus, notes: leadNotes })
      });
      if (!response.ok) {
        throw new Error(`Error updating lead: ${response.status}`);
      }
      
      // Refetch leads after update with error checking
      const res = await fetch(`/api/users/${user.id}/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error(`Error re-fetching leads: ${res.status}`);
      }
      const data = await res.json();
      setLeads(data.data || []);
      setSelectedLead(null);
    } catch (err) {
      console.error(err);
    }
  };

  const totalLeads = stats?.total_leads || 0;
  const convertedLeads = leads.filter(l => l.status === "Converted").length;
  const conversionRate = totalLeads ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

  return (
    <div className="relative flex min-h-screen">
      <Sidebar user={user} />
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        <h1 className="text-3xl font-bold mb-6">Field Employee Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Assigned Leads */}
          <div className="bg-white p-6 rounded-lg shadow-md col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Assigned Leads</h2>
              <button className="text-blue-600 text-sm underline hover:text-blue-800">
                View All
              </button>
            </div>
            {leads.length > 0 ? (
              <ul>
                {leads.slice(0, 5).map(lead => (
                  <li key={lead.id} className="mb-2 flex justify-between items-center">
                    <span>
                      {lead.name}{" "}
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        lead.status === "New" ? "bg-blue-200" :
                        lead.status === "Contacted" ? "bg-yellow-200" :
                        lead.status === "Converted" ? "bg-green-300" :
                        "bg-gray-200"
                      }`}>
                        {lead.status}
                      </span>
                    </span>
                    <button
                      className="text-sm text-blue-500 hover:underline"
                      onClick={() => handleSelectLead(lead)}
                    >
                      Update
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No leads assigned yet.</p>
            )}
          </div>

          {/* Lead Status Update */}
          {selectedLead && (
            <div className="bg-white p-6 rounded-lg shadow-md col-span-1">
              <h2 className="text-xl font-semibold mb-4">Update Lead: {selectedLead.name}</h2>
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
            </div>
          )}

          {/* Tasks */}
          <div className="bg-white p-6 rounded-lg shadow-md col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Today's Tasks</h2>
              <button className="text-blue-600 text-sm underline hover:text-blue-800">
                View All
              </button>
            </div>
            {tasks.length > 0 ? (
              <ul>
                {tasks.slice(0, 5).map(task => (
                  <li key={task.id} className="mb-2">{task.task || task.name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No tasks for today.</p>
            )}
          </div>

          {/* Campaigns */}
          <div className="bg-white p-6 rounded-lg shadow-md col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Campaigns</h2>
              <button className="text-blue-600 text-sm underline hover:text-blue-800">
                View All
              </button>
            </div>
            {campaigns.length > 0 ? (
              <ul>
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
              <p className="text-gray-500">No campaigns assigned yet.</p>
            )}
          </div>

          {/* Performance */}
          <div className="bg-white p-6 rounded-lg shadow-md col-span-1">
            <h2 className="text-xl font-semibold mb-4">Performance Summary</h2>
            <ul className="space-y-2 text-gray-800">
              <li>
                Total Leads Handled: <b>{totalLeads}</b>
              </li>
              <li>
                Leads Converted: <b>{convertedLeads}</b>
              </li>
              <li>
                Conversion Rate: <b>{conversionRate}%</b>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FieldDashboard;