import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { FaBullhorn } from "react-icons/fa"; // added icon
import { BASE_URL } from '../config/api'

const CampaignDetails = () => {
  const [user, setUser] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if(storedUser) setUser(storedUser);
  }, []);

  useEffect(() => {
    if(!user) return;
    const token = user.token || localStorage.getItem("token");
    if(!token) return;
    fetch(`${BASE_URL}/api/users/${user.id}/campaigns`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if(!res.ok) throw new Error(`Error fetching campaigns: ${res.status}`);
        return res.json();
      })
      .then(data => setCampaigns(data.data || []))
      .catch(err => console.error(err));
  }, [user]);

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Campaign Details</h1>
          <button 
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            onClick={() => navigate("/field_employee-dashboard")}
          >
            Back
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.length > 0 ? (
            campaigns.map(campaign => (
              <div key={campaign.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition transform duration-300">
                <h2 className="text-xl font-semibold mb-2 flex items-center">
                  <FaBullhorn className="mr-2" />
                  {campaign.name}
                </h2>
                {/* New details */}
                <p className="text-gray-700 mb-1">Status: {campaign.status || "N/A"}</p>
                <p className="text-gray-700 mb-1">Priority: {campaign.priority || "N/A"}</p>
                <p className="text-gray-700 mb-1">Leads Assigned: {campaign.lead_count !== undefined ? campaign.lead_count : (campaign.leads ? campaign.leads.length : 0)}</p>
                <p className="text-gray-700 mb-1">
                  Start Date: {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : "N/A"}
                </p>
                <p className="text-gray-700 mb-2">
                  End Date: {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : "N/A"}
                </p>
                <p className="text-gray-600 text-sm">
                  {campaign.description || "No description available."}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No campaigns available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
