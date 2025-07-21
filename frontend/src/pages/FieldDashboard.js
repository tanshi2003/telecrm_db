import React, { useEffect, useState, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaBullhorn, FaChartLine, FaPencilAlt, FaPhone } from "react-icons/fa";
import { toast } from 'react-toastify';
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import io from 'socket.io-client';  

// Add base URL constant
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Update LEAD_STATUSES to match exactly with backend VALID_STATUSES
const LEAD_STATUSES = [
  "New",
  "Contacted", 
  "Follow-Up Scheduled",
  "Interested",
  "Not Interested",
  "Call Back Later",
  "Under Review",
  "Converted",
  "Lost",
  "Not Reachable",
  "On Hold"
];

const FieldDashboard = () => {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadStatus, setLeadStatus] = useState("");
  const [leadNotes, setLeadNotes] = useState("");
  const [updateMessage, setUpdateMessage] = useState(""); // new state for success message
  const [isModalOpen, setIsModalOpen] = useState(false);
   // eslint-disable-next-line 
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(""); // Add error state

  // Call related states
  // eslint-disable-next-line no-unused-vars
  const [callStatus, setCallStatus] = useState('idle');
  // eslint-disable-next-line no-unused-vars
  const [callDuration, setCallDuration] = useState(0);

  // Add performance metrics state
  const [performanceData, setPerformanceData] = useState({
    totalLeads: 0,
    contactedToday: 0,
    totalCalls: 0,
    pendingFollowups: 0,
    convertedLeads: 0  // Added back
  });

  const navigate = useNavigate(); // added

  // Add these state variables at the top with other states
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [showDialer, setShowDialer] = useState(false);
  const [dialedNumber, setDialedNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [showCallbook, setShowCallbook] = useState(false);  // Add pagination state
  const [displayCount, setDisplayCount] = useState(5);  // Show 5 leads initially
  const [showingAll, setShowingAll] = useState(false);

  // Campaign leads states
  // eslint-disable-next-line no-unused-vars
  const [campaignLeads, setCampaignLeads] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  // Wrap fetchData in useCallback
  const fetchData = useCallback(async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/users/${user.id}/leads`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const data = await response.json();
      
      if (Array.isArray(data.data)) {
        setLeads(data.data);
        
        const today = new Date().toISOString().split('T')[0];
        
        setPerformanceData(prev => ({
          totalLeads: data.data.length,
          contactedToday: data.data.filter(l => 
            l.status === "Contacted" && 
            l.updated_at?.split('T')[0] === today
          ).length,
          totalCalls: data.data.filter(l => l.call_count).reduce((acc, curr) => acc + curr.call_count, 0),
          pendingFollowups: data.data.filter(l => l.status === "Follow-Up Scheduled").length,
          convertedLeads: data.data.filter(l => l.status === "Converted").length  // Added back
        }));
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
      setUpdateMessage("Error loading leads");
    }
  }, [user]); // Add user as dependency

  // Update useEffect to use fetchData
  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, fetchData]); // Added fetchData to dependencies

  // Update the formatStatusDisplay function
  const formatStatusDisplay = (status) => {
    if (!status) return 'New';
    
    // Use exact status values, no formatting needed
    return status;
  };

  // Update handleUpdateLead function
  const handleUpdateLead = async () => {
    if (!selectedLead) return;
    
    try {
        const token = localStorage.getItem("token");
        const updateData = {
            name: selectedLead.name,
            phone_no: selectedLead.phone_no,
            status: leadStatus,
            notes: leadNotes || "",
            updated_by: user.id
        };

        console.log('Updating lead:', selectedLead.id, updateData); // Debug log

        const response = await fetch(`${BASE_URL}/api/leads/${selectedLead.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });

        const responseData = await response.json();
        console.log('Update response:', responseData); // Debug log

        if (!response.ok) {
            throw new Error(responseData.message || "Failed to update lead");
        }

        // Update local state first
        setLeads(prevLeads => 
            prevLeads.map(lead => 
                lead.id === selectedLead.id 
                    ? { 
                        ...lead,
                        status: leadStatus,
                        notes: leadNotes,
                        updated_at: new Date().toISOString()
                    }
                    : lead
            )
        );

        // Wait a moment before refreshing data
        setTimeout(async () => {
            await fetchData();
        }, 500);

        setIsModalOpen(false);
        setSelectedLead(null);
        setUpdateMessage("Lead updated successfully");
        setTimeout(() => setUpdateMessage(""), 3000);

    } catch (err) {
        console.error("Update error:", err);
        setUpdateMessage(err.message || "Failed to update lead");
    }
  };

  // Update refreshLeads function to fetch campaign data with lead counts
  const refreshLeads = useCallback(async () => {
    if (!user) return;
    
    try {
        const token = localStorage.getItem("token");
        
        // First fetch leads
        const leadsResponse = await fetch(`${BASE_URL}/api/users/${user.id}/leads`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const leadsData = await leadsResponse.json();
        
        // Then fetch campaigns
        const campaignsResponse = await fetch(`${BASE_URL}/api/campaigns/${user.id}/campaigns/with-leads`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Campaign response:', await campaignsResponse.clone().text()); // Debug log

        const campaignsData = await campaignsResponse.json();

        if (leadsData.success) {
            setLeads(leadsData.data || []);
            setPerformanceData(prev => ({
                ...prev,
                totalLeads: leadsData.data?.length || 0,
                convertedLeads: leadsData.data?.filter(l => l.status === "Converted").length || 0
            }));
        }

        if (campaignsData.success) {
            setCampaigns(campaignsData.data || []);
        }

    } catch (err) {
        console.error("Error refreshing data:", err);
        // Don't clear existing data on error
        setUpdateMessage("Error refreshing data");
    }
  }, [user]); // Add user as dependency

  // Fix second useEffect dependencies
  useEffect(() => {
    if (!user) return;
    refreshLeads();
  }, [user, refreshLeads]); // Added refreshLeads to dependencies
  // Campaign Modal Component
  const CampaignModal = ({ campaign, onClose }) => {
    // eslint-disable-next-line no-unused-vars
    const { user: authUser } = useContext(AuthContext);
    const [showLeads, setShowLeads] = useState(false);
    const [campaignLeads, setCampaignLeads] = useState([]);
    const [isLoadingLeads, setIsLoadingLeads] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [displayCount, setDisplayCount] = useState(5);
    const [showingAll, setShowingAll] = useState(false);

    const fetchCampaignLeads = React.useCallback(async (campaignId) => {
      if (!campaignId) {
        toast.error("Campaign ID is missing");
        return;
      }
      setIsLoadingLeads(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Authentication token is missing");
          return;
        }
        const response = await fetch(`${BASE_URL}/api/campaigns/${campaignId}/leads/assigned`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch campaign leads');
        }
        const data = await response.json();
        if (data.success) {
          const leadsWithDetails = data.data.map(lead => ({
            ...lead,
            name: lead.name || 'Unknown',
            phone_no: lead.phone_no || 'N/A',
            status: lead.status || 'New',
            assigned_name: lead.assigned_to_name || 'Unassigned',
            manager_name: lead.manager_name || campaign.manager_name || 'Not assigned',
            call_count: lead.call_count || 0,
            notes: lead.notes || '',
            updated_at: lead.updated_at || new Date().toISOString()
          }));
          setCampaignLeads(leadsWithDetails);
          setShowLeads(true);
        } else {
          throw new Error(data.message || 'Failed to fetch campaign leads');
        }
      } catch (error) {
        console.error('Error fetching campaign leads:', error);
        toast.error(error.message || "Failed to fetch campaign leads");
      } finally {
        setIsLoadingLeads(false);
      }
    }, [campaign]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
      if (campaign?.id) {
        fetchCampaignLeads(campaign.id);
      }
    }, [campaign, fetchCampaignLeads]);

    // eslint-disable-next-line no-unused-vars
    const handleShowMore = () => {
      if (showingAll) {
        setDisplayCount(5);
      } else {
        setDisplayCount(campaignLeads.length);
      }
      setShowingAll(!showingAll);
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                {/* Header with close button */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{campaign.name}</h2>
                    <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    &times;
                  </button>
                </div>
      
                {/* Campaign Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Manager Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-2">Manager</p>
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {campaign.manager_name || "Not assigned"}
                        </p>
                      </div>
                    </div>
                  </div>
      
                  {/* Status */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-2">Status</p>
                    <div className="mt-1">
                      <span className={`inline-block px-3 py-1 text-sm rounded-full font-medium ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {campaign.status === 'active' ? 'Active' : campaign.status}
                      </span>
                    </div>
                  </div>
      
                  {/* Duration */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-2">Duration</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>                  
                        <p className="text-xs text-gray-500">Start Date</p>                  <p className="font-medium">
                          {campaign.start_date && !isNaN(new Date(campaign.start_date).getTime()) 
                            ? new Date(campaign.start_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) 
                            : 'Not Set'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">End Date</p>
                        <p className="font-medium">
                          {campaign.end_date && !isNaN(new Date(campaign.end_date).getTime())
                            ? new Date(campaign.end_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : 'Ongoing'}
                        </p>
                      </div>
                    </div>
                  </div>                  {/* Lead Statistics */}
                  <div 
                    className="bg-blue-50 p-4 rounded-lg cursor-pointer hover:bg-blue-100 transition"
                    onClick={() => fetchCampaignLeads(campaign.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Total Leads</p>
                        <p className="text-2xl font-bold text-blue-700 mt-1">
                          {campaign.lead_count || 0}
                        </p>
                      </div>
                      <div className="bg-blue-100 rounded-full p-3">
                        <FaBullhorn className="text-blue-600 text-xl" />
                      </div>
                    </div>
                  </div>
                </div>
      
                {/* Campaign Leads Table */}
                {showLeads && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Campaign Leads</h3>
                    {isLoadingLeads ? (
                      <div className="text-center py-4">
                        <p>Loading leads...</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">                  <table className="min-w-full divide-y divide-gray-200">                    <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Call Count</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {campaignLeads.map(lead => (
                              <tr key={lead.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-medium text-gray-900">{lead.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                  {lead.phone_no}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    lead.status === 'Contacted' ? 'bg-green-100 text-green-800' :
                                    lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                                    lead.status === 'Follow-Up Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                    lead.status === 'Converted' ? 'bg-indigo-100 text-indigo-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {lead.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(lead.updated_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                      <FaUser className="text-blue-600 text-xs" />
                                    </div>
                                    <div className="ml-3">
                                      <p className="text-sm font-medium text-gray-900">
                                        {lead.assigned_name || 'Unassigned'}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {lead.assigned_to === user?.id ? '(You)' : ''}
                                      </p>                              </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                      <FaUser className="text-green-600 text-xs" />
                                    </div>
                                    <div className="ml-3">
                                      <p className="text-sm font-medium text-gray-900">
                                        {lead.manager_name}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                  {lead.notes || 'No notes'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    {lead.call_count || 0} calls
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>          )}
              </div>
            </div>
    );
  };

  // Add the DialerModal component
  const DialerModal = () => {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white rounded-lg p-3 w-64 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-medium">Dialer</h2>
            <button
              onClick={() => setShowDialer(false)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ✕
            </button>
          </div>

          {/* Number Display */}
          <div className="mb-2 p-2 bg-gray-50 rounded">
            <div className="flex justify-between items-center">
              <input
                type="text"
                value={dialedNumber}
                onChange={(e) => {
                  let value = e.target.value.replace(/[^0-9]/g, '');
                  setDialedNumber(value);
                }}
                className="w-full bg-transparent text-lg font-mono focus:outline-none"
                placeholder="Enter number"
              />
              <button
                onClick={() => setDialedNumber('')}
                className="px-2 py-0.5 text-xs bg-gray-200 rounded hover:bg-gray-300"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Callbook Button */}
          <button
            onClick={() => setShowCallbook(!showCallbook)}
            className="w-full mb-2 p-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            {showCallbook ? `Hide Callbook (${filteredLeads.length})` : 'Show Callbook'}
          </button>

          {/* Updated Callbook Section */}
          {showCallbook && (
            <div className="mb-2 max-h-48 overflow-y-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search leads by name or phone..."
                className="w-full p-2 text-xs border rounded mb-2"
              />
              <div className="space-y-1">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => {
                        setDialedNumber(lead.phone_no);
                        setShowCallbook(false);
                      }}
                      className="w-full p-2 text-left hover:bg-gray-100 rounded text-xs border-b"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-800">{lead.name}</div>
                          <div className="text-gray-600">{lead.phone_no}</div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          lead.status === "New" ? "bg-blue-100 text-blue-800" :
                          lead.status === "Contacted" ? "bg-yellow-100 text-yellow-800" :
                          lead.status === "Converted" ? "bg-green-100 text-green-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {lead.status}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-2">
                    {searchTerm ? 'No leads found' : 'No leads available'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Dial Pad */}
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((num) => (
              <button
                key={num}
                onClick={() => setDialedNumber(prev => prev + num)}
                className="p-2 text-sm font-medium bg-gray-100 rounded hover:bg-gray-200"
              >
                {num}
              </button>
            ))}
          </div>

          {/* Call Button */}
          <button
            onClick={() => {
              if (dialedNumber) {
                window.location.href = `tel:${dialedNumber}`;
              }
            }}
            className={`w-full mt-2 p-2 text-sm text-white rounded ${
              dialedNumber 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Call
          </button>
        </div>
      </div>
    );
  };

  // Add this useEffect right after your state declarations
  useEffect(() => {
    if (showCallbook) {
      // Initially set filtered leads to all leads when callbook opens
      if (searchTerm) {
        const filtered = leads.filter(lead => 
          lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.phone_no.includes(searchTerm)
        );
        setFilteredLeads(filtered);
      } else {
        setFilteredLeads(leads);
      }
    }
  }, [leads, searchTerm, showCallbook]);

  // Add timer functions
  const startTimer = () => {
    setCallDuration(0);
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  };

  const stopTimer = () => {
    setCallDuration(0);
  };

  // eslint-disable-next-line no-unused-vars
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Update socket connection useEffect
  useEffect(() => {
    const socket = io(BASE_URL);
    
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('callStatus', (data) => {
      setCallStatus(data.status);
      if (data.status === 'connected') {
        startTimer();
      } else if (data.status === 'disconnected') {
        stopTimer();
      }
    });

    return () => socket.disconnect();
  }, []);  // No need to add startTimer/stopTimer as deps since they're stable

  // New function to fetch campaign leads
  // eslint-disable-next-line no-unused-vars
  const getCampaignLeads = async (campaignId) => {
    setIsLoadingLeads(true);
    try {
      const response = await fetch(`${BASE_URL}/api/campaigns/${campaignId}/leads`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setCampaignLeads(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch campaign leads');
    }
    setIsLoadingLeads(false);
  };
  // Handle clicking on campaign card
  const handleCampaignClick = async (campaign) => {
    setSelectedCampaign(campaign);
    setIsCampaignModalOpen(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/campaigns/${campaign.id}/leads/assigned`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const leadsWithDetails = data.data.map(lead => ({
          ...lead,
          name: lead.name || 'Unknown',
          phone_no: lead.phone_no || 'N/A',
          status: lead.status || 'New',
          assigned_name: lead.assigned_to_name || 'Unassigned',
          manager_name: lead.manager_name || campaign.manager_name || 'Not assigned',
          call_count: lead.call_count || 0,
          notes: lead.notes || '',
          updated_at: lead.updated_at || new Date().toISOString()
        }));
        setCampaignLeads(leadsWithDetails);
      } else {
        setError(data.message || 'Failed to fetch campaign leads');
      }
    } catch (err) {
      setError('Failed to fetch campaign leads');
      console.error('Error fetching campaign leads:', err);
    }
  };

  return (
    <div className="relative flex min-h-screen">
      <Sidebar user={user} />
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Field Employee Dashboard</h1>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowDialer(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
            >
              <FaPhone className="mr-2" />
              Make Call
            </button>
            <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                onClick={() => navigate("/addlead")}
            >
              <FaUser className="mr-2" />
                Create Lead
            </button>
          </div>
        </div>
        {/* Persistent Update Message */}
        {updateMessage && (
          <div className="p-4 mb-4 text-green-700 bg-green-100 rounded">
            {updateMessage}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Performance Summary - Left side */}
          <div className="bg-white p-4 rounded shadow-md hover:shadow-lg transition col-span-2">
            <h2 className="text-xl font-semibold mb-2 flex items-center">
              <FaChartLine className="mr-2" />
              Performance Summary
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded">
                <p className="text-sm text-gray-600">Total Assigned Leads</p>
                <p className="text-xl font-bold">{performanceData.totalLeads}</p>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <p className="text-sm text-gray-600">Converted Leads</p>
                <p className="text-xl font-bold">{performanceData.convertedLeads}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded">
                <p className="text-sm text-gray-600">Pending Follow-ups</p>
                <p className="text-xl font-bold">{performanceData.pendingFollowups}</p>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <p className="text-sm text-gray-600">Contacted Today</p>
                <p className="text-xl font-bold">{performanceData.contactedToday}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded">
                <p className="text-sm text-gray-600">Total Calls</p>
                <p className="text-xl font-bold">{performanceData.totalCalls}</p>
              </div>
            </div>
          </div>

          {/* Campaigns Tile - Right side */}
          <div className="bg-white p-4 rounded-lg shadow-lg col-span-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center">
                <FaBullhorn className="mr-2 text-blue-600" />
                Active Campaigns
              </h2>
              <span className="text-sm bg-gray-100 px-3 py-1 rounded">
                {campaigns?.length || 0} Total
              </span>
            </div>
            {campaigns && campaigns.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {campaigns.map(campaign => (                  <div 
                    key={campaign.id} 
                    className="border-b last:border-0 pb-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    onClick={() => handleCampaignClick(campaign)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800 text-sm">{campaign.name}</h3>
                        {campaign.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {campaign.description}
                          </p>
                        )}
                      </div>
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                        {campaign.lead_count || 0} Leads
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <FaBullhorn className="mx-auto mb-2 text-gray-400 text-lg" />
                <p className="text-sm">No active campaigns</p>
              </div>
            )}
          </div>

          {/* Assigned Leads - Full width below */}
          <div className="bg-white rounded-lg shadow-lg p-6 col-span-3">
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
                      {leads.slice(0, displayCount).map(lead => (
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
                              lead.status === "Follow-Up Scheduled" ? "bg-purple-100 text-purple-800" :
                              lead.status === "Converted" ? "bg-green-100 text-green-800" :
                              lead.status === "Lost" ? "bg-red-100 text-red-800" :
                              lead.status === "Under Review" ? "bg-indigo-100 text-indigo-800" :
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
                
                {/* Show More/Less Button */}
                {leads.length > 5 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => {
                        if (showingAll) {
                          setDisplayCount(5);
                          setShowingAll(false);
                        } else {
                          setDisplayCount(leads.length);
                          setShowingAll(true);
                        }
                      }}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 
                                 hover:text-blue-800 focus:outline-none"
                    >
                      {showingAll ? (
                        <>
                          Show Less
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                          </svg>
                        </>
                      ) : (
                        <>
                          Show More ({leads.length - displayCount} more)
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-center py-8">No leads assigned yet.</p>
            )}
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
                      <option key={status} value={status}>
                        {formatStatusDisplay(status)}
                      </option>
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
                {/* Display current lead info */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Current Name: {selectedLead?.name}</p>
                  <p className="text-sm text-gray-600">Current Phone: {selectedLead?.phone_no}</p>
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
        )}        {isCampaignModalOpen && selectedCampaign && (
          <CampaignModal 
            campaign={selectedCampaign}
            onClose={() => {
              setIsCampaignModalOpen(false);
              setSelectedCampaign(null);
            }}
            isOpen={isCampaignModalOpen}
          />
        )}
        {showDialer && <DialerModal />}
      </div>
    </div>
  );
};

export default FieldDashboard;