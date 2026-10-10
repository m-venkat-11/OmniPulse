import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

const db = createClient({
  url: "file:local.db"
});

async function main() {
  const schemaPath = path.resolve("lib/db/schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf-8");

  const cleanedSql = schemaSql
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  const statements = cleanedSql
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Running ${statements.length} migration statements...`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await db.execute(stmt);
    } catch (e) {
      console.error(`Error on statement ${i}:`, stmt.slice(0, 50), e.message);
    }
  }

  console.log("Schema applied successfully!");

  // Verify tables
  const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table'");
  console.log("Tables created:", tables.rows.map(r => r.name));
}

main().catch(console.error);
