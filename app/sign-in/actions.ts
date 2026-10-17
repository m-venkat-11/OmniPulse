"use server";

import { db } from "@/src/server/db/client";
import { runMigrations } from "@/src/server/db/migrations";
import { verifyPassword, createSession } from "@/src/server/auth/session";
import { redirect } from "next/navigation";

export async function signInAction(formData: FormData) {
  await runMigrations();

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect("/sign-in?error=" + encodeURIComponent("Please provide both email and password."));
  }

  const res = await db.execute({
    sql: `SELECT u.id, u.password_hash, wm.workspace_id
          FROM users u
          LEFT JOIN workspace_members wm ON wm.user_id = u.id
          WHERE u.email = ?
          LIMIT 1`,
    args: [email],
  });

  if (res.rows.length === 0) {
    redirect("/sign-in?error=" + encodeURIComponent("Invalid email or password."));
  }

  const row = res.rows[0];
  const isValid = verifyPassword(password, String(row.password_hash));
  if (!isValid) {
    redirect("/sign-in?error=" + encodeURIComponent("Invalid email or password."));
  }

  const workspaceId = String(row.workspace_id || "");
  await createSession(String(row.id), workspaceId);

  redirect("/dashboard");
}
