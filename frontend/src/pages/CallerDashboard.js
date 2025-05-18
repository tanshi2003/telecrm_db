import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar"; // Import Sidebar component
// Import icons from a suitable icon library like heroicons
import { PhoneIcon, UserGroupIcon, ClockIcon, CheckCircleIcon, PhoneXMarkIcon, CalendarIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
// import callService from '../services/callService';

const CallerDashboard = () => {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]); // Add leads state
  // Add states for KPIs
  const [kpiData, setKpiData] = useState({
    totalLeads: 0,
    contactedToday: 0,
    pendingFollowups: 0,
    convertedLeads: 0,
    callBackLater: 0,
    missedLeads: 0,
    currentCampaign: ""
  });
  const [callMetrics, setCallMetrics] = useState({
    totalCalls: 0,
    avgCallDuration: 0,
    successRate: 0,
    callbackRate: 0
  });
  const [bestHours, setBestHours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [newCall, setNewCall] = useState({
    leadId: "",
    duration: "",
    status: "Pending",
    notes: "",
    callbackDateTime: ""
  });
  const [selectedLead, setSelectedLead] = useState(null);
  const [callTimer, setCallTimer] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);

  useEffect(() => {
    // Fetch user details from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      fetchKpiData(storedUser.id); // Fetch KPI data after user is loaded
      fetchCallMetrics(storedUser.id);
      fetchBestHours(storedUser.id);
    } else {
      console.error("User not found. Redirecting to login...");
      // TODO: Add redirect to login page if needed
    }
  }, []);

  // Function to fetch KPI data
  const fetchKpiData = async (userId) => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    try {
      const axiosConfig = {
        baseURL: 'http://localhost:5000/api',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Get caller's leads - using the main leads endpoint
      const leadsResponse = await axios.get('/leads', axiosConfig);
      const leads = leadsResponse.data.data || [];
      setLeads(leads); // Store leads in state

      // Get caller's assigned campaign
      const campaignResponse = await axios.get(`/campaigns//${userId}`, axiosConfig);
      const campaign = campaignResponse.data.data || {};
      
      // Calculate KPIs from leads
      const today = new Date().toISOString().split('T')[0];
      
      setKpiData({
        totalLeads: leads.length,
        contactedToday: leads.filter(lead => 
          lead.status === "Contacted" && 
          lead.updated_at?.split('T')[0] === today
        ).length,
        pendingFollowups: leads.filter(lead => 
          lead.status === "Follow-Up Scheduled"
        ).length,
        convertedLeads: leads.filter(lead => 
          lead.status === "Converted"
        ).length,
        callBackLater: leads.filter(lead => 
          lead.status === "Call Back Later"
        ).length,
        missedLeads: leads.filter(lead => 
          lead.status === "Not Reachable"
        ).length,
        currentCampaign: campaign.name || "No Campaign Assigned"
      });

    } catch (error) {
      console.error('Error fetching KPI data:', error);
      setError(error.response?.data?.message || "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCallMetrics = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const axiosConfig = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Get performance metrics
      const metrics = await axios.get(
        `http://localhost:5000/api/calls/stats/performance/${userId}`,
        axiosConfig
      );

      // Get callback efficiency
      const efficiency = await axios.get(
        `http://localhost:5000/api/calls/stats/callback-efficiency/${userId}`,
        axiosConfig
      );
      
      setCallMetrics({
        totalCalls: metrics.data.data.totalCalls || 0,
        avgCallDuration: metrics.data.data.averageCallDuration || 0,
        successRate: metrics.data.data.successRate || 0,
        callbackRate: efficiency.data.data.callbackRate || 0
      });
    } catch (error) {
      console.error('Error fetching call metrics:', error);
    }
  };

  const fetchBestHours = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const axiosConfig = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.get(
        `http://localhost:5000/api/calls/stats/best-hours/${userId}`,
        axiosConfig
      );
      
      setBestHours(response.data.data || []);
    } catch (error) {
      console.error('Error fetching best hours:', error);
      setBestHours([]); // Reset to empty array on error
    }
  };

  const handleCallSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        'http://localhost:5000/api/calls',
        {
          ...newCall,
          callerId: user.id
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setShowCallModal(false);
      setNewCall({
        leadId: "",
        duration: "",
        status: "Pending",
        notes: "",
        callbackDateTime: ""
      });
      refreshData();
    } catch (error) {
      console.error('Error creating call:', error);
      setError(error.response?.data?.message || "Failed to create call");
    }
  };

  // Function to refresh KPI data
  const refreshData = () => {
    if (user?.id) {
      fetchKpiData(user.id);
      fetchCallMetrics(user.id);
      fetchBestHours(user.id);
    }
  };

  // Timer functions
  const startTimer = () => {
    const interval = setInterval(() => {
      setCallTimer((prev) => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = () => {
    setIsCallActive(true);
    startTimer();
  };

  const endCall = () => {
    setIsCallActive(false);
    stopTimer();
    setNewCall(prev => ({
      ...prev,
      duration: Math.floor(callTimer / 60) // Convert seconds to minutes
    }));
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // Call Modal Component
  const CallModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Call Management</h3>
            <button
              onClick={() => setShowCallModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Lead Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Lead
            </label>
            <select
              value={selectedLead?.id || ""}
              onChange={(e) => {
                const lead = leads.find(l => l.id === e.target.value);
                setSelectedLead(lead);
                setNewCall(prev => ({
                  ...prev,
                  leadId: e.target.value
                }));
              }}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            >
              <option value="">Select a lead</option>
              {leads.map(lead => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} - {lead.phone_no}
                </option>
              ))}
            </select>
          </div>

          {/* Lead Details */}
          {selectedLead && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Lead Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-600">Name:</p>
                  <p className="font-medium">{selectedLead.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Phone:</p>
                  <p className="font-medium">{selectedLead.phone_no}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status:</p>
                  <p className="font-medium">{selectedLead.status}</p>
                </div>
                <div>
                  <p className="text-gray-600">Category:</p>
                  <p className="font-medium">{selectedLead.lead_category}</p>
                </div>
              </div>
            </div>
          )}

          {/* Call Controls */}
          <div className="mb-6">
            <div className="flex justify-center items-center space-x-4">
              {!isCallActive ? (
                <button
                  onClick={startCall}
                  disabled={!selectedLead}
                  className={`rounded-full p-4 ${
                    selectedLead 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  <PhoneIcon className="h-8 w-8 text-white" />
                </button>
              ) : (
                <button
                  onClick={endCall}
                  className="rounded-full p-4 bg-red-500 hover:bg-red-600"
                >
                  <PhoneXMarkIcon className="h-8 w-8 text-white" />
                </button>
              )}
            </div>
            {isCallActive && (
              <div className="text-center mt-4">
                <p className="text-xl font-semibold">{formatTime(callTimer)}</p>
                <p className="text-sm text-gray-500">Call Duration</p>
              </div>
            )}
          </div>

          {/* Call Form */}
          <form onSubmit={handleCallSubmit} className="mt-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Status
              </label>
              <select
                value={newCall.status}
                onChange={(e) => setNewCall({...newCall, status: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="No Answer">No Answer</option>
                <option value="Callback Scheduled">Callback Scheduled</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Wrong Number">Wrong Number</option>
              </select>
            </div>

            {newCall.status === "Callback Scheduled" && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Callback Date/Time
                </label>
                <input
                  type="datetime-local"
                  value={newCall.callbackDateTime}
                  onChange={(e) => setNewCall({...newCall, callbackDateTime: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  required
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Notes
              </label>
              <textarea
                value={newCall.notes}
                onChange={(e) => setNewCall({...newCall, notes: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                rows="3"
                placeholder="Enter call notes, customer feedback, or follow-up details..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCallModal(false);
                  stopTimer();
                  setCallTimer(0);
                  setIsCallActive(false);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCallActive}
                className={`px-4 py-2 rounded ${
                  isCallActive
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Save Call
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative flex min-h-screen">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Caller Dashboard</h1>
            <p className="text-gray-600">Current Campaign: {kpiData.currentCampaign}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={refreshData}
              disabled={isLoading}
              className={`px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <button 
              onClick={() => setShowCallModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Call
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* KPI Tiles Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Assigned Leads */}
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Assigned Leads</p>
                <p className="text-2xl font-bold">{kpiData.totalLeads}</p>
              </div>
            </div>
          </div>

          {/* Leads Contacted Today */}
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center">
              <PhoneIcon className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Contacted Today</p>
                <p className="text-2xl font-bold">{kpiData.contactedToday}</p>
              </div>
            </div>
          </div>

          {/* Pending Follow-ups */}
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Pending Follow-ups</p>
                <p className="text-2xl font-bold">{kpiData.pendingFollowups}</p>
              </div>
            </div>
          </div>

          {/* Converted Leads */}
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-600">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Converted Leads</p>
                <p className="text-2xl font-bold">{kpiData.convertedLeads}</p>
              </div>
            </div>
          </div>

          {/* Call Back Later */}
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Call Back Later</p>
                <p className="text-2xl font-bold">{kpiData.callBackLater}</p>
              </div>
            </div>
          </div>

          {/* Missed Leads */}
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
            <div className="flex items-center">
              <PhoneXMarkIcon className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Missed/Not Reachable</p>
                <p className="text-2xl font-bold">{kpiData.missedLeads}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Calls</p>
                <p className="text-2xl font-bold">{callMetrics.totalCalls}</p>
              </div>
              <PhoneIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Call Duration</p>
                <p className="text-2xl font-bold">{callMetrics.avgCallDuration}m</p>
              </div>
              <ClockIcon className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">{callMetrics.successRate}%</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Callback Rate</p>
                <p className="text-2xl font-bold">{callMetrics.callbackRate}%</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Best Calling Hours */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Best Calling Hours</h2>
          <div className="grid grid-cols-6 gap-2">
            {Array.isArray(bestHours) && bestHours.length > 0 ? (
              bestHours.map((hour, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded text-center ${
                    hour.successRate > 50 ? 'bg-green-100' : 
                    hour.successRate > 30 ? 'bg-yellow-100' : 'bg-red-100'
                  }`}
                >
                  <p className="font-semibold">{hour.hour}:00</p>
                  <p className="text-sm">{hour.successRate}%</p>
                </div>
              ))
            ) : (
              <div className="col-span-6 text-center text-gray-500">
                No calling hours data available
              </div>
            )}
          </div>
        </div>

        {/* Today's Follow-ups */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Today's Follow-ups</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Add follow-up rows here */}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCallModal && <CallModal />}
    </div>
  );
};

export default CallerDashboard;