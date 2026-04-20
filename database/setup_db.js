/**
 * WEARMS — Database Setup Script
 * Imports all SQL files in the correct order using Node.js (no MySQL CLI needed).
 *
 * Usage:
 *   cd c:\Users\Piyush\Desktop\DIS-mini-project\backend
 *   node ../database/setup_db.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');

const SQL_DIR = path.join(__dirname);
const FILES   = [
  'schema.sql',
  'triggers.sql',
  'procedures.sql',
  'functions.sql',
];

async function runSQL(conn, filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');

  // Split on DELIMITER changes to handle stored procedures/triggers
  // Strategy: replace custom DELIMITER blocks, then split on ;
  let content = raw;

  // Remove Windows line endings
  content = content.replace(/\r\n/g, '\n');

  // Handle DELIMITER // ... DELIMITER ; blocks
  const delimiterRegex = /DELIMITER\s+\/\/([\s\S]*?)DELIMITER\s+;/g;
  const routines = [];
  content = content.replace(delimiterRegex, (_, body) => {
    // Split on // and collect individual routine definitions
    body.split('//').forEach(chunk => {
      const trimmed = chunk.trim();
      if (trimmed.length > 0) routines.push(trimmed);
    });
    return ''; // Remove from main content
  });

  // Split remaining content on semicolons (regular statements)
  const statements = content
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  // Run regular statements
  for (const stmt of statements) {
    try {
      await conn.query(stmt);
    } catch (err) {
      // Ignore "already exists" type warnings
      if (!['ER_TABLE_EXISTS_ERROR', 'ER_DUP_ENTRY'].includes(err.code)) {
        console.warn(`  ⚠  ${err.message.slice(0, 100)}`);
      }
    }
  }

  // Run routine definitions (procedures, triggers, functions)
  for (const routine of routines) {
    if (!routine.trim()) continue;
    try {
      await conn.query(routine);
    } catch (err) {
      console.warn(`  ⚠  Routine error: ${err.message.slice(0, 120)}`);
    }
  }
}

async function main() {
  console.log('🔌 Connecting to MySQL...');
  const conn = await mysql.createConnection({
    host:               process.env.DB_HOST     || 'localhost',
    user:               process.env.DB_USER     || 'root',
    password:           process.env.DB_PASSWORD || '',
    port:               parseInt(process.env.DB_PORT || '3306', 10),
    multipleStatements: true,
  });
  console.log('✅ Connected!\n');

  for (const file of FILES) {
    const filePath = path.join(SQL_DIR, file);
    console.log(`📄 Running ${file}…`);
    await runSQL(conn, filePath);
    console.log(`   ✔  Done\n`);
  }

  await conn.end();
  console.log('🎉 Database setup complete! wearms_db is ready.');
  console.log('\nNext step — seed officer passwords:');
  console.log('  node ../database/seed_officers.js\n');
}

main().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
