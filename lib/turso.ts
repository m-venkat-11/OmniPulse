import { createClient } from "@libsql/client";

// On Vercel (and other serverless runtimes) the filesystem is read-only.
// Fall back to an in-memory SQLite so the app always boots and the demo
// data is seeded fresh on every cold start.
const isVercel = process.env.VERCEL === "1";
const dbUrl = isVercel
  ? ":memory:"
  : (process.env.TURSO_DATABASE_URL || "file:local.db");

export const turso = createClient({
  url: dbUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
