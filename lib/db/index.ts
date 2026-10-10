import { turso } from '@/lib/turso';
import fs from 'fs';
import path from 'path';

// Generate a random UUID-like ID
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Run all schema migrations on startup
export async function runMigrations() {
  try {
    const schemaPath = path.join(process.cwd(), 'lib', 'db', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    // Clean SQL: remove line comments (-- ...) and block comments (/* ... */)
    const cleanedSql = schemaSql
      .replace(/--.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');

    const statements = cleanedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      await turso.execute(stmt);
    }

    console.log('[DB] Migrations applied successfully');
  } catch (err) {
    console.error('[DB] Migration error:', err);
    throw err;
  }
}

// Ensure default workspace exists
export async function ensureDefaultWorkspace(): Promise<string> {
  const wsId = 'ws-default';
  const existing = await turso.execute({
    sql: 'SELECT id FROM workspaces WHERE id = ?',
    args: [wsId],
  });

  if (existing.rows.length === 0) {
    await turso.execute({
      sql: 'INSERT INTO workspaces (id, name) VALUES (?, ?)',
      args: [wsId, 'Default Workspace'],
    });
  }
  return wsId;
}

// Ensure default demo user exists
export async function ensureDefaultUser(): Promise<string> {
  const userId = 'user-demo';
  const existing = await turso.execute({
    sql: 'SELECT id FROM users WHERE id = ?',
    args: [userId],
  });

  if (existing.rows.length === 0) {
    await turso.execute({
      sql: 'INSERT INTO users (id, email, name, role, company) VALUES (?, ?, ?, ?, ?)',
      args: [userId, 'admin@bracoomnipulse.com', 'Demo Admin', 'Admin', 'Braco Corp'],
    });

    await turso.execute({
      sql: 'INSERT OR IGNORE INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)',
      args: ['ws-default', userId, 'Admin'],
    });
  }
  return userId;
}

// Initialize DB on first access
let initialized = false;
export async function initializeDatabase() {
  if (initialized) return;

  await runMigrations();
  await ensureDefaultWorkspace();
  await ensureDefaultUser();

  try {
    const existingCamp = await turso.execute("SELECT id FROM campaigns LIMIT 1");
    if (existingCamp.rows.length === 0) {
      const { seedDemoCampaign } = await import('@/lib/db/seedDemo');
      await seedDemoCampaign('festive_snack');
      console.log('[DB] Pre-seeded Demo 1 campaign for instant evaluation');
    }
  } catch (err) {
    console.warn('[DB] Pre-seed check skipped:', err);
  }

  initialized = true;
  console.log('[DB] Database initialized');
}
