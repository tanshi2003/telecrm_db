const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Backward-compatible endpoints used by the legacy caller leaderboard page.
router.get('/:caller_id', (req, res) => {
  const callerId = Number(req.params.caller_id);
  if (!Number.isInteger(callerId) || callerId <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid caller ID' });
  }

  db.query(
    `SELECT * FROM monthly_caller_stats
     WHERE caller_id = ? AND call_month = DATE_FORMAT(CURRENT_DATE(), '%Y-%m')
     LIMIT 1`,
    [callerId],
    (err, rows) => {
      if (err) {
        console.error('monthly_caller_stats query failed:', err.code, err.message);
        return res.status(500).json({ success: false, message: 'Unable to fetch caller stats' });
      }
      if (!rows.length) {
        return res.json({
          success: true,
          data: {
            caller_id: callerId,
            caller_name: null,
            total_calls: 0,
            completed_calls: 0,
            missed_calls: 0,
            total_hours: 0,
            completion_rate: 0,
            interested_leads: 0,
            conversion_rate: 0,
            avg_call_duration_minutes: 0
          }
        });
      }
      return res.json({ success: true, data: rows[0] });
    }
  );
});

router.get('/:caller_id/leads', (req, res) => {
  const callerId = Number(req.params.caller_id);
  if (!Number.isInteger(callerId) || callerId <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid caller ID' });
  }

  db.query(
    `SELECT id, name, status,
      CASE
        WHEN status IN ('New', 'Contacted', 'Follow-Up Scheduled', 'Under Review', 'Not Reachable', 'On Hold') THEN 'Fresh'
        WHEN status = 'Call Back Later' THEN 'Call Later'
        WHEN status = 'Interested' THEN 'Interested'
        WHEN status = 'Converted' THEN 'Won'
        WHEN status = 'Lost' THEN 'Lost'
        WHEN status = 'Not Interested' THEN 'Not Interested'
        ELSE status
      END AS lead_stage
     FROM leads
     WHERE assigned_to = ?
     ORDER BY created_at DESC`,
    [callerId],
    (err, rows) => {
      if (err) {
        console.error('monthly caller leads query failed:', err.code, err.message);
        return res.status(500).json({ success: false, message: 'Unable to fetch caller leads' });
      }
      return res.json({ success: true, data: rows || [] });
    }
  );
});

module.exports = router;
