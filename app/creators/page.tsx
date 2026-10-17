import React from "react";
import { getCurrentUser } from "@/src/server/auth/session";
import { redirect } from "next/navigation";
import { creatorService } from "@/src/server/services/creatorService";
import { AppShell } from "@/components/shell/AppShell";
import { CreatorWorkspaceClient } from "./CreatorWorkspaceClient";

export default async function CreatorWorkspacePage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/sign-in");
  }

  const creators = await creatorService.listCreators(session.workspace.id);

  return (
    <AppShell
      userName={session.user.name}
      userRole={session.role}
      workspaceName={session.workspace.name}
      primaryActionLabel="New Campaign"
      primaryActionHref="/campaigns/new"
    >
      <CreatorWorkspaceClient initialCreators={creators} />
    </AppShell>
  );
}
