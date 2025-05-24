const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Endpoint for caller performance metrics
router.get('/:caller_id', (req, res) => {
  const { caller_id } = req.params;
  const query = `
    SELECT 
      caller_id, caller_name, daily_call_target, monthly_call_target, 
      target_daily_hours, target_monthly_hours, today_calls, today_hours, 
      month_calls 
    FROM caller_performance_metrics 
    WHERE caller_id = ?
  `;
  db.query(query, [caller_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Caller not found" });
    const row = results[0];
    res.json({
      data: {
        id: row.caller_id,
        name: row.caller_name,
        daily_call_target: row.daily_call_target,
        monthly_call_target: row.monthly_call_target,
        target_daily_hours: row.target_daily_hours,
        target_monthly_hours: row.target_monthly_hours,
        today_calls: row.today_calls,
        today_hours: row.today_hours,
        month_calls: row.month_calls
      }
    });
  });
});

// You can add the leads endpoint here as well if needed

module.exports = router;