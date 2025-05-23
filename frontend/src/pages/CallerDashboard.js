import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar"; // Import Sidebar component
// Import icons from a suitable icon library like heroicons
import { PhoneIcon, UserGroupIcon, ClockIcon, CheckCircleIcon, PhoneXMarkIcon, CalendarIcon, ChartBarIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import io from 'socket.io-client';

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
    currentCampaign: "",
    assignedCampaigns: [] // Add this new state
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
  const [callTimer, setCallTimer] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);
  const [showSoftPhone, setShowSoftPhone] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle, dialing, connected, ended
  const [callDuration, setCallDuration] = useState(0);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const localVideoRef = React.useRef(null);
  const remoteVideoRef = React.useRef(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [showDialer, setShowDialer] = useState(false);
  const [dialedNumber, setDialedNumber] = useState('');
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCallbook, setShowCallbook] = useState(false);
  const [isManualDialing, setIsManualDialing] = useState(true);
  const [companyNumber] = useState('07948518141'); // Exotel number
  const [isCallMaskingEnabled, setIsCallMaskingEnabled] = useState(true);
  // Add new state for call feedback
  const [callFeedback, setCallFeedback] = useState({
    isRinging: false,
    ringTone: null,
    error: null
  });
  const [iceCandidates, setIceCandidates] = useState([]);
  const [isCallInitiator, setIsCallInitiator] = useState(false);
  const [callId, setCallId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [recipientId, setRecipientId] = useState(null);
  const [callerId, setCallerId] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketError, setSocketError] = useState(null);
  // Add a ref to store the peer connection
  const peerConnectionRef = React.useRef(null);

  // Add WebRTC configuration
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      // Add TURN servers for better connectivity
      {
        urls: 'turn:numb.viagenie.ca',
        credential: 'muazkh',
        username: 'webrtc@live.com'
      },
      {
        urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
        credential: 'webrtc',
        username: 'webrtc'
      }
    ]
  };

  useEffect(() => {
    // Fetch user details from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      fetchKpiData(storedUser.id);
      fetchCallMetrics(storedUser.id);
      fetchBestHours(storedUser.id);
    } else {
      console.error("User not found. Redirecting to login...");
      // TODO: Add redirect to login page if needed
    }
  }, []);

  // Function to fetch KPI data
  const fetchKpiData = async (userId) => {
    console.log('Starting fetchKpiData for user:', userId);
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    console.log('Token available:', !!token);

    try {
      const axiosConfig = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      console.log('Fetching leads...');
      // Get caller's leads
      const leadsResponse = await axios.get('http://localhost:5000/api/leads', axiosConfig);
      console.log('Leads response:', leadsResponse.data);
      const leads = leadsResponse.data.data || [];
      setLeads(leads);

      console.log('Fetching campaigns...');
      // Get caller's assigned campaigns
      const campaignResponse = await axios.get(`http://localhost:5000/api/campaigns/user/${userId}/campaigns`, axiosConfig);
      console.log('Campaigns response:', campaignResponse.data);
      const campaigns = campaignResponse.data.data || [];
      
      // Calculate KPIs from leads
      const today = new Date().toISOString().split('T')[0];
      console.log('Calculating KPIs for date:', today);
      
      const kpiData = {
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
        currentCampaign: campaigns.length > 0 ? campaigns[0].name : "No Campaign Assigned",
        assignedCampaigns: campaigns
      };
      
      console.log('Setting KPI data:', kpiData);
      setKpiData(kpiData);

    } catch (error) {
      console.error('Error in fetchKpiData:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      setError(error.response?.data?.message || "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCallMetrics = async (userId) => {
    console.log('Starting fetchCallMetrics for user:', userId);
    try {
      const token = localStorage.getItem("token");
      console.log('Token available:', !!token);
      
      const axiosConfig = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      console.log('Fetching performance metrics...');
      // Get performance metrics
      const metrics = await axios.get(
        `http://localhost:5000/api/calls/stats/performance/${userId}`,
        axiosConfig
      );
      console.log('Performance metrics response:', metrics.data);

      console.log('Fetching callback efficiency...');
      // Get callback efficiency
      const efficiency = await axios.get(
        `http://localhost:5000/api/calls/stats/callback-efficiency/${userId}`,
        axiosConfig
      );
      console.log('Callback efficiency response:', efficiency.data);
      
      const callMetrics = {
        totalCalls: metrics.data.data.totalCalls || 0,
        avgCallDuration: metrics.data.data.averageCallDuration || 0,
        successRate: metrics.data.data.successRate || 0,
        callbackRate: efficiency.data.data.callbackRate || 0
      };
      
      console.log('Setting call metrics:', callMetrics);
      setCallMetrics(callMetrics);
    } catch (error) {
      console.error('Error in fetchCallMetrics:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
    }
  };

  const fetchBestHours = async (userId) => {
    console.log('Starting fetchBestHours for user:', userId);
    try {
      const token = localStorage.getItem("token");
      console.log('Token available:', !!token);
      
      const axiosConfig = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      console.log('Fetching best hours...');
      const response = await axios.get(
        `http://localhost:5000/api/calls/stats/best-hours/${userId}`,
        axiosConfig
      );
      console.log('Best hours response:', response.data);
      
      setBestHours(response.data.data || []);
    } catch (error) {
      console.error('Error in fetchBestHours:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      setBestHours([]);
    }
  };

  // Function to refresh KPI data
  const refreshData = () => {
    console.log('Refreshing all data...');
    if (user?.id) {
      console.log('User ID available:', user.id);
      fetchKpiData(user.id);
      fetchCallMetrics(user.id);
      fetchBestHours(user.id);
    } else {
      console.error('No user ID available for refresh');
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

  // Function to play ringtone
  const playRingTone = () => {
    const audio = new Audio('/ringtone.mp3'); // You'll need to add this file
    audio.loop = true;
    audio.play();
    setCallFeedback(prev => ({
      ...prev,
      isRinging: true,
      ringTone: audio
    }));
  };

  // Function to stop ringtone
  const stopRingTone = () => {
    if (callFeedback.ringTone) {
      callFeedback.ringTone.pause();
      callFeedback.ringTone.currentTime = 0;
    }
    setCallFeedback({
      isRinging: false,
      ringTone: null,
      error: null
    });
  };

  // Update Socket.IO connection setup
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);

    if (!token) {
      setSocketError('No authentication token found');
      return;
    }

    const socketClient = io('http://localhost:5000', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
      forceNew: true,
      path: '/socket.io/'
    });

    socketClient.on('connect', () => {
      console.log('Socket.IO connected successfully');
      setSocketConnected(true);
      setSocketError(null);
      
      // Join user's room after connection
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) {
        console.log('Joining user room:', user.id);
        socketClient.emit('join:room', { userId: user.id });
      }
    });

    socketClient.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      console.error('Error details:', {
        message: error.message,
        description: error.description,
        type: error.type,
        data: error.data
      });
      setSocketError(`Connection error: ${error.message}`);
      setSocketConnected(false);
    });

    socketClient.on('connect_timeout', (timeout) => {
      console.error('Socket.IO connection timeout:', timeout);
      setSocketError('Connection timeout. Please check if the server is running.');
      setSocketConnected(false);
    });

    socketClient.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket.IO reconnection attempt:', attemptNumber);
      setSocketError(`Trying to reconnect (attempt ${attemptNumber})...`);
    });

    socketClient.on('reconnect', (attemptNumber) => {
      console.log('Socket.IO reconnected after', attemptNumber, 'attempts');
      setSocketConnected(true);
      setSocketError(null);
    });

    socketClient.on('reconnect_error', (error) => {
      console.error('Socket.IO reconnection error:', error);
      setSocketError(`Reconnection failed: ${error.message}`);
    });

    socketClient.on('reconnect_failed', () => {
      console.error('Socket.IO reconnection failed after all attempts');
      setSocketError('Failed to reconnect. Please refresh the page.');
      setSocketConnected(false);
    });

    socketClient.on('call:incoming', (data) => {
      console.log('Received incoming call:', data);
      handleIncomingCall(data.offer, data.callId, data.from);
    });

    socketClient.on('call:accepted', (data) => {
      console.log('Received call acceptance:', data);
      handleCallAnswer(data.answer, data.callId);
    });

    socketClient.on('call:ice-candidate', (data) => {
      console.log('Received ICE candidate:', data);
      handleRemoteIceCandidate(data.candidate, data.callId);
    });

    socketClient.on('call:ended', (data) => {
      console.log('Received call end notification:', data);
      handleRemoteCallEnd(data.callId);
    });

    socketClient.on('call:rejected', (data) => {
      console.log('Call rejected:', data);
      setCallStatus('idle');
      stopRingTone();
      setCallFeedback(prev => ({
        ...prev,
        error: data.reason || 'Call was rejected'
      }));
    });

    setSocket(socketClient);

    return () => {
      if (socketClient) {
        socketClient.disconnect();
      }
    };
  }, []);

  // Handle incoming call
  const handleIncomingCall = async (offer, callId, from) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Set caller ID
      setCallerId(from);

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);

      // Create peer connection
      const pc = new RTCPeerConnection(configuration);
      setPeerConnection(pc);

      // Add local stream
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // Send ICE candidate through Socket.IO
          socket.emit('call:ice-candidate', {
            candidate: event.candidate,
            to: from
          });
        }
      };

      // Handle remote stream
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      // Set remote description
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      // Create and send answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer through Socket.IO
      socket.emit('call:accepted', {
        answer: pc.localDescription,
        to: from,
        callId: callId
      });

      setCallId(callId);
      setIsCallInitiator(false);
      setCallStatus('connected');
      stopRingTone();

    } catch (error) {
      console.error('Error handling incoming call:', error);
      setCallStatus('idle');
      setCallFeedback(prev => ({
        ...prev,
        error: error.message || 'Failed to handle incoming call.'
      }));
    }
  };

  // Handle call answer
  const handleCallAnswer = async (answer, callId) => {
    try {
      console.log('Handling call answer:', answer);
      const pc = peerConnectionRef.current;
      
      if (!pc) {
        console.error('No peer connection available');
        return;
      }

      console.log('Current signaling state:', pc.signalingState);
      
      // Check if we're in the correct state to handle an answer
      if (pc.signalingState !== 'have-local-offer') {
        console.error('Invalid signaling state for answer:', pc.signalingState);
        return;
      }

      // Verify that what we received is actually an answer
      if (answer.type !== 'answer') {
        console.error('Received non-answer type:', answer.type);
        return;
      }

      console.log('Setting remote description (answer)...');
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('Remote description set successfully');
      
      // Check if we have any pending ICE candidates
      if (iceCandidates.length > 0) {
        console.log('Adding pending ICE candidates:', iceCandidates.length);
        for (const candidate of iceCandidates) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('Added pending ICE candidate');
          } catch (error) {
            console.error('Error adding pending ICE candidate:', error);
          }
        }
        setIceCandidates([]); // Clear pending candidates
      }

      setCallStatus('connected');
      stopRingTone();
    } catch (error) {
      console.error('Error handling call answer:', error);
      setCallStatus('idle');
      setCallFeedback(prev => ({
        ...prev,
        error: 'Failed to establish call connection.'
      }));
    }
  };

  // Handle remote ICE candidate
  const handleRemoteIceCandidate = async (candidate, callId) => {
    try {
      console.log('Handling remote ICE candidate:', candidate);
      const pc = peerConnectionRef.current;
      
      if (!pc) {
        console.error('No peer connection available for ICE candidate');
        return;
      }

      if (pc.remoteDescription && pc.remoteDescription.type) {
        console.log('Adding ICE candidate...');
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('ICE candidate added successfully');
      } else {
        console.log('Remote description not set yet, storing ICE candidate');
        // Store the candidate to add it later when remote description is set
        setIceCandidates(prev => [...prev, candidate]);
      }
    } catch (error) {
      console.error('Error handling remote ICE candidate:', error);
    }
  };

  // Handle remote call end
  const handleRemoteCallEnd = (callId) => {
    handleCallEnd();
  };

  // Update handleCallEnd function
  const handleCallEnd = async () => {
    try {
      console.log('Ending call...');
      
      // Stop ringtone first
      if (callFeedback.ringTone) {
        callFeedback.ringTone.pause();
        callFeedback.ringTone.currentTime = 0;
      }
      setCallFeedback(prev => ({
        ...prev,
        isRinging: false,
        ringTone: null,
        error: null
      }));

      // Get Exotel configuration
      const token = localStorage.getItem('token');
      const configResponse = await axios.get('http://localhost:5000/api/exotel-config', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!configResponse.data.success) {
        throw new Error('Failed to get Exotel configuration');
      }

      const { sid, token: exotelToken } = configResponse.data.data;

      // End the call through Exotel API
      await axios({
        method: 'post',
        url: `https://api.exotel.com/v1/Accounts/${sid}/Calls/${callId}.json`,
        data: new URLSearchParams({ Status: 'completed' }),
        auth: {
          username: sid,
          password: exotelToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      });

      // Reset all call state
      setCallStatus('idle');
      setCallDuration(0);
      setCallId(null);
      setDialedNumber('');
      setShowDialer(false);

      // Clear timer
      if (callTimer) {
        clearInterval(callTimer);
        setCallTimer(null);
      }

    } catch (error) {
      console.error('Error ending call:', error);
      setCallFeedback(error.message || 'Failed to end call');
    }
  };

  // Filter leads based on search term
  useEffect(() => {
    if (leads && searchTerm) {
      const filtered = leads.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone_no.includes(searchTerm)
      );
      setFilteredLeads(filtered);
    } else {
      setFilteredLeads(leads);
    }
  }, [leads, searchTerm]);

  // Handle number input
  const handleNumberInput = (num) => {
    setIsManualDialing(true);
    let newNumber = dialedNumber.replace('+91', '');
    newNumber = newNumber + num;
    setDialedNumber('+91' + newNumber);
  };

  // Handle lead selection
  const handleLeadSelect = (lead) => {
    setIsManualDialing(false);
    setDialedNumber(lead.phone_no);
    setRecipientId(lead.id); // Set recipient ID to lead's ID
    setShowCallbook(false);
  };

  // Clear number
  const handleClear = () => {
    setDialedNumber('');
    setIsManualDialing(true);
  };

  // Add paste handler
  const handlePaste = async (e) => {
    try {
      const text = await navigator.clipboard.readText();
      // Clean the number
      let cleanedNumber = text.replace(/[^0-9]/g, '');
      
      // If number starts with 0, remove it
      if (cleanedNumber.startsWith('0')) {
        cleanedNumber = cleanedNumber.substring(1);
      }
      
      // If number doesn't start with +91, add it
      if (!cleanedNumber.startsWith('+91')) {
        cleanedNumber = '+91' + cleanedNumber;
      }
      
      setDialedNumber(cleanedNumber);
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  };

  // Add copy handler
  const handleCopy = () => {
    if (dialedNumber) {
      navigator.clipboard.writeText(dialedNumber);
    }
  };

  // Update the CallStatusDisplay component
  const CallStatusDisplay = () => {
    if (callStatus === 'dialing') {
      return (
        <div className="p-2 bg-blue-50 text-xs text-blue-600 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Dialing {dialedNumber}...</span>
              {callFeedback.isRinging && (
                <span className="animate-pulse text-green-600">🔔 Ringing...</span>
              )}
            </div>
            <div className="flex gap-1">
              <button
                onClick={handleCallEnd}
                className="px-2 py-0.5 bg-red-500 text-white rounded text-xs"
              >
                Cancel Call
              </button>
            </div>
          </div>
          {callFeedback.error && (
            <div className="mt-1 text-red-600 text-xs">
              {callFeedback.error}
            </div>
          )}
        </div>
      );
    }
    
    if (callStatus === 'connected') {
      return (
        <div className="p-2 bg-green-50 text-xs text-green-600 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Call in progress</span>
              <span className="font-mono">
                {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={handleCallEnd}
                className="px-2 py-0.5 bg-red-500 text-white rounded text-xs"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Update the startCall function
  const startCall = async (phoneNumber) => {
    try {
      console.log('Starting call to:', phoneNumber);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Get user data from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('No user data found');
      }

      const user = JSON.parse(userData);
      if (!user || !user.id) {
        throw new Error('Invalid user data');
      }

      // Clean the phone number
      let cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');
      if (cleanedNumber.startsWith('91')) {
        cleanedNumber = cleanedNumber.substring(2);
      }
      if (!cleanedNumber.startsWith('0')) {
        cleanedNumber = '0' + cleanedNumber;
      }

      // Set call status to dialing
      setCallStatus('dialing');
      setCallTimer(0);

      // Get Exotel configuration
      const configResponse = await axios.get('http://localhost:5000/api/exotel-config', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!configResponse.data.success) {
        throw new Error('Failed to get Exotel configuration');
      }

      const { sid, token: exotelToken, phone_number: exotelNumber } = configResponse.data.data;

      // Make the API call directly to Exotel
      const formData = new URLSearchParams();
      formData.append('From', exotelNumber);
      formData.append('To', cleanedNumber);
      formData.append('CallerId', exotelNumber);
      formData.append('CallType', 'trans');
      formData.append('TimeLimit', '300');
      formData.append('Record', 'true');
      formData.append('PlayDtmf', 'true');
      formData.append('CallerName', 'TeleCRM');

      console.log('Making Exotel API request with data:', {
        url: `https://api.exotel.com/v1/Accounts/${sid}/Calls/connect`,
        formData: Object.fromEntries(formData),
        phoneNumber: {
          original: phoneNumber,
          formatted: cleanedNumber,
          exotelNumber: exotelNumber
        }
      });

      const response = await axios({
        method: 'post',
        url: `https://api.exotel.com/v1/Accounts/${sid}/Calls/connect`,
        data: formData,
        auth: {
          username: sid,
          password: exotelToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      });

      console.log('Exotel API response:', response.data);

      if (response.data.RestException) {
        throw new Error(`Exotel API error: ${response.data.RestException.Message}`);
      }

      // Get the call SID from the response
      let exotelCallSid = null;
      if (response.data.Call && response.data.Call.Sid) {
        exotelCallSid = response.data.Call.Sid;
      } else if (response.data.Sid) {
        exotelCallSid = response.data.Sid;
      } else if (response.data.call_sid) {
        exotelCallSid = response.data.call_sid;
      } else if (response.data.callSid) {
        exotelCallSid = response.data.callSid;
      }

      if (!exotelCallSid) {
        throw new Error('No call SID received from Exotel');
      }

      setCallId(exotelCallSid);
      console.log('Setting call ID:', exotelCallSid);

      // Start the timer
      const timer = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
      setTimerInterval(timer);

      // Poll for call status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await axios({
            method: 'get',
            url: `https://api.exotel.com/v1/Accounts/${sid}/Calls/${exotelCallSid}`,
            auth: {
              username: sid,
              password: exotelToken
            },
            headers: {
              'Accept': 'application/json'
            }
          });

          console.log('Call status response:', statusResponse.data);

          if (statusResponse.data.Call && statusResponse.data.Call.Status) {
            const status = statusResponse.data.Call.Status.toLowerCase();
            if (status === 'completed') {
              clearInterval(pollInterval);
              setCallStatus('connected');
            } else if (status === 'failed' || status === 'busy') {
              clearInterval(pollInterval);
              setCallStatus('failed');
              setCallFeedback(statusResponse.data.Call.StatusMessage || 'Call failed');
            }
          }
        } catch (error) {
          console.error('Error polling call status:', error);
        }
      }, 2000);

      // Clear polling after 30 seconds if call hasn't connected
      setTimeout(() => {
        clearInterval(pollInterval);
        if (callStatus === 'dialing') {
          setCallStatus('failed');
          setCallFeedback('Call timed out');
        }
      }, 30000);

    } catch (error) {
      console.error('Error starting call:', error);
      setCallStatus('failed');
      setCallFeedback(error.message || 'Failed to start call');
    }
  };

  // Add connection status display
  const ConnectionStatus = () => {
    if (socketError) {
      return (
        <div className="fixed bottom-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
          Connection Error: {socketError}
        </div>
      );
    }
    if (!socketConnected) {
      return (
        <div className="fixed bottom-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded">
          Connecting to server...
        </div>
      );
    }
    return (
      <div className="fixed bottom-4 left-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
        Connected to server
      </div>
    );
  };

  // Add handleAddCallClick function
  const handleAddCallClick = () => {
    setShowDialer(true);
  };

  // Add DialerModal component
  const DialerModal = () => {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white rounded-lg p-3 w-64 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-medium">Dialer</h2>
            <button
              onClick={() => {
                if (callStatus === 'connected' || callStatus === 'dialing') {
                  handleCallEnd();
                }
                setShowDialer(false);
              }}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ✕
            </button>
          </div>

          {/* Call Status Display */}
          <div className="mb-2">
            {(callStatus === 'dialing' || callFeedback.isRinging) && (
              <div className="p-2 bg-blue-50 text-xs text-blue-600 rounded">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Dialing {dialedNumber}...</span>
                    <span className="animate-pulse text-green-600">🔔 Ringing...</span>
                  </div>
                  <button
                    onClick={handleCallEnd}
                    className="px-2 py-0.5 bg-red-500 text-white rounded text-xs"
                  >
                    Cancel Call
                  </button>
                </div>
                {callFeedback.error && (
                  <div className="mt-1 text-red-600 text-xs">
                    {callFeedback.error}
                  </div>
                )}
              </div>
            )}
            
            {callStatus === 'connected' && (
              <div className="p-2 bg-green-50 text-xs text-green-600 rounded">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Call in progress</span>
                    <span className="font-mono">
                      {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <button
                    onClick={handleCallEnd}
                    className="px-2 py-0.5 bg-red-500 text-white rounded text-xs"
                  >
                    End Call
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Number Display */}
          <div className="mb-2 p-2 bg-gray-50 rounded">
            <div className="flex justify-between items-center">
              <input
                type="text"
                value={dialedNumber}
                onChange={(e) => {
                  let value = e.target.value.replace('+91', '');
                  value = value.replace(/[^0-9]/g, '');
                  setDialedNumber('+91' + value);
                }}
                className="w-full bg-transparent text-lg font-mono focus:outline-none"
                placeholder="Enter number"
              />
              <div className="flex gap-1">
                <button
                  onClick={handlePaste}
                  className="px-2 py-0.5 text-xs bg-gray-200 rounded hover:bg-gray-300"
                >
                  Paste
                </button>
                <button
                  onClick={handleClear}
                  className="px-2 py-0.5 text-xs bg-gray-200 rounded hover:bg-gray-300"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Callbook Button */}
          <button
            onClick={() => setShowCallbook(!showCallbook)}
            className="w-full mb-2 p-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            {showCallbook ? 'Hide Callbook' : 'Show Callbook'}
          </button>

          {/* Callbook */}
          {showCallbook && (
            <div className="mb-2 max-h-32 overflow-y-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search leads..."
                className="w-full p-1 text-xs border rounded mb-1"
              />
              <div className="space-y-1">
                {filteredLeads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => handleLeadSelect(lead)}
                    className="w-full p-1 text-left hover:bg-gray-100 rounded text-xs"
                  >
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-gray-600">{lead.phone_no}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dial Pad */}
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberInput(num)}
                className="p-2 text-sm font-medium bg-gray-100 rounded hover:bg-gray-200"
              >
                {num}
              </button>
            ))}
          </div>

          {/* Call/End Call Button */}
          <button
            onClick={() => {
              if (callStatus === 'connected' || callStatus === 'dialing') {
                handleCallEnd();
              } else if (dialedNumber) {
                startCall(dialedNumber);
              }
            }}
            className={`w-full mt-2 p-2 text-sm text-white rounded ${
              callStatus === 'connected' || callStatus === 'dialing'
                ? 'bg-red-500 hover:bg-red-600'
                : dialedNumber
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {callStatus === 'connected' ? 'End Call' : 
             callStatus === 'dialing' ? 'Cancel Call' : 'Call'}
          </button>
        </div>
      </div>
    );
  };

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
            <div className="mt-2">
              <p className="text-gray-600">Current Campaign: {kpiData.currentCampaign}</p>
              {kpiData.assignedCampaigns.length > 1 && (
                <div className="mt-2">
                  <p className="text-gray-600 font-semibold">All Assigned Campaigns:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {kpiData.assignedCampaigns.map((campaign) => (
                      <span 
                        key={campaign.id}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {campaign.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
              onClick={handleAddCallClick}
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

      <ConnectionStatus />
      {showDialer && <DialerModal />}
    </div>
  );
};

export default CallerDashboard;