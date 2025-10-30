import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export function getDatabase(dbFilePath) {
  const dir = path.dirname(dbFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(dbFilePath);
  db.pragma('journal_mode = WAL');

  db.prepare(`
    CREATE TABLE IF NOT EXISTS signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      signup_date TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `).run();

  db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_signups_date_name
    ON signups (signup_date, name);
  `).run();

  // Settings table for simple key-value configuration (e.g., passcode)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `).run();

  // Ensure default passcode exists
  const existingPass = db
    .prepare('SELECT value FROM settings WHERE key = ?')
    .get('passcode');
  if (!existingPass) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
      .run('passcode', '0000');
  }

  return db;
}


