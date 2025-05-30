import React, { useState, useEffect } from 'react';
import { FaPhone, FaTimes } from 'react-icons/fa';
import { initiateCall, endCall } from '../utils/callUtils';

const DialerModal = ({ user, leads, onClose }) => {
  const [dialedNumber, setDialedNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [showCallbook, setShowCallbook] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [currentCallId, setCurrentCallId] = useState(null);
  const [currentCallSid, setCurrentCallSid] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  // Filter leads based on search term
  useEffect(() => {
    if (leads && searchTerm) {
      const filtered = leads.filter(lead => 
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone_no?.includes(searchTerm)
      );
      setFilteredLeads(filtered);
    } else {
      setFilteredLeads(leads || []);
    }
  }, [leads, searchTerm]);

  const handleCallButton = async () => {
    if (callStatus === 'connected' || callStatus === 'dialing') {
      try {
        await endCall(currentCallId, currentCallSid);
        setCallStatus('idle');
        setCurrentCallId(null);
        setCurrentCallSid(null);
        setCallDuration(0);
      } catch (error) {
        console.error('Error ending call:', error);
      }
    } else if (dialedNumber) {
      try {
        setCallStatus('dialing');
        const response = await initiateCall(
          dialedNumber, 
          user.id,
          selectedLead?.id || null
        );
        
        if (response.success) {
          setCurrentCallId(response.data.dbCallId);
          setCurrentCallSid(response.data.exotelCallSid);
          setCallStatus('connected');
        } else {
          setCallStatus('failed');
        }
      } catch (error) {
        console.error('Error making call:', error);
        setCallStatus('failed');
      }
    }
  };

  const startCall = async (phoneNumber, leadId) => {
    try {
        const token = localStorage.getItem('token');
        
        // Step 1: Initiate call
        const initiateResponse = await axios.post(
            `${BASE_URL}/api/calls/initiate`,
            {
                to: phoneNumber,
                from: user.phone || process.env.REACT_APP_DEFAULT_CALLER,
                leadId: leadId
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        if (initiateResponse.data.success) {
            const { callId } = initiateResponse.data.data;
            
            // Step 2: Connect call
            const connectResponse = await axios.post(
                `${BASE_URL}/api/calls/connect`,
                {
                    callId,
                    to: phoneNumber,
                    from: user.phone || process.env.REACT_APP_DEFAULT_CALLER
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (connectResponse.data.success) {
                setCurrentCallId(callId);
                setCurrentCallSid(connectResponse.data.data.exotelCallSid);
                setCallStatus('connected');
                startTimer();
            }
        }
    } catch (error) {
        console.error('Error making call:', error);
        setCallStatus('failed');
        setCallFeedback({
            error: error.response?.data?.message || 'Failed to make call'
        });
    }
};

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* ... existing dialer UI code ... */}
    </div>
  );
};

export default DialerModal;