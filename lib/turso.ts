import { createClient } from "@libsql/client";

// On Vercel (and other serverless runtimes) the filesystem is read-only.
// Fall back to an in-memory SQLite so the app always boots and the demo
// data is seeded fresh on every cold start.
const isVercel = process.env.VERCEL === "1";
const rawUrl = process.env.TURSO_DATABASE_URL?.trim();
const validUrl =
  rawUrl &&
  !rawUrl.includes("SENSITIVE") &&
  (rawUrl.startsWith("libsql://") ||
    rawUrl.startsWith("https://") ||
    rawUrl.startsWith("http://") ||
    rawUrl.startsWith("file:") ||
    rawUrl === ":memory:")
    ? rawUrl
    : undefined;

const dbUrl = validUrl || (isVercel ? ":memory:" : "file:local.db");
const rawToken = process.env.TURSO_AUTH_TOKEN?.trim();
const authToken = rawToken && !rawToken.includes("SENSITIVE") ? rawToken : undefined;

export const turso = createClient({
  url: dbUrl,
  authToken,
});
