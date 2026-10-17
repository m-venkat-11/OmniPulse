import { createClient, type Client } from "@libsql/client";
import { randomUUID } from "crypto";

const isVercel = process.env.VERCEL === "1";
const dbUrl = process.env.TURSO_DATABASE_URL || (isVercel ? ":memory:" : "file:local.db");

export const db: Client = createClient({
  url: dbUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
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
