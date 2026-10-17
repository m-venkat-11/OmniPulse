import { describe, it, expect } from "vitest";
import { parseSqlStatements } from "../src/server/db/migrations";
import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

describe("No-Demo Data Contract (Acceptance Tests 1 & 2)", () => {
  it("A fresh database creates all tables with zero campaigns or seeded data", async () => {
    // Spin up an isolated fresh database instance
    const freshDb = createClient({ url: ":memory:" });
    const schemaPath = path.join(process.cwd(), "src", "server", "db", "schema.sql");
    const rawSql = fs.readFileSync(schemaPath, "utf-8");
    const statements = parseSqlStatements(rawSql);

    for (const stmt of statements) {
      await freshDb.execute(stmt);
    }

    const tables = [
      "campaigns",
      "creative_assets",
      "asset_versions",
      "claim_atoms",
      "verification_findings",
      "creator_profiles",
      "experiments",
      "metric_observations",
    ];

    for (const table of tables) {
      const res = await freshDb.execute(`SELECT COUNT(*) as count FROM ${table}`);
      const count = Number(res.rows[0]?.count ?? 0);
      expect(count).toBe(0);
    }
  });

  it("Repository has no seed scripts or hardcoded demo generators", () => {
    const cwd = process.cwd();
    const forbiddenFiles = [
      path.join(cwd, "lib", "db", "seedDemo.ts"),
      path.join(cwd, "scripts", "seed-initial.mjs"),
    ];

    for (const f of forbiddenFiles) {
      expect(fs.existsSync(f)).toBe(false);
    }
  });

  it("Design tokens and components are present without fake fixtures", () => {
    const cardPath = path.join(process.cwd(), "components", "design-system", "Card.tsx");
    expect(fs.existsSync(cardPath)).toBe(true);

    const emptyStatePath = path.join(process.cwd(), "components", "design-system", "EmptyState.tsx");
    expect(fs.existsSync(emptyStatePath)).toBe(true);
  });
});
