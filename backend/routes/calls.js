const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../config/db');
const { authenticateToken } = require('../middlewares/auth');
const ExotelConfig = require('../models/ExotelConfig');

// Exotel credentials
// Get these from your Exotel dashboard (https://my.exotel.com)
// Go to Settings -> API Credentials
const SID = 'telecrm3';  // Your Account SID
const TOKEN = '65754531b300990367bffca4ac38f7d538126a8aa2fad9f7';  // Your API Token
const EXOTEL_NUMBER = '07948518141';  // Your Exotel phone number

// Example of correct format:
// const SID = 'exotel123456789';
// const TOKEN = '1234567890abcdef1234567890abcdef';
// const EXOTEL_NUMBER = '07948518141';

// Initiate call
router.post('/initiate', authenticateToken, async (req, res) => {
  console.log('\n=== Starting New Call ===');
  let connection;
  try {
    const { to, from, leadId } = req.body;
    const callerId = req.user.id; // Get caller ID from authenticated user
    
    // Get Exotel configuration from database
    const [exotelConfig] = await db.query("SELECT * FROM exotel_config ORDER BY id DESC LIMIT 1");
    if (!exotelConfig || exotelConfig.length === 0) {
      throw new Error('Exotel configuration not found. Please configure Exotel settings first.');
    }

    const { sid: SID, token: TOKEN, phone_number: EXOTEL_NUMBER } = exotelConfig[0];
    
    // Debug log the incoming request
    console.log('DEBUG - Request body:', req.body);
    console.log('DEBUG - User:', req.user);
    console.log('DEBUG - Exotel Config:', { SID, EXOTEL_NUMBER });
    
    // Validate required fields
    if (!to) {
      throw new Error('Phone number (to) is required');
    }
    if (!callerId) {
      throw new Error('Caller ID is required');
    }
    
    console.log('1. Call Request Details:', {
      to,
      from,
      leadId,
      callerId,
      timestamp: new Date().toISOString()
    });

    // Start transaction
    connection = await db.getConnection();
    await connection.beginTransaction();

    let finalLeadId = leadId;

    // If no leadId provided, check if lead exists with this phone number
    if (!finalLeadId) {
      console.log('2. Checking for existing lead...');
      const [existingLead] = await connection.query(
        'SELECT id FROM leads WHERE phone_no = ?',
        [to]
      );

      if (existingLead && existingLead.length > 0) {
        finalLeadId = existingLead[0].id;
        console.log('2.1 Found existing lead with ID:', finalLeadId);
      } else {
        console.log('2.1 No existing lead found, creating new lead...');
        // Create a new lead record
        try {
          // Get caller's admin_id from users table
          const [caller] = await connection.query(
            'SELECT manager_id FROM users WHERE id = ?',
            [callerId]
          );
          
          console.log('2.2 Caller details:', caller);

          const adminId = caller?.[0]?.manager_id || callerId;
          console.log('2.3 Using admin ID:', adminId);
          
          // Create a new lead record
          const [result] = await connection.query(
            `INSERT INTO leads (
              title, 
              name, 
              phone_no, 
              status, 
              lead_category,
              assigned_to,
              admin_id,
              created_at
            ) VALUES (?, ?, ?, 'New', 'Fresh Lead', ?, ?, NOW())`,
            [
              `Call to ${to}`,  // title
              `Unknown Lead - ${to}`,  // name
              to,  // phone_no
              callerId,  // assigned_to
              adminId  // admin_id
            ]
          );
          
          finalLeadId = result.insertId;
          console.log('2.4 New lead created with ID:', finalLeadId);

          if (!finalLeadId) {
            throw new Error('Failed to create lead record - no ID returned');
          }
        } catch (leadError) {
          console.error('Failed to create lead:', leadError);
          throw new Error('Failed to create lead record: ' + leadError.message);
        }
      }
    }

    // Verify we have a valid lead ID
    if (!finalLeadId) {
      throw new Error('No valid lead ID available');
    }

    // Verify the lead exists
    const [leadCheck] = await connection.query(
      'SELECT id FROM leads WHERE id = ?',
      [finalLeadId]
    );

    if (!leadCheck || leadCheck.length === 0) {
      throw new Error(`Lead with ID ${finalLeadId} not found`);
    }

    // Format the phone number for Exotel
    let formattedNumber = to.replace(/[^0-9]/g, ''); // Remove all non-numeric characters
    if (formattedNumber.startsWith('91')) {
      formattedNumber = formattedNumber.substring(2);
    }
    if (!formattedNumber.startsWith('0')) {
      formattedNumber = '0' + formattedNumber;
    }
    
    console.log('3. Phone Number Formatting:', {
      original: to,
      formatted: formattedNumber
    });

    // Create call record in database
    console.log('4. Creating call record in database...');
    try {
      console.log('4.1 Inserting call record with:', {
        callerId,
        finalLeadId,
        timestamp: new Date().toISOString()
      });

      // Double check lead_id is not null
      if (!finalLeadId) {
        throw new Error('Lead ID is null when creating call record');
      }

      const [callResult] = await connection.query(
        `INSERT INTO calls 
         (caller_id, lead_id, start_time, status, call_type, disposition)
         VALUES (?, ?, NOW(), 'missed', 'outbound', 'pending')`,
        [callerId, finalLeadId]
      );
      
      const callId = callResult.insertId;
      console.log('4.2 Call record created with ID:', callId);

      // Exotel API endpoint - using the correct format
      const url = `https://api.exotel.com/v1/Accounts/${SID}/Calls/connect`;
      
      // Create form data as Exotel expects
      const formData = new URLSearchParams();
      formData.append('From', EXOTEL_NUMBER);
      formData.append('To', formattedNumber);
      formData.append('CallerId', EXOTEL_NUMBER);
      formData.append('CallType', 'trans');
      formData.append('TimeLimit', '300');
      formData.append('Record', 'true');
      formData.append('PlayDtmf', 'true');
      formData.append('CallerName', 'TeleCRM');

      console.log('5.1 Making Exotel API request with data:', {
        url,
        formData: Object.fromEntries(formData),
        auth: {
          username: SID,
          password: '********' // Masked for security
        },
        phoneNumber: {
          original: to,
          formatted: formattedNumber,
          exotelNumber: EXOTEL_NUMBER
        }
      });

      try {
        // Make request to Exotel with proper error handling
        console.log('5.2 Sending request to Exotel...');
        const response = await axios({
          method: 'post',
          url: url,
          data: formData,
          auth: {
            username: SID,
            password: TOKEN
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          validateStatus: function (status) {
            return status >= 200 && status < 500; // Accept all responses for better error handling
          }
        });

        // Log the complete response for debugging
        console.log('6. Complete Exotel API Response:', {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
          timestamp: new Date().toISOString()
        });

        // Check for Exotel error response
        if (response.data.RestException) {
          console.error('Exotel API error:', response.data.RestException);
          throw new Error(`Exotel API error: ${response.data.RestException.Message}`);
        }

        // Get the call SID from the response
        let exotelCallSid = null;
        
        // Try different possible locations for the call SID
        if (response.data.Call && response.data.Call.Sid) {
          exotelCallSid = response.data.Call.Sid;
          console.log('Found call SID in Call.Sid:', exotelCallSid);
        } else if (response.data.Sid) {
          exotelCallSid = response.data.Sid;
          console.log('Found call SID in Sid:', exotelCallSid);
        } else if (response.data.call_sid) {
          exotelCallSid = response.data.call_sid;
          console.log('Found call SID in call_sid:', exotelCallSid);
        } else if (response.data.callSid) {
          exotelCallSid = response.data.callSid;
          console.log('Found call SID in callSid:', exotelCallSid);
        }

        console.log('6.2 Final call SID:', exotelCallSid);
        
        if (!exotelCallSid) {
          // If no call SID in response, generate a temporary one
          exotelCallSid = `temp_${Date.now()}_${callId}`;
          console.log('Generated temporary call SID:', exotelCallSid);
        }

        // Update call record with Exotel call SID and additional details
        console.log('7. Updating call record with Exotel SID:', exotelCallSid);
        await connection.query(
          `UPDATE calls 
           SET exotel_call_sid = ?, 
               status = 'initiated',
               start_time = NOW(),
               call_type = 'outbound',
               disposition = 'in-progress'
           WHERE id = ?`,
          [exotelCallSid, callId]
        );
        console.log('7.1 Call record updated successfully');

        // Commit transaction
        await connection.commit();
        console.log('=== Call Initiated Successfully ===\n');

        // Get the call details from database
        console.log('8. Fetching call details for ID:', callId);
        const [callDetails] = await connection.query(
          `SELECT 
            id,
            exotel_call_sid,
            start_time,
            status,
            call_type,
            disposition
           FROM calls 
           WHERE id = ?`,
          [callId]
        );

        console.log('8.1 Call details from database:', {
          callDetails: callDetails[0],
          hasCallDetails: !!callDetails[0],
          callId: callId,
          exotelSid: exotelCallSid
        });

        if (!callDetails || !callDetails[0]) {
          console.error('No call details found for ID:', callId);
          throw new Error('Failed to retrieve call details');
        }

        // Create the complete response
        const responseData = {
          dbCallId: callId,
          exotelCallSid: exotelCallSid,
          exotelConfig: {
            sid: SID,
            phoneNumber: EXOTEL_NUMBER
          },
          message: 'Call initiated successfully',
          callDetails: {
            startTime: callDetails[0].start_time,
            duration: 0,
            status: callDetails[0].status,
            callType: callDetails[0].call_type,
            disposition: callDetails[0].disposition
          }
        };

        console.log('9. Response data being sent:', responseData);

        // Send response directly
        res.status(200).json({
          success: true,
          data: responseData
        });
      } catch (error) {
        console.error('Exotel API call failed:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            data: error.config?.data
          }
        });

        // Rollback transaction
        if (connection) {
          await connection.rollback();
        }

        // Update call status to failed
        await connection.query(
          `UPDATE calls 
           SET status = 'failed',
               disposition = 'failed',
               end_time = NOW()
           WHERE id = ?`,
          [callId]
        );

        throw new Error(`Exotel API call failed: ${error.message}`);
      }
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      throw new Error('Failed to create or update call record: ' + dbError.message);
    }
  } catch (error) {
    // Rollback transaction if it exists
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Failed to rollback transaction:', rollbackError);
      }
    }

    console.error('\n=== Call Initiation Failed ===');
    console.error('Error Details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data
      },
      timestamp: new Date().toISOString()
    });
    console.error('=== End Error Log ===\n');
    
    res.status(500).json({ 
      success: false, 
      message: error.message,
      details: error.response?.data || 'No additional details available'
    });
  } finally {
    // Release connection back to pool
    if (connection) {
      connection.release();
    }
  }
});

// End call
router.post('/end', async (req, res) => {
  console.log('\n=== Ending Call ===');
  try {
    const { callSid, callId } = req.body;
    
    console.log('1. Call End Request:', { 
      callSid, 
      callId,
      timestamp: new Date().toISOString()
    });

    // Get Exotel configuration from database
    const [exotelConfig] = await db.query("SELECT * FROM exotel_config ORDER BY id DESC LIMIT 1");
    if (!exotelConfig || exotelConfig.length === 0) {
      throw new Error('Exotel configuration not found');
    }

    const { sid: SID, token: TOKEN } = exotelConfig[0];
    
    // Update call record in database
    console.log('2. Updating call record...');
    await db.query(
      `UPDATE calls 
       SET end_time = NOW(),
           status = 'completed',
           disposition = 'completed'
       WHERE id = ?`,
      [callId]
    );
    console.log('   Call record updated successfully');

    // Exotel API endpoint for ending call
    const url = `https://api.exotel.com/v1/Accounts/${SID}/Calls/${callSid}.json`;
    
    const formData = new URLSearchParams();
    formData.append('Status', 'completed');

    console.log('3. Making Exotel API request to end call...');
    const response = await axios.post(url, formData, {
      auth: {
        username: SID,
        password: TOKEN
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    });

    console.log('4. Exotel API Response:', {
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    console.log('=== Call Ended Successfully ===\n');

    res.json({ 
      success: true,
      message: 'Call ended successfully',
      data: {
        callId,
        callSid,
        status: 'completed',
        endTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('\n=== Call End Failed ===');
    console.error('Error Details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      timestamp: new Date().toISOString()
    });
    console.error('=== End Error Log ===\n');
    
    res.status(500).json({ 
      success: false, 
      message: error.message,
      details: error.response?.data || 'No additional details available'
    });
  }
});

// Call status webhook
router.post('/status', async (req, res) => {
  console.log('\n=== Call Status Update ===');
  try {
    const callStatus = req.body.Status;
    const callSid = req.body.CallSid;
    console.log('1. Status Update:', {
      callSid,
      status: callStatus,
      timestamp: new Date().toISOString()
    });

    // Update call status in database
    console.log('2. Updating call status in database...');
    await db.query(
      `UPDATE calls 
       SET status = ?,
           disposition = ?
       WHERE exotel_call_sid = ?`,
      [callStatus, callStatus, callSid]
    );
    console.log('   Call status updated successfully');
    console.log('=== Status Update Complete ===\n');

    res.sendStatus(200);
  } catch (error) {
    console.error('\n=== Status Update Failed ===');
    console.error('Error Details:', {
      message: error.message,
      timestamp: new Date().toISOString()
    });
    console.error('=== End Error Log ===\n');
    res.sendStatus(500);
  }
});

// Get all calls
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('\n=== Getting All Calls ===');
    const query = req.user.role === 'admin' || req.user.role === 'manager'
      ? 'SELECT * FROM calls ORDER BY start_time DESC'
      : 'SELECT * FROM calls WHERE caller_id = ? ORDER BY start_time DESC';
    
    const params = req.user.role === 'admin' || req.user.role === 'manager' ? [] : [req.user.id];
    
    const [calls] = await db.query(query, params);
    console.log(`Found ${calls.length} calls`);

    res.json({
      success: true,
      data: calls
    });
  } catch (error) {
    console.error('Error fetching calls:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching calls',
      error: error.message
    });
  }
});

// Get call by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('\n=== Getting Call by ID ===');
    const callId = req.params.id;
    
    // First check if the call exists
    const [calls] = await db.query('SELECT * FROM calls WHERE id = ?', [callId]);
    
    if (!calls || calls.length === 0) {
      console.log(`Call with ID ${callId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    const call = calls[0];
    
    // Check if user has access to this call
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && call.caller_id !== req.user.id) {
      console.log('Access denied for user:', req.user.id);
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    console.log(`Found call with ID ${callId}`);
    res.json({
      success: true,
      data: call
    });
  } catch (error) {
    console.error('Error fetching call:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching call',
      error: error.message
    });
  }
});

// Get performance metrics for a caller
router.get('/stats/performance/:callerId', authenticateToken, async (req, res) => {
  try {
    console.log('\n=== Getting Performance Metrics ===');
    const { callerId } = req.params;
    
    // Check if user has access
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.id !== parseInt(callerId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [metrics] = await db.query(`
      SELECT 
        COUNT(*) as total_calls,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_calls,
        SUM(CASE WHEN disposition = 'success' THEN 1 ELSE 0 END) as successful_calls,
        AVG(duration) as avg_duration,
        SUM(CASE WHEN callback_datetime IS NOT NULL THEN 1 ELSE 0 END) as scheduled_callbacks
      FROM calls 
      WHERE caller_id = ?
    `, [callerId]);

    res.json({
      success: true,
      data: metrics[0]
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching performance metrics',
      error: error.message
    });
  }
});

// Get best calling hours
router.get('/stats/best-hours/:callerId', authenticateToken, async (req, res) => {
  try {
    console.log('\n=== Getting Best Calling Hours ===');
    const { callerId } = req.params;
    
    // Check if user has access
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.id !== parseInt(callerId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [bestHours] = await db.query(`
      SELECT 
        HOUR(start_time) as hour,
        COUNT(*) as call_count,
        AVG(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as success_rate
      FROM calls 
      WHERE caller_id = ?
      GROUP BY HOUR(start_time)
      ORDER BY success_rate DESC, call_count DESC
      LIMIT 5
    `, [callerId]);

    res.json({
      success: true,
      data: bestHours
    });
  } catch (error) {
    console.error('Error fetching best hours:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching best hours',
      error: error.message
    });
  }
});

// Get daily stats
router.get('/stats/daily/:callerId', authenticateToken, async (req, res) => {
  try {
    console.log('\n=== Getting Daily Stats ===');
    const { callerId } = req.params;
    
    // Check if user has access
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.id !== parseInt(callerId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [dailyStats] = await db.query(`
      SELECT 
        DATE(start_time) as date,
        COUNT(*) as total_calls,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_calls,
        AVG(duration) as avg_duration
      FROM calls 
      WHERE caller_id = ?
      GROUP BY DATE(start_time)
      ORDER BY date DESC
      LIMIT 30
    `, [callerId]);

    res.json({
      success: true,
      data: dailyStats
    });
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching daily stats',
      error: error.message
    });
  }
});

// Get callback efficiency
router.get('/stats/callback-efficiency/:callerId', authenticateToken, async (req, res) => {
  try {
    console.log('\n=== Getting Callback Efficiency ===');
    const { callerId } = req.params;
    
    // Check if user has access
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.id !== parseInt(callerId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [efficiency] = await db.query(`
      SELECT 
        COUNT(*) as total_callbacks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_callbacks,
        AVG(TIMESTAMPDIFF(MINUTE, callback_datetime, start_time)) as avg_callback_delay
      FROM calls 
      WHERE caller_id = ? 
      AND callback_datetime IS NOT NULL
    `, [callerId]);

    res.json({
      success: true,
      data: efficiency[0]
    });
  } catch (error) {
    console.error('Error fetching callback efficiency:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching callback efficiency',
      error: error.message
    });
  }
});

// Get monthly stats
router.get('/stats/monthly/:callerId', authenticateToken, async (req, res) => {
  try {
    console.log('\n=== Getting Monthly Stats ===');
    const { callerId } = req.params;
    
    // Check if user has access
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.id !== parseInt(callerId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [monthlyStats] = await db.query(`
      SELECT 
        DATE_FORMAT(start_time, '%Y-%m') as month,
        COUNT(*) as total_calls,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_calls,
        AVG(duration) as avg_duration,
        SUM(CASE WHEN disposition = 'success' THEN 1 ELSE 0 END) as successful_calls
      FROM calls 
      WHERE caller_id = ?
      GROUP BY DATE_FORMAT(start_time, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `, [callerId]);

    res.json({
      success: true,
      data: monthlyStats
    });
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly stats',
      error: error.message
    });
  }
});

// Get caller stats
router.get('/stats/caller/:callerId', authenticateToken, async (req, res) => {
  try {
    console.log('\n=== Getting Caller Stats ===');
    const { callerId } = req.params;
    
    // Check if user has access
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.id !== parseInt(callerId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_calls,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_calls,
        AVG(duration) as avg_duration,
        SUM(CASE WHEN disposition = 'success' THEN 1 ELSE 0 END) as successful_calls,
        SUM(CASE WHEN callback_datetime IS NOT NULL THEN 1 ELSE 0 END) as scheduled_callbacks,
        MAX(start_time) as last_call_time
      FROM calls 
      WHERE caller_id = ?
    `, [callerId]);

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Error fetching caller stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching caller stats',
      error: error.message
    });
  }
});

module.exports = router;