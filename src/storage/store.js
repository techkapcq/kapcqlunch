import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const useKV = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// Key helpers for KV
function keySignups(dateStr) {
  return `signups:${dateStr}`;
}
const keyPasscode = 'settings:passcode';

// Lazy-loaded backends to avoid bundling native modules on Vercel
let kvClient = null;
let sqliteDb = null;

async function ensureBackend() {
  if (useKV) {
    if (!kvClient) {
      const mod = await import('@vercel/kv');
      kvClient = mod.kv;
    }
    return { kind: 'kv' };
  }
  if (!sqliteDb) {
    const mod = await import('./db.js');
    sqliteDb = mod.getDatabase(path.join(__dirname, '..', '..', 'storage', 'data.db'));
  }
  return { kind: 'sqlite' };
}

export async function getSignups(dateStr) {
  const b = await ensureBackend();
  if (b.kind === 'kv') {
    const members = await kvClient.smembers(keySignups(dateStr));
    return members.map(name => ({ name, created_at: null }));
  }
  const rows = sqliteDb
    .prepare('SELECT name, created_at FROM signups WHERE signup_date = ? ORDER BY created_at ASC')
    .all(dateStr);
  return rows;
}

export async function addSignup(dateStr, name, createdAtIso) {
  const b = await ensureBackend();
  if (b.kind === 'kv') {
    await kvClient.sadd(keySignups(dateStr), name);
    return;
  }
  const existing = sqliteDb
    .prepare('SELECT id FROM signups WHERE signup_date = ? AND LOWER(name) = LOWER(?)')
    .get(dateStr, name);
  if (!existing) {
    sqliteDb
      .prepare('INSERT INTO signups (signup_date, name, created_at) VALUES (?, ?, ?)')
      .run(dateStr, name, createdAtIso);
  }
}

export async function removeSignup(dateStr, name) {
  const b = await ensureBackend();
  if (b.kind === 'kv') {
    await kvClient.srem(keySignups(dateStr), name);
    return;
  }
  sqliteDb
    .prepare('DELETE FROM signups WHERE signup_date = ? AND LOWER(name) = LOWER(?)')
    .run(dateStr, name);
}

export async function getPasscode() {
  const b = await ensureBackend();
  if (b.kind === 'kv') {
    const val = await kvClient.get(keyPasscode);
    return val || '0000';
  }
  const row = sqliteDb.prepare('SELECT value FROM settings WHERE key = ?').get('passcode');
  return row ? String(row.value) : '0000';
}

export async function setPasscode(next) {
  const b = await ensureBackend();
  if (b.kind === 'kv') {
    await kvClient.set(keyPasscode, next);
    return;
  }
  sqliteDb
    .prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .run('passcode', next);
}


