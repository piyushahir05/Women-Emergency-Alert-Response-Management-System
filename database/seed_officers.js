/**
 * WEARMS — Officer Password Seeder
 * Run AFTER schema.sql is imported and backend/.env is configured.
 *
 * Usage:
 *   cd backend
 *   node ../database/seed_officers.js
 */

require('dotenv').config({ path: '../backend/.env' });
const mysql  = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const DEFAULT_PASSWORD = 'Vigilance@123';

const OFFICERS = [
  { badge_no: 'OFF-001', name: 'Inspector Priya Sharma' },
  { badge_no: 'OFF-002', name: 'Sub-Inspector Rekha Nair' },
  { badge_no: 'OFF-003', name: 'Inspector Anita Gupta' },
  { badge_no: 'OFF-004', name: 'Officer Sunita Rao' },
];

async function seed() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'wearms_db',
    port:     parseInt(process.env.DB_PORT || '3306', 10),
  });

  console.log('✅ Connected to MySQL\n');
  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  console.log(`🔐 bcrypt hash for "${DEFAULT_PASSWORD}":\n   ${hash}\n`);

  for (const o of OFFICERS) {
    await conn.execute(
      'UPDATE Officers SET password_hash = ? WHERE badge_no = ?',
      [hash, o.badge_no]
    );
    console.log(`   ✔  ${o.badge_no} — ${o.name}`);
  }

  await conn.end();
  console.log(`\n🎉 Done! All officers can now log in with password: ${DEFAULT_PASSWORD}`);
  console.log('   Vigilance Login URL: http://localhost:5173/vigilance/login');
}

seed().catch(err => {
  console.error('❌ Seeder failed:', err.message);
  process.exit(1);
});
