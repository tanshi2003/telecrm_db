import axios from 'axios';

export const initiateCall = async (phoneNumber, userId, leadId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Format phone number
    let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanNumber.startsWith('91')) {
      cleanNumber = '91' + cleanNumber;
    }

    const response = await axios.post(
      'http://localhost:5000/api/calls/initiate',
      {
        to: cleanNumber,
        from: userId,
        leadId: leadId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error initiating call:', error);
    throw error;
  }
};

export const endCall = async (callId, callSid) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post(
      `http://localhost:5000/api/calls/end`,
      {
        callId,
        callSid
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error ending call:', error);
    throw error;
  }
};