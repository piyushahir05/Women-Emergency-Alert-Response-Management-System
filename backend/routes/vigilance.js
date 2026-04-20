const express = require('express');
const bcrypt  = require('bcryptjs');
const { body, param, validationResult } = require('express-validator');
const db      = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// All vigilance routes require JWT + officer/admin role
router.use(verifyToken);
router.use(requireRole('officer', 'admin'));

// ══════════════════════════════════════════════════════════════
// CASE LISTING ENDPOINTS
// ══════════════════════════════════════════════════════════════

const caseListQuery = `
  SELECT
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
    u.user_id,
    u.name   AS user_name,
    u.phone  AS user_phone,
    u.email  AS user_email,
    o.name   AS officer_name,
    o.badge_no,
    o.phone  AS officer_phone,
    a.assigned_at
  FROM Cases c
  JOIN SOS_Alerts s   ON c.alert_id   = s.alert_id
  JOIN Users u        ON s.user_id    = u.user_id
  LEFT JOIN Assignments a  ON c.case_id = a.case_id AND a.is_active = TRUE
  LEFT JOIN Officers o     ON a.officer_id = o.officer_id
`;

// GET /api/vigilance/cases/new
router.get('/cases/new', async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      caseListQuery + " WHERE c.status = 'New' ORDER BY c.created_at ASC"
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/vigilance/cases/pending
router.get('/cases/pending', async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      caseListQuery + " WHERE c.status IN ('New','Assigned','In Progress') ORDER BY FIELD(c.priority,'Critical','High','Medium','Low'), c.created_at ASC"
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/vigilance/cases/resolved
router.get('/cases/resolved', async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      caseListQuery + " WHERE c.status = 'Resolved' ORDER BY c.updated_at DESC"
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/vigilance/cases/closed
router.get('/cases/closed', async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      caseListQuery + " WHERE c.status = 'Closed' ORDER BY c.updated_at DESC"
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/vigilance/cases/:id  — Full case detail
router.get('/cases/:id', async (req, res, next) => {
  try {
    const [cases] = await db.execute(
      caseListQuery + ' WHERE c.case_id = ?',
      [req.params.id]
    );
    if (cases.length === 0) return res.status(404).json({ error: 'Case not found' });

    const [history] = await db.execute(
      'SELECT * FROM Case_Status_History WHERE case_id = ? ORDER BY changed_at ASC',
      [req.params.id]
    );

    const [assignments] = await db.execute(
      `SELECT a.*, o.name AS officer_name, o.badge_no, o.department
       FROM Assignments a
       JOIN Officers o ON a.officer_id = o.officer_id
       WHERE a.case_id = ?
       ORDER BY a.assigned_at DESC`,
      [req.params.id]
    );

    res.json({ ...cases[0], history, assignments });
  } catch (err) { next(err); }
});

// ══════════════════════════════════════════════════════════════
// POST /api/vigilance/cases/:id/assign
// ══════════════════════════════════════════════════════════════
router.post(
  '/cases/:id/assign',
  [
    param('id').isInt().withMessage('Invalid case ID'),
    body('officer_id').isInt().withMessage('Officer ID is required'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { officer_id } = req.body;
    const assigned_by = req.user.badge_no || `Officer #${req.user.user_id}`;

    try {
      await db.execute(
        'CALL AssignOfficerToCase(?, ?, ?)',
        [req.params.id, officer_id, assigned_by]
      );
      // Return updated case
      const [cases] = await db.execute(
        caseListQuery + ' WHERE c.case_id = ?',
        [req.params.id]
      );
      res.json({ message: 'Officer assigned successfully', case: cases[0] });
    } catch (err) {
      if (err.message?.includes('cannot be assigned')) {
        return res.status(400).json({ error: err.message });
      }
      next(err);
    }
  }
);

// ══════════════════════════════════════════════════════════════
// PUT /api/vigilance/cases/:id/status
// ══════════════════════════════════════════════════════════════
router.put(
  '/cases/:id/status',
  [
    param('id').isInt().withMessage('Invalid case ID'),
    body('new_status')
      .isIn(['New','Assigned','In Progress','Resolved','Closed'])
      .withMessage('Invalid status'),
    body('remarks').optional().trim(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { new_status, remarks } = req.body;
    const changed_by = req.user.badge_no || `Officer #${req.user.user_id}`;

    try {
      await db.execute(
        'CALL UpdateCaseStatus(?, ?, ?, ?)',
        [req.params.id, new_status, changed_by, remarks || null]
      );
      res.json({ success: true, new_status, case_id: parseInt(req.params.id) });
    } catch (err) {
      if (err.message?.includes('Case not found') || err.message?.includes('Invalid status')) {
        return res.status(400).json({ error: err.message });
      }
      next(err);
    }
  }
);

// ══════════════════════════════════════════════════════════════
// OFFICER ROUTES
// ══════════════════════════════════════════════════════════════

// GET /api/vigilance/officers
router.get('/officers', async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT officer_id, name, badge_no, department, phone, is_active, created_at
       FROM Officers WHERE is_active = TRUE ORDER BY name ASC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/vigilance/officers/all  — all officers including inactive
router.get('/officers/all', async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT officer_id, name, badge_no, department, phone, is_active, created_at
       FROM Officers ORDER BY name ASC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/vigilance/officers/:id/workload
router.get('/officers/:id/workload', async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT c.status, COUNT(*) AS count
       FROM Assignments a
       JOIN Cases c ON a.case_id = c.case_id
       WHERE a.officer_id = ?
       GROUP BY c.status`,
      [req.params.id]
    );
    const [total] = await db.execute(
      'SELECT GetTotalCasesByOfficer(?) AS total_cases',
      [req.params.id]
    );
    res.json({ workload: rows, total_cases: total[0]?.total_cases || 0 });
  } catch (err) { next(err); }
});

// POST /api/vigilance/officers  — Add new officer (admin only)
router.post(
  '/officers',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('badge_no').trim().notEmpty().withMessage('Badge number is required'),
    body('department').optional().trim(),
    body('phone').optional().matches(/^\d{10}$/).withMessage('Phone must be 10 digits'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, badge_no, department, phone, password } = req.body;
    try {
      const password_hash = await bcrypt.hash(password, 10);
      const [result] = await db.execute(
        'INSERT INTO Officers (name, badge_no, department, phone, password_hash) VALUES (?,?,?,?,?)',
        [name, badge_no, department || null, phone || null, password_hash]
      );
      res.status(201).json({ message: 'Officer created', officer_id: result.insertId });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Badge number already exists' });
      }
      next(err);
    }
  }
);

// PUT /api/vigilance/officers/:id/toggle  — Toggle active/inactive
router.put('/officers/:id/toggle', async (req, res, next) => {
  try {
    await db.execute(
      'UPDATE Officers SET is_active = NOT is_active WHERE officer_id = ?',
      [req.params.id]
    );
    const [rows] = await db.execute(
      'SELECT officer_id, name, is_active FROM Officers WHERE officer_id = ?',
      [req.params.id]
    );
    res.json(rows[0] || { error: 'Officer not found' });
  } catch (err) { next(err); }
});

// ══════════════════════════════════════════════════════════════
// REPORTS
// ══════════════════════════════════════════════════════════════

// GET /api/vigilance/reports/summary
router.get('/reports/summary', async (req, res, next) => {
  try {
    const [[todayAlerts]] = await db.execute(
      "SELECT COUNT(*) AS total FROM SOS_Alerts WHERE DATE(triggered_at) = CURDATE()"
    );
    const [[activeCases]] = await db.execute(
      'SELECT GetActiveCasesCount() AS active_cases'
    );
    const [[resolved]] = await db.execute(
      "SELECT GetCasesByStatus('Resolved') AS resolved_cases"
    );
    const [[closed]] = await db.execute(
      "SELECT GetCasesByStatus('Closed') AS closed_cases"
    );
    const [[avgResponse]] = await db.execute(
      'SELECT GetAverageResponseTime() AS avg_response_minutes'
    );
    const [[pending]] = await db.execute(
      "SELECT COUNT(*) AS pending FROM Cases WHERE status IN ('New','Assigned','In Progress')"
    );

    res.json({
      total_alerts_today:         todayAlerts.total,
      active_cases:               activeCases.active_cases,
      pending_cases:              pending.pending,
      resolved_cases:             resolved.resolved_cases,
      closed_cases:               closed.closed_cases,
      avg_response_time_minutes:  avgResponse.avg_response_minutes,
    });
  } catch (err) { next(err); }
});

// GET /api/vigilance/reports/by-day
router.get('/reports/by-day', async (req, res, next) => {
  try {
    const [rows] = await db.execute('CALL RPT_AlertsPerDay()');
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// GET /api/vigilance/reports/by-officer
router.get('/reports/by-officer', async (req, res, next) => {
  try {
    const [rows] = await db.execute('CALL RPT_CasesPerOfficer()');
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// GET /api/vigilance/reports/status-count
router.get('/reports/status-count', async (req, res, next) => {
  try {
    const [rows] = await db.execute('CALL RPT_StatusCount()');
    res.json(rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
