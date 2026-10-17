"use server";

import { db, generateId } from "@/src/server/db/client";
import { runMigrations } from "@/src/server/db/migrations";
import { hashPassword, createSession, isFirstRun } from "@/src/server/auth/session";
import { redirect } from "next/navigation";

export async function initializeFirstRunWorkspace(formData: FormData) {
  await runMigrations();

  const workspaceName = (formData.get("workspaceName") as string)?.trim() || "Default Workspace";
  const adminName = (formData.get("adminName") as string)?.trim();
  const adminEmail = (formData.get("adminEmail") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const company = (formData.get("company") as string)?.trim() || "";

  if (!adminName || !adminEmail || !password) {
    redirect("/setup?error=" + encodeURIComponent("Please provide admin name, email and password."));
  }

  if (password.length < 8) {
    redirect("/setup?error=" + encodeURIComponent("Password must be at least 8 characters long."));
  }

  const workspaceId = generateId();
  const pwdHash = hashPassword(password);

  // 1. Create Workspace
  await db.execute({
    sql: `INSERT INTO workspaces (id, name, retention_policy) VALUES (?, ?, 'standard_365d')`,
    args: [workspaceId, workspaceName],
  });

  // 2. Check if user already exists
  const existingUserRes = await db.execute({
    sql: `SELECT id FROM users WHERE email = ? LIMIT 1`,
    args: [adminEmail],
  });

  let userId: string;
  if (existingUserRes.rows.length > 0) {
    userId = String(existingUserRes.rows[0].id);
    await db.execute({
      sql: `UPDATE users SET password_hash = ?, name = ?, role = 'Admin', company = ? WHERE id = ?`,
      args: [pwdHash, adminName, company, userId],
    });
  } else {
    userId = generateId();
    await db.execute({
      sql: `INSERT INTO users (id, email, password_hash, name, role, company) VALUES (?, ?, ?, ?, 'Admin', ?)`,
      args: [userId, adminEmail, pwdHash, adminName, company],
    });
  }

  // 3. Add to Workspace Members
  await db.execute({
    sql: `INSERT OR REPLACE INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, 'Admin')`,
    args: [workspaceId, userId],
  });

  // 4. Create initial empty Brand Profile
  await db.execute({
    sql: `INSERT INTO brand_profiles (id, workspace_id, brand_voice, approved_terms_json, prohibited_terms_json, version)
          VALUES (?, ?, '', '[]', '[]', 1)`,
    args: [generateId(), workspaceId],
  });

  // 5. Establish Session & Redirect to Dashboard
  await createSession(userId, workspaceId);

  redirect("/dashboard");
}
