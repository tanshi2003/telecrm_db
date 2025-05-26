const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../config/db');
const { authenticateToken } = require('../middlewares/auth');
const ExotelConfig = require('../models/ExotelConfig');
const xml2js = require('xml2js');

// Initiate call
router.post('/initiate', authenticateToken, (req, res) => {
  console.log('\n=== Starting New Call ===');
  let connection;
  let formattedNumber;
  let callId;
  
  const { to, from, leadId } = req.body;
  const callerId = req.user.id;
  
  // Validate required fields
  if (!to) {
    return res.status(400).json({ success: false, message: 'Phone number (to) is required' });
  }
  if (!callerId) {
    return res.status(400).json({ success: false, message: 'Caller ID is required' });
  }
  if (!leadId) {
    return res.status(400).json({ success: false, message: 'leadId is required' });
  }
  
  db.query("SELECT * FROM exotel_config ORDER BY id DESC LIMIT 1", (err, exotelConfig) => {
    if (err) {
      console.error('Error in initial setup:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
    if (!exotelConfig || exotelConfig.length === 0) {
      return res.status(500).json({ success: false, message: 'Exotel configuration not found.' });
    }
    const { sid: SID, token: TOKEN, phone_number: EXOTEL_NUMBER } = exotelConfig[0];
    
    // Debug log the incoming request
    console.log('DEBUG - Request body:', req.body);
    console.log('DEBUG - User:', req.user);
    console.log('DEBUG - Exotel Config:', { SID, EXOTEL_NUMBER });
    
    console.log('1. Call Request Details:', {
      to,
      from,
      leadId,
      callerId,
      timestamp: new Date().toISOString()
    });

    db.getConnection((err, conn) => {
      if (err) {
        console.error('Error getting connection:', err);
        return res.status(500).json({ success: false, message: err.message });
      }
      connection = conn;
      conn.beginTransaction(err => {
        if (err) {
          connection.release();
          return res.status(500).json({ success: false, message: err.message });
        }

        // Format the phone number for Exotel
        formattedNumber = to.replace(/[^0-9]/g, '');
        // Remove any existing country code
        if (formattedNumber.startsWith('91')) {
          formattedNumber = formattedNumber.substring(2);
        }
        // Remove leading 0 if present
        if (formattedNumber.startsWith('0')) {
          formattedNumber = formattedNumber.substring(1);
        }
        // Add country code
        formattedNumber = '91' + formattedNumber;
        
        // Format the from number
        let formattedFrom = from.replace(/[^0-9]/g, '');
        if (formattedFrom.startsWith('91')) {
          formattedFrom = formattedFrom.substring(2);
        }
        if (formattedFrom.startsWith('0')) {
          formattedFrom = formattedFrom.substring(1);
        }
        formattedFrom = '91' + formattedFrom;
        
        console.log('3. Phone Number Formatting:', {
          original: to,
          formatted: formattedNumber,
          from: {
            original: from,
            formatted: formattedFrom
          }
        });

        // Create call record in database
        console.log('4. Creating call record in database...');
        connection.query(
          `INSERT INTO calls (caller_id, lead_id, start_time, status, call_type, disposition)
           VALUES (?, ?, NOW(), 'initiated', 'outbound', 'pending')`,
          [callerId, leadId],
          (err, result) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({ success: false, message: err.message });
              });
            }
            callId = result.insertId;
            console.log('4.2 Call record created with ID:', callId);

            // Exotel API endpoint
            const url = `https://api.exotel.com/v1/Accounts/${SID}/Calls/connect`;
            const formData = new URLSearchParams();
            formData.append('From', formattedFrom);
            formData.append('To', formattedNumber);
            formData.append('CallerId', EXOTEL_NUMBER);
            formData.append('CallType', 'trans');
            formData.append('TimeLimit', '300');
            formData.append('Record', 'true');
            formData.append('PlayDtmf', 'true');
            formData.append('CallerName', 'TeleCRM');
            formData.append('StatusCallback', 'http://localhost:5000/api/calls/status');
            formData.append('StatusCallbackMethod', 'POST');
            formData.append('StatusCallbackEvent', 'initiated,ringing,answered,completed');
            formData.append('AgentNumber', formattedFrom);

            console.log('5.1 Making Exotel API request with data:', {
              url,
              formData: Object.fromEntries(formData),
              auth: {
                username: SID,
                password: TOKEN
              },
              phoneNumber: {
                original: to,
                formatted: formattedNumber,
                from: {
                  original: from,
                  formatted: formattedFrom
                },
                exotelNumber: EXOTEL_NUMBER
              }
            });

            // Create Basic Auth header
            const auth = Buffer.from(`${SID}:${TOKEN}`).toString('base64');

            axios({
              method: 'post',
              url: url,
              data: formData,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, application/xml, text/xml, */*',
                'Authorization': `Basic ${auth}`
              },
              responseType: 'text',
              validateStatus: function (status) {
                return status >= 200 && status < 500;
              }
            }).then(response => {
              console.log('Exotel API Response:', {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                data: response.data
              });
              
              // Parse XML response from Exotel
              require('xml2js').parseString(response.data, (err, parsedXml) => {
                if (err) {
                  console.error('Error parsing Exotel response:', err);
                  return connection.rollback(() => {
                    connection.release();
                    res.status(500).json({ success: false, message: 'Failed to parse Exotel response' });
                  });
                }
                console.log('Parsed Exotel XML:', JSON.stringify(parsedXml, null, 2));
                
                let exotelCallSid = null;
                if (parsedXml && parsedXml.TwilioResponse && parsedXml.TwilioResponse.Call && parsedXml.TwilioResponse.Call[0].Sid) {
                  exotelCallSid = parsedXml.TwilioResponse.Call[0].Sid[0];
                }
                if (!exotelCallSid) {
                  console.warn('No Exotel Call SID in response, using temporary ID');
                  exotelCallSid = `temp_${Date.now()}_${callId}`;
                }
                console.log('6.2 Final call SID:', exotelCallSid);

                // Update call record with Exotel call SID
                connection.query(
                  `UPDATE calls SET exotel_call_sid = ?, status = 'initiated', start_time = NOW(), call_type = 'outbound', disposition = 'in-progress' WHERE id = ?`,
                  [exotelCallSid, callId],
                  (err) => {
                    if (err) {
                      return connection.rollback(() => {
                        connection.release();
                        res.status(500).json({ success: false, message: err.message });
                      });
                    }
                    connection.commit(err => {
                      if (err) {
                        connection.release();
                        return res.status(500).json({ success: false, message: err.message });
                      }
                      connection.release();
                      console.log('=== Call Initiated Successfully ===\n');
                      // Get the call details from database
                      db.query(
                        `SELECT id, exotel_call_sid, start_time, status, call_type, disposition FROM calls WHERE id = ?`,
                        [callId],
                        (err, callDetails) => {
                          if (err || !callDetails[0]) {
                            return res.status(500).json({ success: false, message: 'Failed to retrieve call details' });
                          }
                          res.status(200).json({
                            success: true,
                            data: {
                              dbCallId: callId,
                              exotelCallSid: exotelCallSid,
                              message: 'Call initiated successfully',
                              callDetails: {
                                startTime: callDetails[0].start_time,
                                duration: 0,
                                status: callDetails[0].status,
                                callType: callDetails[0].call_type,
                                disposition: callDetails[0].disposition
                              }
                            }
                          });
                        }
                      );
                    });
                  }
                );
              });
            }).catch(error => {
              connection.rollback(() => {
                connection.release();
                res.status(500).json({ success: false, message: error.message });
              });
            });
          }
        );
      });
    });
  });
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
router.post('/status', (req, res) => {
  const callStatus = req.body.Status;
  const callSid = req.body.CallSid;
  db.query(
    `UPDATE calls SET status = ?, disposition = ? WHERE exotel_call_sid = ?`,
    [callStatus, callStatus, callSid],
    (err) => {
      if (err) return res.sendStatus(500);
      res.sendStatus(200);
    }
  );
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
router.get('/:id', authenticateToken, (req, res) => {
  try {
    console.log('\n=== Getting Call by ID ===');
    const callId = req.params.id;

    // First check if the call exists
    db.query('SELECT * FROM calls WHERE id = ?', [callId], (err, calls) => {
      if (err) {
        console.error('Error fetching call:', err);
        return res.status(500).json({
          success: false,
          message: 'Error fetching call',
          error: err.message
        });
      }
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