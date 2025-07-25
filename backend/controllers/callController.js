const db = require('../config/db');
const { validationResult } = require('express-validator');
const responseFormatter = require('../utils/responseFormatter');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

// Store active calls in memory (you might want to use Redis in production)
const activeCalls = new Map();

const CallController = {
    // Initialize a new call
    initiateCall: async (req, res) => {
        try {
            const { to, from, leadId } = req.body;
            const callerId = req.user.id;

            // First create call record
            const [result] = await db.promise().query(
                `INSERT INTO Calls (caller_id, lead_id, start_time, status, call_type, disposition)
                 VALUES (?, ?, NOW(), 'initiated', 'outbound', 'pending')`,
                [callerId, leadId]
            );

            // Return the call ID for next step
            res.json({
                success: true,
                data: {
                    callId: result.insertId,
                    status: 'initiated'
                }
            });
        } catch (error) {
            console.error('Error initiating call:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Connect a call using Exotel API
    connectCall: async (req, res) => {
        try {
            const { callId, to, from } = req.body;
            
            // Exotel API configuration
            const SID = process.env.EXOTEL_SID;
            const TOKEN = process.env.EXOTEL_TOKEN;
            const auth = Buffer.from(`${SID}:${TOKEN}`).toString('base64');

            // Make API call to Exotel
            const response = await axios.post(
                `https://api.exotel.com/v1/Accounts/${SID}/Calls/connect`,
                {
                    From: from,
                    To: to,
                    CallerId: process.env.EXOTEL_CALLER_ID,
                    Record: "true"
                },
                {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            // Update call record with Exotel SID
            await db.promise().query(
                `UPDATE Calls SET exotel_call_sid = ?, status = 'connected' WHERE id = ?`,
                [response.data.Call.Sid, callId]
            );

            res.json({
                success: true,
                data: {
                    callId,
                    exotelCallSid: response.data.Call.Sid,
                    status: 'connected'
                }
            });
        } catch (error) {
            console.error('Error connecting call:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Handle call answer
    answerCall: async (req, res) => {
        try {
            const { callId, answer } = req.body;
            const recipientId = req.user.id;

            const callInfo = activeCalls.get(callId);
            if (!callInfo) {
                return res.status(404).json({
                    success: false,
                    error: 'Call not found'
                });
            }

            // Update call information in memory
            callInfo.answer = answer;
            callInfo.recipientId = recipientId;
            callInfo.status = 'answered';
            activeCalls.set(callId, callInfo);

            // Forward the answer to the caller through Socket.IO
            const io = req.app.get('io');
            if (io) {
                io.to(callInfo.callerId.toString()).emit('call:accepted', {
                    answer: answer,
                    callId: callId
                });
            }

            // Update call status in database
            const query = `
                UPDATE Calls 
                SET status = 'in-progress',
                    disposition = 'answered'
                WHERE id = ?
            `;

            db.query(query, [callInfo.dbCallId], (err) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        success: false,
                        error: 'Failed to update call status'
                    });
                }

                res.json({
                    success: true,
                    data: {
                        callId,
                        message: 'Call answered successfully'
                    }
                });
            });
        } catch (error) {
            console.error('Error answering call:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to answer call'
            });
        }
    },

    // Handle ICE candidates
    handleIceCandidate: async (req, res) => {
        try {
            const { callId, candidate, to } = req.body;
            const userId = req.user.id;

            const callInfo = activeCalls.get(callId);
            if (!callInfo) {
                return res.status(404).json({
                    success: false,
                    error: 'Call not found'
                });
            }

            // Forward ICE candidate to the other peer through Socket.IO
            const io = req.app.get('io');
            if (io) {
                io.to(to).emit('call:ice-candidate', {
                    candidate: candidate,
                    callId: callId,
                    from: userId
                });
            }

            res.json({
                success: true,
                data: {
                    callId,
                    message: 'ICE candidate forwarded'
                }
            });
        } catch (error) {
            console.error('Error handling ICE candidate:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to handle ICE candidate'
            });
        }
    },

    // End a call
    endCall: async (req, res) => {
        try {
            const { callId } = req.body;
            const userId = req.user.id;

            const callInfo = activeCalls.get(callId);
            if (!callInfo) {
                return res.status(404).json({
                    success: false,
                    error: 'Call not found'
                });
            }

            // Update call information in memory
            callInfo.status = 'ended';
            callInfo.endedAt = new Date();
            callInfo.endedBy = userId;

            // Calculate call duration
            const duration = Math.floor((callInfo.endedAt - callInfo.createdAt) / 1000);

            // Update call record in database
            const query = `
                UPDATE Calls 
                SET end_time = NOW(),
                    duration = ?,
                    status = CASE 
                        WHEN ? = 'answered' THEN 'completed'
                        ELSE 'missed'
                    END,
                    disposition = CASE 
                        WHEN ? = 'answered' THEN 'completed'
                        ELSE 'missed'
                    END
                WHERE id = ?
            `;

            db.query(
                query,
                [duration, callInfo.status, callInfo.status, callInfo.dbCallId],
                (err) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({
                            success: false,
                            error: 'Failed to update call record'
                        });
                    }

                    // Remove from active calls
                    activeCalls.delete(callId);

                    res.json({
                        success: true,
                        data: {
                            callId,
                            message: 'Call ended successfully'
                        }
                    });
                }
            );
        } catch (error) {
            console.error('Error ending call:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to end call'
            });
        }
    },

    // Create a new call
    createCall: (req, res) => {
        try {
            const {
                lead_id,
                start_time,
                end_time,
                duration,
                status,
                call_type,
                disposition,
                notes,
                recording_url,
                callback_scheduled,
                caller_id
            } = req.body;
            db.query(
                `INSERT INTO Calls (
                    lead_id, 
                    caller_id, 
                    start_time,
                    end_time,
                    duration,
                    status,
                    call_type,
                    disposition,
                    notes,
                    recording_url,
                    callback_datetime,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                    lead_id,
                    caller_id,
                    start_time,
                    end_time,
                    duration,
                    status,
                    call_type,
                    disposition,
                    notes,
                    recording_url,
                    callback_scheduled
                ],
                (err, result) => {
                    if (err) {
                        console.error('Error creating call:', err);
                        return res.status(500).json(responseFormatter(false, err.message));
                    }
                    res.json(responseFormatter(true, "Call created successfully", { id: result.insertId }));
                }
            );
        } catch (error) {
            console.error('Error creating call:', error);
            res.status(500).json(responseFormatter(false, error.message));
        }
    },

    // Get calls by caller ID
    getCallsByCaller: (req, res) => {
        try {
            const { callerId } = req.params;
            db.query(
                'SELECT * FROM Calls WHERE caller_id = ? ORDER BY created_at DESC',
                [callerId],
                (err, calls) => {
                    if (err) {
                        console.error('Error fetching calls:', err);
                        return res.status(500).json(responseFormatter(false, err.message));
                    }
                    res.json(responseFormatter(true, "Calls retrieved successfully", calls));
                }
            );
        } catch (error) {
            console.error('Error fetching calls:', error);
            res.status(500).json(responseFormatter(false, error.message));
        }
    },

    // Get all calls for a specific caller with filters
    getCallsByCallerId: (req, res) => {
        try {
            const callerId = req.user.id; // Get caller ID from authenticated user
            const { start_date, end_date, status, call_type } = req.query;

            let query = `
                SELECT c.*, l.name as lead_name 
                FROM Calls c
                LEFT JOIN Leads l ON c.lead_id = l.id
                WHERE c.caller_id = ?
            `;
            const params = [callerId];

            if (start_date && end_date) {
                query += ' AND c.created_at BETWEEN ? AND ?';
                params.push(start_date, end_date);
            }
            if (status) {
                query += ' AND c.status = ?';
                params.push(status);
            }
            if (call_type) {
                query += ' AND c.call_type = ?';
                params.push(call_type);
            }

            query += ' ORDER BY c.created_at DESC';

            db.query(query, params, (err, calls) => {
                if (err) {
                    console.error('Error fetching calls:', err);
                    return res.status(500).json(responseFormatter(false, err.message));
                }
                res.json(responseFormatter(true, "Calls retrieved successfully", calls));
            });
        } catch (error) {
            console.error('Error fetching calls:', error);
            res.status(500).json(responseFormatter(false, error.message));
        }
    },

    // Get performance metrics
    getPerformanceMetrics: (req, res) => {
        try {
            const { callerId } = req.params;
            db.query(`
                SELECT 
                    COUNT(*) as totalCalls,
                    AVG(duration) as averageCallDuration,
                    (COUNT(CASE WHEN status = 'Completed' THEN 1 END) * 100.0 / COUNT(*)) as successRate
                FROM Calls 
                WHERE caller_id = ?
                AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            `, [callerId], (err, metrics) => {
                if (err) {
                    console.error('Error fetching performance metrics:', err);
                    return res.status(500).json(responseFormatter(false, err.message));
                }
                res.json(responseFormatter(true, "Performance metrics retrieved successfully", {
                    totalCalls: metrics[0].totalCalls,
                    averageCallDuration: Math.round(metrics[0].averageCallDuration || 0),
                    successRate: Math.round(metrics[0].successRate || 0)
                }));
            });
        } catch (error) {
            console.error('Error fetching performance metrics:', error);
            res.status(500).json(responseFormatter(false, error.message));
        }
    },

    // Get daily stats
    getDailyStats: (req, res) => {
        try {
            const { callerId } = req.params;
            db.query(`
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as totalCalls,
                    COUNT(CASE WHEN status = 'Completed' THEN 1 END) as successfulCalls
                FROM Calls 
                WHERE caller_id = ?
                AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY DATE(created_at)
                ORDER BY date DESC
            `, [callerId], (err, stats) => {
                if (err) {
                    console.error('Error fetching daily stats:', err);
                    return res.status(500).json(responseFormatter(false, err.message));
                }
                res.json(responseFormatter(true, "Daily stats retrieved successfully", stats));
            });
        } catch (error) {
            console.error('Error fetching daily stats:', error);
            res.status(500).json(responseFormatter(false, error.message));
        }
    },

    // Get best calling hours
    getBestCallingHours: (req, res) => {
        try {
            const { callerId } = req.params;
            db.query(`
                SELECT 
                    HOUR(created_at) as hour,
                    COUNT(*) as totalCalls,
                    (COUNT(CASE WHEN status = 'Completed' THEN 1 END) * 100.0 / COUNT(*)) as successRate
                FROM Calls 
                WHERE caller_id = ?
                AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY HOUR(created_at)
                ORDER BY successRate DESC
            `, [callerId], (err, hours) => {
                if (err) {
                    console.error('Error fetching best hours:', err);
                    return res.status(500).json(responseFormatter(false, err.message));
                }

                const formattedHours = hours.map(h => ({
                    hour: h.hour,
                    totalCalls: h.totalCalls,
                    successRate: Math.round(h.successRate || 0)
                }));

                res.json(responseFormatter(true, "Best calling hours retrieved successfully", formattedHours));
            });
        } catch (error) {
            console.error('Error fetching best hours:', error);
            res.status(500).json(responseFormatter(false, error.message));
        }
    },

    // Get callback efficiency
    getCallbackEfficiency: (req, res) => {
        try {
            const { callerId } = req.params;
            db.query(`
                SELECT 
                    COUNT(*) as totalCallbacks,
                    COUNT(CASE WHEN status = 'Completed' THEN 1 END) as successfulCallbacks
                FROM Calls 
                WHERE caller_id = ?
                AND callback_datetime IS NOT NULL
                AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            `, [callerId], (err, efficiency) => {
                if (err) {
                    console.error('Error fetching callback efficiency:', err);
                    return res.status(500).json(responseFormatter(false, err.message));
                }

                const data = {
                    totalCallbacks: efficiency[0].totalCallbacks,
                    successfulCallbacks: efficiency[0].successfulCallbacks,
                    efficiency: efficiency[0].totalCallbacks > 0 
                        ? Math.round((efficiency[0].successfulCallbacks / efficiency[0].totalCallbacks) * 100)
                        : 0
                };

                res.json(responseFormatter(true, "Callback efficiency retrieved successfully", data));
            });
        } catch (error) {
            console.error('Error fetching callback efficiency:', error);
            res.status(500).json(responseFormatter(false, error.message));
        }
    },

    // Update a call record
    updateCall: (req, res) => {
        try {
            const { id } = req.params;
            const {
                end_time,
                duration,
                status,
                disposition,
                notes,
                recording_url,
                callback_scheduled
            } = req.body;

            const query = `
                UPDATE Calls 
                SET end_time = ?, 
                    duration = ?, 
                    status = ?,
                    disposition = ?, 
                    notes = ?, 
                    recording_url = ?,
                    callback_datetime = ?,
                    updated_at = NOW()
                WHERE id = ? AND caller_id = ?
            `;

            db.query(
                query,
                [
                    end_time, 
                    duration, 
                    status,
                    disposition, 
                    notes, 
                    recording_url,
                    callback_scheduled, 
                    id, 
                    req.user.id
                ],
                (err, result) => {
                    if (err) {
                        console.error('Error updating call record:', err);
                        return res.status(500).json(responseFormatter(false, 'Error updating call record', err.message));
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json(responseFormatter(false, 'Call record not found or unauthorized'));
                    }

                    res.json(responseFormatter(true, 'Call record updated successfully'));
                }
            );
        } catch (error) {
            console.error('Error updating call record:', error);
            res.status(500).json(responseFormatter(false, 'Error updating call record', error.message));
        }
    },

    // Get a specific call record
    getCallById: (req, res) => {
        try {
            const { id } = req.params;
            db.query(`
                SELECT c.*, u.name as caller_name, l.name as lead_name 
                FROM Calls c
                JOIN Users u ON c.caller_id = u.id
                JOIN Leads l ON c.lead_id = l.id
                WHERE c.id = ?
            `, [id], (err, calls) => {
                if (err) {
                    console.error('Error fetching call record:', err);
                    return res.status(500).json(responseFormatter(false, 'Error fetching call record', err.message));
                }

                if (calls.length === 0) {
                    return res.status(404).json(responseFormatter(false, 'Call record not found'));
                }

                res.json(responseFormatter(true, 'Call record retrieved successfully', calls[0]));
            });
        } catch (error) {
            console.error('Error fetching call record:', error);
            res.status(500).json(responseFormatter(false, 'Error fetching call record', error.message));
        }
    },

    // Get monthly caller statistics
    getMonthlyCallerStats: (req, res) => {
        try {
            const { callerId } = req.params;
            const { month, year } = req.query;

            let query = `
                SELECT * FROM monthly_caller_stats 
                WHERE caller_id = ?
            `;
            const params = [callerId];

            if (month && year) {
                query += ' AND call_month = ?';
                params.push(`${year}-${month.padStart(2, '0')}`);
            }

            query += ' ORDER BY call_month DESC';

            db.query(query, params, (err, stats) => {
                if (err) {
                    console.error('Error fetching monthly stats:', err);
                    return res.status(500).json(responseFormatter(false, 'Error fetching monthly stats', err.message));
                }
                res.json(responseFormatter(true, 'Monthly stats retrieved successfully', stats));
            });
        } catch (error) {
            console.error('Error fetching monthly stats:', error);
            res.status(500).json(responseFormatter(false, 'Error fetching monthly stats', error.message));
        }
    },

    // Get caller stats
    getCallerStats: (req, res) => {
        try {
            const { callerId } = req.params;
            const { start_date, end_date } = req.query;

            const query = `
                SELECT 
                    COUNT(*) as total_calls,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_calls,
                    COUNT(CASE WHEN status IN ('missed', 'no-answer') THEN 1 END) as missed_calls,
                    COUNT(CASE WHEN disposition = 'interested' THEN 1 END) as interested_leads,
                    COUNT(CASE WHEN call_type = 'follow-up' THEN 1 END) as total_callbacks,
                    ROUND(AVG(duration)/60, 2) as avg_call_duration_minutes,
                    ROUND(SUM(duration)/3600, 2) as total_hours
                FROM Calls 
                WHERE caller_id = ?
                ${start_date && end_date ? 'AND created_at BETWEEN ? AND ?' : ''}
            `;

            const params = [callerId];
            if (start_date && end_date) {
                params.push(start_date, end_date);
            }

            db.query(query, params, (err, stats) => {
                if (err) {
                    console.error('Error fetching caller stats:', err);
                    return res.status(500).json(responseFormatter(false, err.message));
                }
                res.json(responseFormatter(true, "Caller stats retrieved successfully", stats[0]));
            });
        } catch (error) {
            console.error('Error fetching caller stats:', error);
            res.status(500).json(responseFormatter(false, error.message));
        }
    },

    // Get call statistics
    getCallStats: async (req, res) => {
        try {
            const { timeRange } = req.params;
            let startDate = new Date();
            
            // Set the start date based on timeRange
            switch (timeRange) {
                case 'today':
                    startDate.setHours(0,0,0,0);
                    break;
                case 'week':
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(startDate.getMonth() - 1);
                    break;
                case 'year':
                    startDate.setFullYear(startDate.getFullYear() - 1);
                    break;
                default:
                    startDate.setDate(startDate.getDate() - 7); // Default to last 7 days
            }

            const [results] = await db.promise().query(
                `SELECT 
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                    COUNT(CASE WHEN status = 'missed' THEN 1 END) as missed,
                    COUNT(CASE WHEN disposition = 'interested' THEN 1 END) as interested,
                    COUNT(CASE WHEN disposition = 'not_interested' THEN 1 END) as notInterested,
                    COUNT(CASE WHEN disposition = 'callback' THEN 1 END) as callback
                FROM Calls 
                WHERE created_at >= ?`,
                [startDate]
            );

            res.json({
                success: true,
                data: results[0] || {
                    completed: 0,
                    missed: 0,
                    interested: 0,
                    notInterested: 0,
                    callback: 0
                }
            });
        } catch (error) {
            console.error('Error fetching call statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch call statistics',
                error: error.message
            });
        }
    },
};

module.exports = CallController;