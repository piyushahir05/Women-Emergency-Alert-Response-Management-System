-- ============================================================
-- WEARMS — Officer Password Seed Script
-- Run this AFTER schema.sql to set passwords for seeded officers
-- Default password for all: Vigilance@123
-- bcrypt hash (saltRounds=10) for "Vigilance@123":
-- ============================================================

USE wearms_db;

-- You can generate a fresh hash with Node.js:
--   node -e "const b=require('bcryptjs'); b.hash('Vigilance@123',10).then(console.log)"
-- Then paste the output below.

-- Placeholder: run the Node.js helper instead (see setup_officers.js)
-- UPDATE Officers SET password_hash = '<your_bcrypt_hash>' WHERE badge_no = 'OFF-001';
