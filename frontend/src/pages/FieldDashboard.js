import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // added
import { FaUser, FaTasks, FaBullhorn, FaChartLine, FaPencilAlt } from "react-icons/fa"; // added icons
import Sidebar from "../components/Sidebar";

const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Follow-up",
  "Meeting Scheduled",
  "Proposal Sent",
  "Negotiating",
  "Won",
  "Lost",
  "Not Interested",
  "Wrong Number",
  "Invalid Lead",
  "Duplicate"
];

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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    if (!selectedLead) return;
    
    const token = user.token || localStorage.getItem("token");
    
    try {
      // Include existing lead data to maintain required fields
      const updateData = {
        name: selectedLead.name,        // Keep existing name
        phone_no: selectedLead.phone_no, // Keep existing phone
        status: leadStatus,             // New status
        notes: leadNotes,               // New notes
        updated_by: user.id
      };

      console.log('Updating lead with data:', updateData);

      const response = await fetch(`http://localhost:5000/api/leads/${selectedLead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error updating lead: ${response.status}`);
      }

      // Update local state
      setLeads(leads.map(lead => 
        lead.id === selectedLead.id 
          ? { ...lead, status: leadStatus, notes: leadNotes }
          : lead
      ));
      
      setSelectedLead(null);
      setUpdateMessage("Lead updated successfully");
      setTimeout(() => setUpdateMessage(""), 3000);

    } catch (err) {
      console.error("Update error:", err);
      setUpdateMessage(err.message || "Failed to update lead");
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
          <div className="bg-white rounded-lg shadow-lg p-6 col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
              <FaUser className="mr-2 text-blue-600" />
              Assigned Leads
            </h2>
            
            {leads.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Name</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Notes</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {leads.map(lead => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <FaUser className="mr-2 text-gray-400" />
                              <span className="font-medium text-gray-700">{lead.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${lead.status === "New" ? "bg-blue-100 text-blue-800" :
                              lead.status === "Contacted" ? "bg-yellow-100 text-yellow-800" :
                              lead.status === "Follow-up" ? "bg-purple-100 text-purple-800" :
                              lead.status === "Converted" ? "bg-green-100 text-green-800" :
                              "bg-gray-100 text-gray-800"}`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {lead.notes || "No notes"}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => {
                                setSelectedLead(lead);
                                setLeadStatus(lead.status);
                                setLeadNotes(lead.notes || '');
                                setIsModalOpen(true);
                              }}
                              className="inline-flex items-center px-2 py-1 border border-transparent rounded-md 
                                         text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 
                                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <FaPencilAlt className="mr-1" />
                              Update
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Removed bulk update button and logic since it's not needed */}
              </>
            ) : (
              <p className="text-gray-500 text-center py-8">No leads assigned yet.</p>
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
                onClick={() => navigate("/performance")}
              >
                View Performance
              </button>
            </div>
          </div>
        </div>
        
        {/* Update Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Update Lead: {selectedLead?.name}
                </h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={leadStatus}
                    onChange={(e) => setLeadStatus(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {LEAD_STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={leadNotes}
                    onChange={(e) => setLeadNotes(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    rows="3"
                    placeholder="Add notes..."
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedLead(null);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateLead();
                      setIsModalOpen(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldDashboard;