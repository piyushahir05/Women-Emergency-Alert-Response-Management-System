const express = require('express');
const { body, validationResult } = require('express-validator');
const db      = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All SOS routes require JWT
router.use(verifyToken);

// ══════════════════════════════════════════════════════════════
// POST /api/sos/triggerSOS
// ══════════════════════════════════════════════════════════════
router.post(
  '/triggerSOS',
  [
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    body('location_description').optional().trim(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { latitude, longitude, location_description } = req.body;

    try {
      const [rows] = await db.execute(
        'CALL CreateSOSAlert(?, ?, ?, ?)',
        [req.user.user_id, latitude, longitude, location_description || null]
      );
      const result = rows[0]?.[0];
      return res.status(201).json({
        message:  'SOS triggered. Help is on the way.',
        alert_id: result?.alert_id,
        case_id:  result?.case_id,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ══════════════════════════════════════════════════════════════
// GET /api/sos/caseStatus
// Returns all cases for the logged-in user (with officer info)
// ══════════════════════════════════════════════════════════════
router.get('/caseStatus', async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT
         c.case_id,
         c.status,
         c.priority,
         c.notes,
         c.created_at,
         c.updated_at,
         s.alert_id,
         s.latitude,
         s.longitude,
         s.location_description,
         s.triggered_at,
         o.name   AS officer_name,
         o.phone  AS officer_phone,
         o.badge_no AS officer_badge
       FROM Cases c
       JOIN SOS_Alerts s
         ON c.alert_id = s.alert_id
       LEFT JOIN Assignments a
         ON c.case_id = a.case_id AND a.is_active = TRUE
       LEFT JOIN Officers o
         ON a.officer_id = o.officer_id
       WHERE s.user_id = ?
       ORDER BY c.created_at DESC`,
      [req.user.user_id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════
// GET /api/sos/caseStatus/:case_id/history
// Returns full status history for a specific case
// ══════════════════════════════════════════════════════════════
router.get('/caseStatus/:case_id/history', async (req, res, next) => {
  try {
    // Ensure case belongs to this user
    const [caseCheck] = await db.execute(
      `SELECT c.case_id FROM Cases c
       JOIN SOS_Alerts s ON c.alert_id = s.alert_id
       WHERE c.case_id = ? AND s.user_id = ?`,
      [req.params.case_id, req.user.user_id]
    );
    if (caseCheck.length === 0) {
      return res.status(404).json({ error: 'Case not found or access denied' });
    }

    const [rows] = await db.execute(
      `SELECT history_id, old_status, new_status, changed_at, changed_by, remarks
       FROM Case_Status_History
       WHERE case_id = ?
       ORDER BY changed_at ASC`,
      [req.params.case_id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════
// GET /api/sos/alertHistory
// Returns all SOS alerts for the logged-in user
// ══════════════════════════════════════════════════════════════
router.get('/alertHistory', async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT
         alert_id,
         latitude,
         longitude,
         location_description,
         status,
         triggered_at
       FROM SOS_Alerts
       WHERE user_id = ?
       ORDER BY triggered_at DESC`,
      [req.user.user_id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;


// ══════════════════════════════════════════════════════════════
// GET /api/sos/dashboardStats
// Returns dashboard stats for logged-in user
// ══════════════════════════════════════════════════════════════
router.get('/dashboardStats', async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const [[totalAlerts]] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM SOS_Alerts
       WHERE user_id = ?`,
      [userId]
    );

    const [[activeCases]] = await db.execute(
      `SELECT COUNT(*) AS active
       FROM Cases c
       JOIN SOS_Alerts s ON c.alert_id = s.alert_id
       WHERE s.user_id = ?
       AND c.status IN ('New','Assigned','In Progress')`,
      [userId]
    );

    const [[resolvedCases]] = await db.execute(
      `SELECT COUNT(*) AS resolved
       FROM Cases c
       JOIN SOS_Alerts s ON c.alert_id = s.alert_id
       WHERE s.user_id = ?
       AND c.status = 'Resolved'`,
      [userId]
    );

    res.json({
      totalAlerts: totalAlerts.total,
      activeCases: activeCases.active,
      resolvedCases: resolvedCases.resolved
    });

  } catch (err) {
    next(err);
  }
});