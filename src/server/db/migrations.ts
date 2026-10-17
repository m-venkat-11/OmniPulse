import { db } from "./client";
import fs from "fs";
import path from "path";

/**
 * Splits SQL schema into executable statements, preserving SQLite trigger blocks
 */
export function parseSqlStatements(rawSql: string): string[] {
  // Strip line comments
  const lines = rawSql.split("\n");
  const strippedLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("--")) continue;
    strippedLines.push(line);
  }

  const sql = strippedLines.join("\n");
  const statements: string[] = [];
  let current = "";
  let insideTrigger = false;

  const tokens = sql.split(/(\bCREATE\s+TRIGGER\b|\bEND\s*;|;)/i);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;

    if (/CREATE\s+TRIGGER/i.test(token)) {
      insideTrigger = true;
      current += token;
    } else if (insideTrigger && /END\s*;/i.test(token)) {
      current += token;
      statements.push(current.trim());
      current = "";
      insideTrigger = false;
    } else if (!insideTrigger && token === ";") {
      if (current.trim().length > 0) {
        statements.push(current.trim());
        current = "";
      }
    } else {
      current += token;
    }
  }

  if (current.trim().length > 0) {
    statements.push(current.trim());
  }

  return statements.filter(s => s.length > 0);
}

let migrated = false;

/**
 * Run migrations to ensure all 26 tables and immutability triggers exist.
 * No seed data is inserted. Fresh databases have 0 campaigns/creators/assets.
 */
export async function runMigrations(): Promise<void> {
  if (migrated) return;

  try {
    const schemaPath = path.join(process.cwd(), "src", "server", "db", "schema.sql");
    const rawSql = fs.readFileSync(schemaPath, "utf-8");
    const statements = parseSqlStatements(rawSql);

    for (const stmt of statements) {
      try {
        await db.execute(stmt);
      } catch (err: any) {
        // Ignore already exists / duplicate errors
        if (!err.message?.includes("already exists")) {
          console.warn("[DB Migration]", err.message, "in statement:", stmt.slice(0, 60));
        }
      }
    }

    migrated = true;
  } catch (err: any) {
    console.error("[DB Migration Fatal]", err);
    throw err;
  }
}
