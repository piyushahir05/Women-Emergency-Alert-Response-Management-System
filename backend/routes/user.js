const express = require('express');
const { body, param, validationResult } = require('express-validator');
const db      = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All user routes require JWT
router.use(verifyToken);

// ══════════════════════════════════════════════════════════════
// GET /api/user/profile
// ══════════════════════════════════════════════════════════════
router.get('/profile', async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT user_id, name, email, phone, address, created_at FROM Users WHERE user_id = ?',
      [req.user.user_id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════
// PUT /api/user/updateProfile
// ══════════════════════════════════════════════════════════════
router.put(
  '/updateProfile',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().matches(/^\d{10}$/).withMessage('Phone must be 10 digits'),
    body('address').optional().trim(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, phone, address } = req.body;
    try {
      await db.execute(
        `UPDATE Users
         SET name    = COALESCE(?, name),
             phone   = COALESCE(?, phone),
             address = COALESCE(?, address)
         WHERE user_id = ?`,
        [name || null, phone || null, address || null, req.user.user_id]
      );
      res.json({ message: 'Profile updated successfully' });
    } catch (err) {
      next(err);
    }
  }
);

// ══════════════════════════════════════════════════════════════
// GET /api/user/contacts
// ══════════════════════════════════════════════════════════════
router.get('/contacts', async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT contact_id, name, phone, relation, created_at FROM Emergency_Contacts WHERE user_id = ? ORDER BY created_at ASC',
      [req.user.user_id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════
// POST /api/user/addContact
// ══════════════════════════════════════════════════════════════
router.post(
  '/addContact',
  [
    body('name').trim().notEmpty().withMessage('Contact name is required'),
    body('phone').matches(/^\d{10}$/).withMessage('Phone must be 10 digits'),
    body('relation').optional().trim(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, phone, relation } = req.body;
    try {
      const [rows] = await db.execute(
        'CALL AddEmergencyContact(?, ?, ?, ?)',
        [req.user.user_id, name, phone, relation || null]
      );
      const contact_id = rows[0]?.[0]?.contact_id;
      res.status(201).json({ message: 'Emergency contact added', contact_id });
    } catch (err) {
      if (err.message?.includes('Max 5')) {
        return res.status(400).json({ error: 'Max 5 emergency contacts allowed per user' });
      }
      next(err);
    }
  }
);

// ══════════════════════════════════════════════════════════════
// DELETE /api/user/contacts/:contact_id
// ══════════════════════════════════════════════════════════════
router.delete(
  '/contacts/:contact_id',
  [param('contact_id').isInt().withMessage('Invalid contact ID')],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const [result] = await db.execute(
        'DELETE FROM Emergency_Contacts WHERE contact_id = ? AND user_id = ?',
        [req.params.contact_id, req.user.user_id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Contact not found or not yours to delete' });
      }
      res.json({ message: 'Contact deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
