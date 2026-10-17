import { createClient, type Client } from "@libsql/client";
import { randomUUID } from "crypto";

function getDatabaseUrl(): string {
  const envUrl = process.env.TURSO_DATABASE_URL?.trim();
  if (
    envUrl &&
    !envUrl.includes("SENSITIVE") &&
    (envUrl.startsWith("libsql://") ||
      envUrl.startsWith("https://") ||
      envUrl.startsWith("http://") ||
      envUrl.startsWith("file:") ||
      envUrl === ":memory:")
  ) {
    return envUrl;
  }
  return process.env.VERCEL === "1" ? ":memory:" : "file:local.db";
}

const dbUrl = getDatabaseUrl();
const rawToken = process.env.TURSO_AUTH_TOKEN?.trim();
const authToken = rawToken && !rawToken.includes("SENSITIVE") ? rawToken : undefined;

export const db: Client = createClient({
  url: dbUrl,
  authToken,
});

export function generateId(): string {
  return randomUUID();
}

/**
 * Execute raw SQL query with parameters and return typed rows
 */
export async function query<T = any>(sql: string, args: any[] = []): Promise<T[]> {
  const result = await db.execute({ sql, args });
  return result.rows as unknown as T[];
}

/**
 * Execute a single write statement
 */
export async function execute(sql: string, args: any[] = []) {
  return await db.execute({ sql, args });
}
