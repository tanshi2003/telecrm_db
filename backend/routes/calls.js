const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../config/db');

// Exotel credentials
const SID = 'telecrm3';  // App ID / Flow Name
const TOKEN = '7817-8226-75';  // Pin
const EXOTEL_NUMBER = '07948518141';  // ExoPhone number

// Initiate call
router.post('/initiate', async (req, res) => {
  console.log('\n=== Starting New Call ===');
  let connection;
  try {
    const { to, from, leadId } = req.body;
    const callerId = req.user.id; // Get caller ID from authenticated user
    
    // Debug log the incoming request
    console.log('DEBUG - Request body:', req.body);
    console.log('DEBUG - User:', req.user);
    
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

      // Exotel API endpoint
      const url = `https://api.exotel.com/v1/Accounts/${SID}/Calls/connect.json`;
      
      // Create form data as Exotel expects
      const formData = new URLSearchParams();
      formData.append('From', EXOTEL_NUMBER);
      formData.append('To', formattedNumber);
      formData.append('CallerId', EXOTEL_NUMBER);
      formData.append('CallType', 'trans');
      formData.append('StatusCallback', 'http://localhost:5000/api/calls/status');

      console.log('5. Making Exotel API request:', {
        url,
        formData: Object.fromEntries(formData),
        timestamp: new Date().toISOString()
      });

      // Make request to Exotel
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

      console.log('6. Exotel API Response:', {
        status: response.status,
        data: response.data,
        timestamp: new Date().toISOString()
      });

      if (response.data && response.data.Call && response.data.Call.Sid) {
        // Update call record with Exotel call SID
        console.log('7. Updating call record with Exotel SID...');
        await connection.query(
          `UPDATE calls 
           SET exotel_call_sid = ?, 
               status = 'completed'
           WHERE id = ?`,
          [response.data.Call.Sid, callId]
        );
        console.log('7.1 Call record updated successfully');

        // Commit transaction
        await connection.commit();
        console.log('=== Call Initiated Successfully ===\n');
        res.json({ 
          success: true, 
          callSid: response.data.Call.Sid,
          callId: callId,
          leadId: finalLeadId,
          message: 'Call initiated successfully'
        });
      } else {
        throw new Error('Invalid response from Exotel API');
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

    res.json({ success: true });
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

module.exports = router;