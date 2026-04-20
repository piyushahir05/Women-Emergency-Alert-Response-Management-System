const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');
require('dotenv').config();

const SQL_DIR = path.join(__dirname, '..', 'database');
const FILES   = [
  'functions.sql',
  'triggers.sql',
  'procedures.sql'
];

async function runSQL(conn, filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  let content = raw.replace(/\r\n/g, '\n');

  // Handle DELIMITER blocks
  const delimiterRegex = /DELIMITER\s+\/\/([\s\S]*?)DELIMITER\s+;/g;
  const routines = [];
  content = content.replace(delimiterRegex, (_, body) => {
    body.split('//').forEach(chunk => {
      const trimmed = chunk.trim();
      if (trimmed.length > 0) routines.push(trimmed);
    });
    return '';
  });

  const statements = content
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const stmt of statements) {
    try { await conn.query(stmt); } catch (err) {
      if (err.code !== 'ER_DUP_ENTRY') console.warn(`  ⚠  ${err.message.slice(0, 100)}`);
    }
  }

  for (const routine of routines) {
    if (!routine.trim()) continue;
    try { await conn.query(routine); } catch (err) {
      console.warn(`  ⚠  Routine error: ${err.message.slice(0, 120)}`);
    }
  }
}

async function main() {
  console.log('🔌 Connecting to MySQL...');
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:     parseInt(process.env.DB_PORT || '3306', 10),
    multipleStatements: true,
  });
  console.log('✅ Connected!\n');

  for (const file of FILES) {
    console.log(`📄 Running ${file}…`);
    await runSQL(conn, path.join(SQL_DIR, file));
    console.log(`   ✔  Done\n`);
  }

  await conn.end();
  console.log('🎉 Functions and Triggers imported!');
}

main().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
