const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db       = require('../config/db');

const router = express.Router();

// ─── Helper ───────────────────────────────────────────────────
const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ══════════════════════════════════════════════════════════════
// POST /api/auth/register
// ══════════════════════════════════════════════════════════════
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('phone')
      .matches(/^\d{10}$/)
      .withMessage('Phone must be exactly 10 digits'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) throw new Error('Passwords do not match');
      return true;
    }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, password, address } = req.body;

    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const [rows] = await db.execute(
        'CALL RegisterUser(?, ?, ?, ?, ?)',
        [name, email, phone, passwordHash, address || null]
      );
      const user_id = rows[0]?.[0]?.user_id || rows[0]?.user_id;
      return res.status(201).json({ message: 'Registered successfully', user_id });
    } catch (err) {
      if (err.message?.includes('Email already registered')) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      next(err);
    }
  }
);

// ══════════════════════════════════════════════════════════════
// POST /api/auth/login
// ══════════════════════════════════════════════════════════════
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const [users] = await db.execute(
        'SELECT user_id, name, email, phone, password_hash FROM Users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = users[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = signToken({ user_id: user.user_id, email: user.email, role: 'user' });
      return res.json({
        token,
        user: { user_id: user.user_id, name: user.name, email: user.email, phone: user.phone },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ══════════════════════════════════════════════════════════════
// POST /api/auth/vigilance/login  — Officer / Admin login
// ══════════════════════════════════════════════════════════════
router.post(
  '/vigilance/login',
  [
    body('badge_no').notEmpty().withMessage('Badge number is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { badge_no, password } = req.body;

    try {
      const [officers] = await db.execute(
        'SELECT officer_id, name, badge_no, department, password_hash, is_active FROM Officers WHERE badge_no = ?',
        [badge_no]
      );

      if (officers.length === 0) {
        return res.status(401).json({ error: 'Invalid badge number or password' });
      }

      const officer = officers[0];

      if (!officer.is_active) {
        return res.status(403).json({ error: 'This officer account is inactive' });
      }

      // If officer has no password_hash yet (seed data), use default
      if (!officer.password_hash) {
        return res.status(401).json({ error: 'Officer account not fully set up. Contact admin.' });
      }

      const match = await bcrypt.compare(password, officer.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Invalid badge number or password' });
      }

      const token = signToken({
        user_id:    officer.officer_id,
        badge_no:   officer.badge_no,
        role:       'officer',
      });

      return res.json({
        token,
        officer: {
          officer_id: officer.officer_id,
          name:       officer.name,
          badge_no:   officer.badge_no,
          department: officer.department,
          role:       'officer',
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
